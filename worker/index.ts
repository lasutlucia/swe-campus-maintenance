interface Env {
  DB: D1Database;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. GET /api/health
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ status: "ok" });
    }

    // POST /api/login
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const body = await request.json() as { username?: string; password?: string; role?: string };
        const { username, password, role } = body;

        if (!username || !password) {
          return json({ error: "Username dan password wajib diisi." }, 400);
        }

        const hashed = await sha256(password);
        const user = await env.DB.prepare(
          "SELECT role, fullname FROM users WHERE LOWER(username) = LOWER(?) AND (password_hash = ? OR password_hash = ?)"
        ).bind(username.trim(), hashed, password).first() as { role: string; fullname: string } | null;

        if (!user) {
          return json({ error: "Username atau password salah." }, 401);
        }

        // Validate if selected role matches database role
        const dbRole = user.role ? user.role.toUpperCase().trim() : "";
        const reqRole = role ? role.toUpperCase().trim() : "";

        let matched = false;
        if (reqRole === "PELAPOR") {
          matched = (dbRole === "MAHASISWA" || dbRole === "DOSEN" || dbRole === "PELAPOR");
        } else if (reqRole === "ADMINISTRATOR") {
          matched = (dbRole === "ADMINISTRATOR" || dbRole === "ADMIN");
        } else if (reqRole === "TEKNISI") {
          matched = (dbRole === "TEKNISI");
        } else if (reqRole === "MANAJER FASILITAS" || reqRole === "MANAJER" || reqRole === "MANAGER") {
          matched = (dbRole === "MANAJER" || dbRole === "MANAGER");
        }

        if (!matched) {
          return json({ error: "Akun Anda tidak terdaftar sebagai peran " + (role || "") + "." }, 401);
        }

        return json({
          role: user.role,
          name: user.fullname
        });
      } catch (err: any) {
        return json({ error: "Terjadi kesalahan server saat mencoba login: " + err.message }, 500);
      }
    }

    // GET /api/technicians
    if (url.pathname === "/api/technicians" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          "SELECT username, fullname FROM users WHERE LOWER(role) = 'teknisi'"
        ).all() as { results: { username: string; fullname: string }[] };
        return json({ data: result.results || [] });
      } catch (err: any) {
        return json({ error: "Gagal memuat daftar teknisi: " + err.message }, 500);
      }
    }

    // 2. GET /api/requests
    if (url.pathname === "/api/requests" && request.method === "GET") {
      const search = url.searchParams.get("search");
      const status = url.searchParams.get("status");
      const category = url.searchParams.get("category");
      const technician = url.searchParams.get("technician");

      let query = "SELECT * FROM service_requests WHERE 1=1";
      const params: string[] = [];

      if (search) {
        query += " AND (title LIKE ? OR location LIKE ? OR request_number LIKE ? OR category LIKE ?)";
        const wildcard = `%${search}%`;
        params.push(wildcard, wildcard, wildcard, wildcard);
      }
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      if (category) {
        query += " AND category = ?";
        params.push(category);
      }
      if (technician) {
        query += " AND assigned_technician = ?";
        params.push(technician);
      }

      query += " ORDER BY created_at DESC";

      const result = await env.DB.prepare(query).bind(...params).all();
      return json({ data: result.results });
    }

    // 3. POST /api/requests
    if (url.pathname === "/api/requests" && request.method === "POST") {
      const body = await request.json() as {
        title?: string;
        description?: string;
        location?: string;
        category?: string;
      };

      const { title, description, location, category } = body;

      if (!title || !description || !location || !category) {
        return json({ error: "Semua field wajib diisi." }, 422);
      }

      if (description.trim().length < 20) {
        return json({ error: "Deskripsi minimal 20 karakter." }, 422);
      }

      const id = crypto.randomUUID();
      const requestNumber = `CSR-${Date.now()}`;

      // Insert service request
      await env.DB.prepare(`
        INSERT INTO service_requests (id, request_number, title, description, location, category, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, 'NONE', 'SUBMITTED')
      `).bind(
        id,
        requestNumber,
        title.trim(),
        description.trim(),
        location.trim(),
        category.trim()
      ).run();

      // Log initial status in status_history
      const historyId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO status_history (id, request_id, old_status, new_status, changed_by_role, changed_by_name)
        VALUES (?, ?, 'NONE', 'SUBMITTED', 'Pelapor', 'Sistem')
      `).bind(historyId, id).run();

      return json({ id, requestNumber, status: "SUBMITTED" }, 201);
    }

    // Path parsing for details, comments, and status
    const reqMatch = url.pathname.match(/^\/api\/requests\/([^\/]+)(?:\/(comments|status))?$/);
    if (reqMatch) {
      const id = reqMatch[1];
      const subRoute = reqMatch[2];

      // 4. GET /api/requests/:id
      if (!subRoute && request.method === "GET") {
        const reqResult = await env.DB.prepare("SELECT * FROM service_requests WHERE id = ?").bind(id).first();
        if (!reqResult) {
          return json({ error: "Laporan tidak ditemukan." }, 404);
        }

        const commentsResult = await env.DB.prepare("SELECT * FROM comments WHERE request_id = ? ORDER BY created_at ASC").bind(id).all();
        const historyResult = await env.DB.prepare("SELECT * FROM status_history WHERE request_id = ? ORDER BY created_at ASC").bind(id).all();

        return json({
          data: {
            request: reqResult,
            comments: commentsResult.results,
            status_history: historyResult.results
          }
        });
      }

      // 5. POST /api/requests/:id/comments
      if (subRoute === "comments" && request.method === "POST") {
        const role = request.headers.get("X-User-Role") || "Pelapor";
        const name = request.headers.get("X-User-Name") || "Anonim";
        const body = await request.json() as { content?: string };
        const { content } = body;

        if (!content || !content.trim()) {
          return json({ error: "Komentar tidak boleh kosong." }, 422);
        }

        const reqExists = await env.DB.prepare("SELECT 1 FROM service_requests WHERE id = ?").bind(id).first();
        if (!reqExists) {
          return json({ error: "Laporan tidak ditemukan." }, 404);
        }

        const commentId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO comments (id, request_id, author_name, author_role, content)
          VALUES (?, ?, ?, ?, ?)
        `).bind(commentId, id, name.trim(), role.trim(), content.trim()).run();

        return json({
          id: commentId,
          request_id: id,
          author_name: name.trim(),
          author_role: role.trim(),
          content: content.trim(),
          created_at: new Date().toISOString()
        }, 201);
      }

      // 6. PUT /api/requests/:id/status
      if (subRoute === "status" && request.method === "PUT") {
        const role = request.headers.get("X-User-Role") || "Pelapor";
        const name = request.headers.get("X-User-Name") || "Anonim";
        const body = await request.json() as {
          status?: string;
          priority?: string;
          category?: string;
          assigned_technician?: string | null;
        };

        const { status, priority, category, assigned_technician } = body;

        const current = await env.DB.prepare("SELECT * FROM service_requests WHERE id = ?").bind(id).first() as {
          status: string;
          priority: string;
          category: string;
          assigned_technician: string | null;
        } | null;

        if (!current) {
          return json({ error: "Laporan tidak ditemukan." }, 404);
        }

        // Validate business rules
        if (role === "Pelapor") {
          if (status && status !== current.status) {
            return json({ error: "Pelapor tidak memiliki hak untuk mengubah status secara langsung." }, 400);
          }
        }

        if (role === "Teknisi") {
          if (current.assigned_technician !== name) {
            return json({ error: "Teknisi hanya dapat mengubah status laporan yang ditugaskan kepada dirinya sendiri." }, 400);
          }
          if (status && status !== "IN PROGRESS" && status !== "RESOLVED") {
            return json({ error: "Teknisi hanya diperbolehkan mengubah status menjadi IN PROGRESS atau RESOLVED." }, 400);
          }
        }

        if (role === "Administrator") {
          if (status === "CLOSED" && current.status !== "RESOLVED") {
            return json({ error: "Laporan hanya dapat ditutup jika status pekerjaan saat ini adalah RESOLVED." }, 400);
          }
        }

        let updateQuery = "UPDATE service_requests SET ";
        const updateFields: string[] = [];
        const updateParams: unknown[] = [];

        if (status && status !== current.status) {
          updateFields.push("status = ?");
          updateParams.push(status);
        }

        if (priority && priority !== current.priority) {
          const isAdmin = (role === "Administrator" || role === "ADMIN");
          const isAssignedTech = (role === "Teknisi" && current.assigned_technician === name);
          if (!isAdmin && !isAssignedTech) {
            return json({ error: "Hanya Administrator atau Staf Teknisi yang ditugaskan yang dapat menentukan tingkat prioritas." }, 400);
          }
          updateFields.push("priority = ?");
          updateParams.push(priority);
        }

        if (category && category !== current.category) {
          if (role !== "Administrator") {
            return json({ error: "Hanya Administrator yang dapat mengubah kategori." }, 400);
          }
          updateFields.push("category = ?");
          updateParams.push(category);
        }

        if (assigned_technician !== undefined && assigned_technician !== current.assigned_technician) {
          if (role !== "Administrator") {
            return json({ error: "Hanya Administrator yang dapat menugaskan teknisi." }, 400);
          }
          updateFields.push("assigned_technician = ?");
          updateParams.push(assigned_technician);

          // Auto change status from SUBMITTED / UNDER REVIEW to ASSIGNED
          if (assigned_technician && (current.status === "SUBMITTED" || current.status === "UNDER REVIEW") && !status) {
            updateFields.push("status = ?");
            updateParams.push("ASSIGNED");
          }
        }

        if (updateFields.length > 0) {
          updateQuery += updateFields.join(", ") + " WHERE id = ?";
          updateParams.push(id);
          await env.DB.prepare(updateQuery).bind(...updateParams).run();

          const finalStatus = status || (assigned_technician && (current.status === "SUBMITTED" || current.status === "UNDER REVIEW") ? "ASSIGNED" : current.status);
          if (finalStatus !== current.status) {
            const historyId = crypto.randomUUID();
            await env.DB.prepare(`
              INSERT INTO status_history (id, request_id, old_status, new_status, changed_by_role, changed_by_name)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(historyId, id, current.status, finalStatus, role, name).run();
          }
        }

        return json({
          message: "Laporan berhasil diperbarui.",
          status: status || current.status,
          priority: priority || current.priority,
          assigned_technician: assigned_technician !== undefined ? assigned_technician : current.assigned_technician
        });
      }
    }

    return json({ error: "Alamat API tidak ditemukan." }, 404);
  },
} satisfies ExportedHandler<Env>;

