import { useEffect, useState } from "react";
import "./App.css";

type ServiceRequest = {
  id: string;
  request_number: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  assigned_technician: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
};

type StatusHistory = {
  id: string;
  old_status: string;
  new_status: string;
  changed_by_role: string;
  changed_by_name: string;
  created_at: string;
};

type RequestDetail = {
  request: ServiceRequest;
  comments: Comment[];
  status_history: StatusHistory[];
};

export default function App() {
  // Theme Toggle State (Light / Dark)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Authentication State (Simulated)
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [activeRole, setActiveRole] = useState(() => sessionStorage.getItem("activeRole") || "Pelapor");
  const [activeName, setActiveName] = useState(() => sessionStorage.getItem("activeName") || "Pelapor");

  // Login Form State
  const [loginRole, setLoginRole] = useState("Pelapor");
  const [loginStep, setLoginStep] = useState<"role" | "credentials">("role");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lists & Filters
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [dbTechnicians, setDbTechnicians] = useState<{ username: string; fullname: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal / Panel
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<RequestDetail | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");

  // Comment Text
  const [commentText, setCommentText] = useState("");

  // Feedbacks
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Apply Theme class to document body
  useEffect(() => {
    document.body.className = "theme-" + theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync active user identity and settings to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("activeRole", activeRole);
    sessionStorage.setItem("activeName", activeName);

    // Clean details panel to prevent cross-role actions
    setSelectedRequestId(null);
    setDetailData(null);
  }, [activeRole, activeName]);

  // Load requests
  async function loadRequests() {
    try {
      const url = new URL("/api/requests", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);



      const response = await fetch(url.toString());
      const result = await response.json();
      if (response.ok) {
        setRequests(result.data || []);
      } else {
        setErrorMessage(result.error || "Gagal memuat daftar laporan.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat memuat laporan.");
    }
  }

  // Load selected request detail (comments & log history)
  async function loadRequestDetail(id: string) {
    try {
      const response = await fetch(`/api/requests/${id}`);
      const result = await response.json();
      if (response.ok) {
        setDetailData(result.data);
      } else {
        setErrorMessage(result.error || "Gagal memuat detail laporan.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat memuat detail laporan.");
    }
  }

  // Load technicians list from database
  async function loadTechnicians() {
    try {
      const response = await fetch("/api/technicians");
      const result = await response.json();
      if (response.ok) {
        setDbTechnicians(result.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat teknisi:", err);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    loadRequests();
    loadTechnicians();

    const interval = setInterval(() => {
      loadRequests();
    }, 4000);

    return () => clearInterval(interval);
  }, [searchQuery, activeRole, activeName, isLoggedIn]);

  useEffect(() => {
    if (!selectedRequestId || !isLoggedIn) return;
    loadRequestDetail(selectedRequestId);

    const interval = setInterval(() => {
      loadRequestDetail(selectedRequestId);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedRequestId, isLoggedIn]);

  // Perform database-driven login check
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role: loginRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || "Nama pengguna atau kata sandi salah.");
        setLoginFailed(true);
        setTimeout(() => setLoginFailed(false), 500);
        return;
      }

      // Map role from DB to frontend activeRole format (Case-insensitive)
      const roleUpper = result.role ? result.role.toUpperCase().trim() : "";
      let mappedRole = "Pelapor";
      
      if (roleUpper === "ADMINISTRATOR" || roleUpper === "ADMIN") {
        mappedRole = "Administrator";
      } else if (roleUpper === "TEKNISI") {
        mappedRole = "Teknisi";
      } else if (roleUpper === "MANAJER" || roleUpper === "MANAGER" || roleUpper === "MANAJER FASILITAS" || roleUpper === "FACILITY MANAGER") {
        mappedRole = "Manajer Fasilitas";
      } else {
        mappedRole = "Pelapor"; // Mahasiswa, Dosen, Pelapor default to student dashboard
      }

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("activeRole", mappedRole);
      sessionStorage.setItem("activeName", result.name);

      setActiveRole(mappedRole);
      setActiveName(result.name);
      setIsLoggedIn(true);
      setUsername("");
      setPassword("");
    } catch (err) {
      setLoginError("Terjadi kesalahan jaringan saat mencoba masuk.");
      setLoginFailed(true);
      setTimeout(() => setLoginFailed(false), 500);
    }
  }

  // Logout session
  function handleLogout() {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setSelectedRequestId(null);
    setDetailData(null);
    setSuccessMessage("");
    setErrorMessage("");
    setLoginStep("role");
    setUsername("");
    setPassword("");
  }

  // Form submission: Create new report
  async function handleSubmitRequest(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location: `${building.trim()} - ${room.trim()}`, category: "Umum" }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Gagal membuat laporan.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(`Laporan berhasil dikirim! Nomor Tiket: ${result.requestNumber}`);
      setTitle("");
      setDescription("");
      setBuilding("");
      setRoom("");
      await loadRequests();
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Submit comment
  async function handleSubmitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentText.trim() || !selectedRequestId) return;

    try {
      const response = await fetch(`/api/requests/${selectedRequestId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": activeRole.startsWith("Teknisi") ? "Teknisi" : activeRole,
          "X-User-Name": activeName,
        },
        body: JSON.stringify({ content: commentText }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Gagal mengirim komentar.");
        return;
      }

      setCommentText("");
      loadRequestDetail(selectedRequestId);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat mengirim komentar.");
    }
  }

  // Reporter confirms resolution
  async function handleConfirmResolved() {
    if (!selectedRequestId) return;
    try {
      const response = await fetch(`/api/requests/${selectedRequestId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": activeRole,
          "X-User-Name": activeName,
        },
        body: JSON.stringify({ content: "Pelapor mengonfirmasi bahwa perbaikan telah selesai dilaksanakan dengan baik." }),
      });
      if (response.ok) {
        setSuccessMessage("Terima kasih! Konfirmasi perbaikan Anda telah berhasil dicatat.");
        loadRequestDetail(selectedRequestId);
      } else {
        setErrorMessage("Gagal mengirimkan konfirmasi.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat mengirim konfirmasi.");
    }
  }

  // Update Status / Priority / Category / Assignee
  async function handleUpdateStatus(
    statusUpdate?: string,
    priorityUpdate?: string,
    categoryUpdate?: string,
    technicianUpdate?: string | null
  ) {
    if (!selectedRequestId) return;

    try {
      const payload: any = {};
      if (statusUpdate !== undefined) payload.status = statusUpdate;
      if (priorityUpdate !== undefined) payload.priority = priorityUpdate;
      if (categoryUpdate !== undefined) payload.category = categoryUpdate;
      if (technicianUpdate !== undefined) payload.assigned_technician = technicianUpdate;

      const response = await fetch(`/api/requests/${selectedRequestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": activeRole.startsWith("Teknisi") ? "Teknisi" : activeRole,
          "X-User-Name": activeName,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || "Gagal memperbarui laporan.");
        return;
      }

      setSuccessMessage("Detail laporan berhasil diperbarui.");
      loadRequestDetail(selectedRequestId);
      loadRequests();
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat memperbarui laporan.");
    }
  }

  // Visual Formatter Helpers
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "SUBMITTED": return "badge-status-submitted";
      case "UNDER REVIEW": return "badge-status-review";
      case "ASSIGNED": return "badge-status-assigned";
      case "IN PROGRESS": return "badge-status-progress";
      case "RESOLVED": return "badge-status-resolved";
      case "CLOSED": return "badge-status-closed";
      default: return "";
    }
  }

  function getPriorityBadgeClass(priority: string) {
    switch (priority) {
      case "NONE": return "badge-priority-none";
      case "LOW": return "badge-priority-low";
      case "MEDIUM": return "badge-priority-medium";
      case "HIGH": return "badge-priority-high";
      default: return "";
    }
  }

  function formatDate(isoString: string) {
    if (!isoString) return "";
    let parsedString = isoString.trim();
    // Normalize SQLite YYYY-MM-DD HH:MM:SS format to ISO-8601 YYYY-MM-DDTHH:MM:SSZ (UTC)
    if (!parsedString.includes("Z") && !parsedString.includes("+")) {
      parsedString = parsedString.replace(" ", "T") + "Z";
    }
    const date = new Date(parsedString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Makassar", // WITA timezone (UTC+8)
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WITA";
  }

  // Stepper helper
  function getStepClass(stepStatus: string, currentStatus: string) {
    const order = ["SUBMITTED", "UNDER REVIEW", "ASSIGNED", "IN PROGRESS", "RESOLVED", "CLOSED"];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "step-node completed";
    if (stepIndex === currentIndex) return "step-node active";
    return "step-node";
  }

  // CSS bar chart calculator for manager stats
  const totalCount = requests.length;
  function getCategoryStats(catName: string) {
    const count = requests.filter(r => r.category === catName).length;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { count, percentage };
  }

  function getCategoriesList() {
    const defaultCategories = ["AC", "Listrik", "Internet", "Kebersihan", "Sipil"];
    const list = [...defaultCategories];
    requests.forEach(r => {
      const cat = r.category || "Umum";
      if (!list.includes(cat)) {
        list.push(cat);
      }
    });
    return list;
  }

  function isSearchMatch(req: ServiceRequest) {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase().trim();
    return (
      (req.title || "").toLowerCase().includes(query) ||
      (req.location || "").toLowerCase().includes(query) ||
      (req.request_number || "").toLowerCase().includes(query)
    );
  }

  // Get sorted requests for search priority
  function getSortedRequests() {
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase().trim();
    return [...requests].sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aLoc = (a.location || "").toLowerCase();
      const bLoc = (b.location || "").toLowerCase();
      const aNum = (a.request_number || "").toLowerCase();
      const bNum = (b.request_number || "").toLowerCase();

      const aContains = aTitle.includes(query) || aLoc.includes(query) || aNum.includes(query);
      const bContains = bTitle.includes(query) || bLoc.includes(query) || bNum.includes(query);

      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      return 0;
    });
  }

  // Render Login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="app-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh", textAlign: "center" }}>
        <div className={`panel ${loginFailed ? "shake-error" : ""}`} style={{ width: "100%", maxWidth: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px", width: "100%" }}>
            <div className="brand-section" style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left", flex: 1 }}>
              <div className="brand-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "24px", height: "24px", color: "#fff" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83m-3.75 3.75l-3.75-3.75m3.75 3.75l1.58-1.58m-5.33-2.17l-5.83-5.83A2.67 2.67 0 015.75 3L11.58 8.83m-3.75 3.75l3.75 3.75m-3.75-3.75l-1.58 1.58m5.33 2.17l5.83 5.83A2.67 2.67 0 0118.25 21l-5.83-5.83m-3.75-3.75l3.75-3.75" />
                </svg>
              </div>
              <div className="brand-text">
                <h1>Campus Maintenance</h1>
                <p>{loginStep === "role" ? "Pilih peran Anda untuk masuk" : "Masukkan kredensial akun Anda"}</p>
              </div>
            </div>
            {/* Theme switcher */}
            <button
              className="button-secondary"
              style={{ padding: "8px", borderRadius: "50%", flexShrink: 0 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.364-6.364l-1.591 1.591M6.009 17.99l-1.591 1.591m12.982 0l-1.591-1.591M6.009 6.009L4.418 4.418m11.582 11.582A9 9 0 113.63 8.368a9 9 0 0012.37 12.37z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
          {loginError && (
            <div className="alert alert-error" style={{ padding: "10px 14px", fontSize: "13px" }}>
              {loginError}
            </div>
          )}

          {loginStep === "role" ? (
            <div className="role-selection-grid">
              <button
                type="button"
                className="role-button"
                onClick={() => {
                  setLoginRole("Pelapor");
                  setLoginStep("credentials");
                  setLoginError("");
                }}
              >
                <span className="role-button-title">👤 Pelapor (Mahasiswa/Dosen)</span>
                <span className="role-button-arrow">➔</span>
              </button>
              <button
                type="button"
                className="role-button"
                onClick={() => {
                  setLoginRole("Teknisi");
                  setLoginStep("credentials");
                  setLoginError("");
                }}
              >
                <span className="role-button-title">🛠️ Staf Teknisi</span>
                <span className="role-button-arrow">➔</span>
              </button>
              <button
                type="button"
                className="role-button"
                onClick={() => {
                  setLoginRole("Administrator");
                  setLoginStep("credentials");
                  setLoginError("");
                }}
              >
                <span className="role-button-title">⚙️ Administrator</span>
                <span className="role-button-arrow">➔</span>
              </button>
              <button
                type="button"
                className="role-button"
                onClick={() => {
                  setLoginRole("Manajer Fasilitas");
                  setLoginStep("credentials");
                  setLoginError("");
                }}
              >
                <span className="role-button-title">📊 Manajer Fasilitas (FM)</span>
                <span className="role-button-arrow">➔</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <button
                type="button"
                className="back-to-roles-btn"
                onClick={() => {
                  setLoginStep("role");
                  setLoginError("");
                }}
              >
                ← Kembali ke Pemilihan Peran
              </button>

              <h2 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "20px", color: "var(--accent-color)" }}>
                Masuk sebagai {loginRole === "Manajer Fasilitas" ? "Manajer Fasilitas (FM)" : loginRole === "Pelapor" ? "Pelapor (Mahasiswa/Dosen)" : loginRole === "Administrator" ? "Administrator" : "Staf Teknisi"}
              </h2>

              <div className="form-group">
                <label className="form-label">Nama Pengguna (Username)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan username Anda..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi / Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Masukkan password Anda..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="button-primary">Masuk Aplikasi</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header and Switcher Controls */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "24px", height: "24px", color: "#fff" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83m-3.75 3.75l-3.75-3.75m3.75 3.75l1.58-1.58m-5.33-2.17l-5.83-5.83A2.67 2.67 0 015.75 3L11.58 8.83m-3.75 3.75l3.75 3.75m-3.75-3.75l-1.58 1.58m5.33 2.17l5.83 5.83A2.67 2.67 0 0118.25 21l-5.83-5.83m-3.75-3.75l3.75-3.75" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>Campus Service Request</h1>
            <p>Sistem Pemeliharaan Sarana & Prasarana Kampus</p>
        </div>
      </div>

        {/* Action controllers (Theme, User Profile, Logout) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* User Profile name tag */}
          <span style={{ fontSize: "13px", fontWeight: "700", opacity: "0.9" }}>
            👤 {activeName}
          </span>

          {/* Theme switcher */}
          <button
            className="button-secondary"
            style={{ padding: "8px", borderRadius: "50%" }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.364-6.364l-1.591 1.591M6.009 17.99l-1.591 1.591m12.982 0l-1.591-1.591M6.009 6.009L4.418 4.418m11.582 11.582A9 9 0 113.63 8.368a9 9 0 0012.37 12.37z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          {/* Log Out button */}
          <button
            className="button-secondary"
            style={{ borderColor: "rgba(244, 63, 94, 0.3)", color: "#f87171" }}
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="alert alert-success" style={{ margin: "0 0 24px 0" }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error" style={{ margin: "0 0 24px 0" }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Regular views render based on role */}
      {activeRole === "Manajer Fasilitas" ? (
        <div>
          {/* Dashboard Summary cards */}
          <div className="dashboard-cards">
            <div className="card">
              <span className="card-title">Total Aduan Masuk</span>
              <span className="card-value">{totalCount}</span>
              <span className="card-desc">Laporan terdaftar di database D1</span>
            </div>
            <div className="card">
              <span className="card-title">Dalam Pengerjaan</span>
              <span className="card-value">
                {requests.filter(r => ["UNDER REVIEW", "ASSIGNED", "IN PROGRESS"].includes(r.status)).length}
              </span>
              <span className="card-desc">Laporan sedang direview/diperbaiki</span>
            </div>
            <div className="card">
              <span className="card-title">Tuntas Terselesaikan</span>
              <span className="card-value">
                {requests.filter(r => ["RESOLVED", "CLOSED"].includes(r.status)).length}
              </span>
              <span className="card-desc">Log laporan status Resolved dan Closed</span>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* CSS-based Category Chart breakdown */}
            <div className="panel">
              <h2 className="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                Statistik Kategori
              </h2>
              <p className="text-secondary" style={{ fontSize: "13px" }}>Persentase kontribusi laporan berdasarkan kategori fasilitas:</p>
              <div className="chart-bar-container">
                {getCategoriesList().map(catName => {
                  const stats = getCategoryStats(catName);
                  return (
                    <div className="chart-bar-row" key={catName}>
                      <span className="chart-bar-label">{catName}</span>
                      <div className="chart-bar-outer">
                        <div className="chart-bar-inner" style={{ width: `${stats.percentage}%` }}></div>
                      </div>
                      <span className="chart-bar-value">{stats.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reports table */}
            <div className="panel">
              <h2 className="panel-title">Ringkasan Laporan Kampus (FM View)</h2>
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>No. Tiket</th>
                      <th>Laporan</th>
                      <th>Lokasi</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-muted" style={{ textAlign: "center" }}>
                          Belum ada laporan kerusakan yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      getSortedRequests().map((req) => (
                        <tr 
                          key={req.id} 
                          className={`${selectedRequestId === req.id ? "active-row" : ""} ${isSearchMatch(req) ? "search-match-row" : ""}`.trim()}
                          onClick={() => setSelectedRequestId(req.id)}
                        >
                          <td className="text-bold">{req.request_number}</td>
                          <td>{req.title}</td>
                          <td>{req.location}</td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                              {req.priority === "NONE" ? "Belum Ditentukan" : req.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="comment-btn-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestId(req.id);
                              }}
                              title="Buka Komentar Laporan"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "13px", height: "13px", display: "inline-block" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.48 4.48 0 00-.224-.275C2.662 17.29 1 14.836 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                              </svg>
                              Komentar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Roles (Pelapor, Admin, Teknisi) layout grid */
        <div className="dashboard-grid">
          {/* Left Column: Form Laporan or Info card */}
          <div>
            {activeRole === "Pelapor" ? (
              <div className="panel">
                <h2 className="panel-title">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Buat Aduan Baru
                </h2>
                <form onSubmit={handleSubmitRequest}>
                  <div className="form-group">
                    <label className="form-label">Laporan Kerusakan</label>
                    <input
                      type="text"
                      className={`form-input ${title.trim().length > 0 ? "valid" : ""}`}
                      placeholder="Contoh: AC B302 Bocor"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi Kerusakan (Min. 20 Karakter)</label>
                    <textarea
                      className={`form-textarea ${description.trim().length >= 20 ? "valid" : ""}`}
                      placeholder="Uraikan detail kerusakan fasilitas agar memudahkan teknisi memeriksa..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>
                      <span style={{ color: description.trim().length >= 20 ? "#10b981" : "#f43f5e" }}>
                        {description.trim().length >= 20 
                          ? "✓ Deskripsi memenuhi syarat" 
                          : `Minimal 20 karakter: ${description.trim().length}/20`}
                      </span>
                    </div>
                    <div className="char-counter-bar-outer">
                      <div 
                        className={`char-counter-bar-inner ${description.trim().length >= 20 ? "valid" : ""}`}
                        style={{ width: `${Math.min(100, (description.trim().length / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Lokasi Gedung</label>
                      <input
                        type="text"
                        className={`form-input ${building.trim().length > 0 ? "valid" : ""}`}
                        placeholder="Contoh: Gedung B"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lokasi Ruangan</label>
                      <input
                        type="text"
                        className={`form-input ${room.trim().length > 0 ? "valid" : ""}`}
                        placeholder="Contoh: Ruang 302"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="button-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        Mengirim... <span className="spinner"></span>
                      </>
                    ) : "Kirim Laporan"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="panel">
                <h2 className="panel-title">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Informasi Akun
                </h2>
                <div style={{ background: "rgba(9, 9, 11, 0.3)", padding: "16px", borderRadius: "8px", border: "1px solid var(--panel-border)" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700" }}>{activeName}</p>
                  <p className="text-secondary" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "600", color: "var(--accent-color)" }}>
                    {activeRole.startsWith("Teknisi") ? "Staf Teknisi" : "Staf Administrator"}
                  </p>
                </div>
                <p className="text-secondary" style={{ fontSize: "13px", marginTop: "16px" }}>
                  {activeRole.startsWith("Teknisi") 
                    ? "Pilihlah salah satu baris tugas Anda di tabel sebelah kanan untuk memperbarui progres perbaikan."
                    : "Pilihlah baris laporan aduan di tabel sebelah kanan untuk meninjau status, mengatur prioritas, dan menugaskan teknisi."}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: List of reports with Search/Filters */}
          <div className="panel">
            <h2 className="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.75 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Daftar Laporan Pengaduan
            </h2>

            <div className="controls-row">
              <input
                type="text"
                className="form-input search-input"
                placeholder="Cari nomor tiket, judul, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="button-clear-filters"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  title="Bersihkan Filter"
                >
                  ❌ Hapus
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>No. Tiket</th>
                    <th>Laporan</th>
                    <th>Lokasi</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted" style={{ textAlign: "center" }}>
                        Tidak ada laporan aduan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    getSortedRequests().map((req) => (
                      <tr 
                        key={req.id} 
                        className={`${selectedRequestId === req.id ? "active-row" : ""} ${isSearchMatch(req) ? "search-match-row" : ""}`.trim()}
                        onClick={() => setSelectedRequestId(req.id)}
                      >
                        <td className="text-bold">{req.request_number}</td>
                        <td>{req.title}</td>
                        <td>{req.location}</td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                            {req.priority === "NONE" ? "Belum Ditentukan" : req.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="comment-btn-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequestId(req.id);
                            }}
                            title="Buka Komentar Laporan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "13px", height: "13px", display: "inline-block" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.48 4.48 0 00-.224-.275C2.662 17.29 1 14.836 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                            Komentar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selected request detail visual modal panel */}
      {selectedRequestId && detailData && (
        <div className="detail-layout">
          {/* Main detailed view container */}
          <div className="detail-main">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span className="text-bold" style={{ fontSize: "20px" }}>
                {detailData.request.request_number}: {detailData.request.title}
              </span>
              <button
                className="button-secondary"
                style={{ padding: "6px 14px" }}
                onClick={() => {
                  setSelectedRequestId(null);
                  setDetailData(null);
                }}
              >
                Tutup Detail
              </button>
            </div>

            {/* Stepper showing state transition flow */}
            {activeRole !== "Pelapor" && (
              <div className="workflow-stepper">
                <div className={getStepClass("SUBMITTED", detailData.request.status)}>
                  <div className="step-dot">1</div>
                  <span className="step-label">Submitted</span>
                </div>
                <div className={getStepClass("UNDER REVIEW", detailData.request.status)}>
                  <div className="step-dot">2</div>
                  <span className="step-label">Review</span>
                </div>
                <div className={getStepClass("ASSIGNED", detailData.request.status)}>
                  <div className="step-dot">3</div>
                  <span className="step-label">Assigned</span>
                </div>
                <div className={getStepClass("IN PROGRESS", detailData.request.status)}>
                  <div className="step-dot">4</div>
                  <span className="step-label">In Progress</span>
                </div>
                <div className={getStepClass("RESOLVED", detailData.request.status)}>
                  <div className="step-dot">5</div>
                  <span className="step-label">Resolved</span>
                </div>
                <div className={getStepClass("CLOSED", detailData.request.status)}>
                  <div className="step-dot">6</div>
                  <span className="step-label">Closed</span>
                </div>
              </div>
            )}

            <span className="info-label" style={{ display: "block", marginBottom: "8px" }}>Deskripsi Laporan</span>
            <p style={{ fontSize: "14.5px", background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid var(--panel-border)", marginBottom: "20px" }}>
              {detailData.request.description}
            </p>

            {activeRole !== "Pelapor" ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Gedung / Ruang</span>
                  <span className="info-value">{detailData.request.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Kategori Masalah</span>
                  <span className="info-value">{detailData.request.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Prioritas Penanganan</span>
                  <span className="info-value">
                    <span className={`badge ${getPriorityBadgeClass(detailData.request.priority)}`}>
                      {detailData.request.priority === "NONE" ? "Belum Ditentukan" : detailData.request.priority}
                    </span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tanggal Pelaporan</span>
                  <span className="info-value">{formatDate(detailData.request.created_at)}</span>
                </div>
                <div className="info-item" style={{ gridColumn: "span 2" }}>
                  <span className="info-label">Teknisi Ditugaskan</span>
                  <span className="info-value" style={{ color: "var(--accent-color)" }}>
                    {detailData.request.assigned_technician || "Menunggu pendelegasian admin"}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.015)", borderRadius: "8px", border: "1px solid var(--panel-border)", margin: "24px 0", fontSize: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>📍 <strong>Lokasi:</strong> {detailData.request.location}</div>
                <div>📅 <strong>Tanggal Laporan:</strong> {formatDate(detailData.request.created_at)}</div>
                <div>📌 <strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(detailData.request.status)}`} style={{ display: "inline-block", marginLeft: "6px" }}>{detailData.request.status}</span></div>
              </div>
            )}

            {/* Logs timeline activity */}
            {activeRole !== "Pelapor" && (
              <div style={{ marginTop: "30px" }}>
                <h3 className="action-title" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Log Audit & Progres Pengerjaan</h3>
                <div className="timeline">
                  {detailData.status_history.map((log) => (
                    <div className="timeline-item" key={log.id}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <span className="timeline-text">
                          Status berpindah dari <strong>{log.old_status}</strong> ke{" "}
                          <strong>{log.new_status}</strong> oleh{" "}
                          <strong>{log.changed_by_name}</strong> ({log.changed_by_role})
                        </span>
                        <div className="timeline-date">{formatDate(log.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar panel for context actions and comments discussions */}
          <div className="detail-sidebar">
            <div className="action-box">
              <h3 className="action-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px", marginRight: "6px", display: "inline" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Menu Aksi
              </h3>
              <div className="action-btn-group">
                {/* Admin Role controls */}
                {activeRole === "Administrator" && (
                  <>
                    {detailData.request.status === "SUBMITTED" && (
                      <button
                        className="button-primary"
                        onClick={() => handleUpdateStatus("UNDER REVIEW")}
                      >
                        Start Review Laporan
                      </button>
                    )}



                    <div className="form-group">
                      <label className="form-label">Tugaskan Staf Teknisi</label>
                      <select
                        className="form-select"
                        value={detailData.request.assigned_technician || ""}
                        onChange={(e) => handleUpdateStatus(undefined, undefined, undefined, e.target.value || null)}
                      >
                        <option value="">Pilih Teknisi</option>
                        {dbTechnicians.length > 0 ? (
                          dbTechnicians.map((tech) => (
                            <option key={tech.username} value={tech.fullname}>
                              {tech.fullname}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Andi">Andi</option>
                            <option value="Pak Budi (Teknisi)">Pak Budi (Teknisi AC/Listrik)</option>
                            <option value="Pak Eko (Teknisi)">Pak Eko (Teknisi Listrik/Mekanikal)</option>
                            <option value="Ibu Rika (Teknisi)">Ibu Rika (Teknisi Kebersihan)</option>
                            <option value="Pak Danang (Teknisi)">Pak Danang (Teknisi Umum)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {detailData.request.status === "RESOLVED" && (
                      <button
                        className="button-primary"
                        style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)" }}
                        onClick={() => handleUpdateStatus("CLOSED")}
                      >
                        Tutup Laporan (CLOSED)
                      </button>
                    )}

                    {detailData.request.status === "CLOSED" && (
                      <button
                        className="button-secondary"
                        onClick={() => handleUpdateStatus("UNDER REVIEW")}
                      >
                        Buka Kembali Aduan Tiket
                      </button>
                    )}
                  </>
                )}

                {/* Technician Role controls */}
                {activeRole.startsWith("Teknisi") && (
                  <>
                    {detailData.request.assigned_technician === activeName ? (
                      <>
                        <div className="form-group" style={{ marginBottom: "16px" }}>
                          <label className="form-label" style={{ fontSize: "12.5px" }}>Tentukan Tingkat Prioritas</label>
                          <select
                            className="form-select"
                            value={detailData.request.priority || "NONE"}
                            onChange={(e) => handleUpdateStatus(undefined, e.target.value)}
                          >
                            <option value="NONE">Belum Ditentukan</option>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                          </select>
                        </div>
                        {detailData.request.status === "ASSIGNED" && (
                          <button
                            className="button-primary"
                            onClick={() => handleUpdateStatus("IN PROGRESS")}
                          >
                            Mulai Bekerja (In Progress)
                          </button>
                        )}
                        {detailData.request.status === "IN PROGRESS" && (
                          <button
                            className="button-primary"
                            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)" }}
                            onClick={() => handleUpdateStatus("RESOLVED")}
                          >
                            Tandai Selesai (RESOLVED)
                          </button>
                        )}
                        {["RESOLVED", "CLOSED"].includes(detailData.request.status) && (
                          <p className="text-secondary" style={{ fontSize: "13px", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--panel-border)" }}>
                            Pekerjaan laporan ini telah selesai diproses. Terima kasih!
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted" style={{ fontSize: "12.5px" }}>
                        Anda tidak ditugaskan untuk keluhan ini. Pembaruan progres hanya dapat diubah oleh teknisi yang ditugaskan.
                      </p>
                    )}
                  </>
                )}

                {/* Pelapor Role message info */}
                {activeRole === "Pelapor" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p className="text-secondary" style={{ fontSize: "13px" }}>
                      Status laporan ini diproses oleh Administrator. Anda dapat memberikan komentar balasan pada kolom komentar di bawah ini.
                    </p>
                    {detailData.request.status === "RESOLVED" && (
                      <div style={{ marginTop: "8px", padding: "12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}>
                        {detailData.comments?.some(c => c.author_role === "Pelapor" && c.content.includes("mengonfirmasi bahwa perbaikan")) ? (
                          <div style={{ color: "#34d399", fontWeight: "700", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>✓</span> Anda telah memberikan konfirmasi selesai untuk laporan ini.
                          </div>
                        ) : (
                          <>
                            <p className="text-secondary" style={{ fontSize: "13px", marginBottom: "10px", color: "#6ee7b7" }}>
                              Teknisi telah menyelesaikan perbaikan. Silakan klik tombol di bawah untuk memberikan konfirmasi jika masalah sudah teratasi dengan baik.
                            </p>
                            <button
                              type="button"
                              className="button-primary"
                              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)" }}
                              onClick={handleConfirmResolved}
                            >
                              Konfirmasi Perbaikan Selesai
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Facility Manager info */}
                {activeRole === "Manajer Fasilitas" && (
                  <p className="text-secondary" style={{ fontSize: "13px" }}>
                    Mode pemantauan dashboard aktif. Administrator dan Teknisi yang memproses pengerjaan.
                  </p>
                )}
              </div>
            </div>

            {/* Comments Box */}
            <div className="action-box">
              <h3 className="action-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "16px", height: "16px", marginRight: "6px", display: "inline" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.48 4.48 0 00-.224-.275C2.662 17.29 1 14.836 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Komentar Laporan
              </h3>
              <div className="comments-container">
                {detailData.comments.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: "13px", padding: "10px 0" }}>
                    Belum ada komentar. Kirim komentar pertama Anda di bawah.
                  </p>
                ) : (
                  detailData.comments.map((comm) => (
                    <div className="comment-card" key={comm.id}>
                      <div className="comment-header">
                        <span className="comment-author">
                          {comm.author_name}
                          <span className="comment-role"> ({comm.author_role})</span>
                        </span>
                        <span className="comment-date">{formatDate(comm.created_at)}</span>
                      </div>
                      <div className="comment-body">{comm.content}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment text form (Except Facility Manager which is read-only) */}
              {activeRole !== "Manajer Fasilitas" ? (
                <form onSubmit={handleSubmitComment} className="comment-form">
                  <input
                    type="text"
                    className="form-input comment-input"
                    placeholder="Tulis tanggapan..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                  <button type="submit" className="button-secondary" style={{ padding: "0 18px", fontWeight: "700" }}>
                    Kirim
                  </button>
                </form>
              ) : (
                <p className="text-muted" style={{ fontSize: "12px", textAlign: "center" }}>
                  Pemantau Dashboard tidak dapat mengirim komentar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
