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
  // Active Role switcher state
  const [activeRole, setActiveRole] = useState("Pelapor");
  const [activeName, setActiveName] = useState("Rian (Mahasiswa)");

  // Lists & Filters
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Detail Modal / View
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<RequestDetail | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("AC");

  // Comment Text
  const [commentText, setCommentText] = useState("");

  // Feedbacks
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sync simulated identity to role choice
  useEffect(() => {
    if (activeRole === "Pelapor") {
      setActiveName("Rian (Mahasiswa)");
    } else if (activeRole === "Administrator") {
      setActiveName("Admin Sarpras");
    } else if (activeRole === "Teknisi - Budi") {
      setActiveName("Budi (Teknisi)");
    } else if (activeRole === "Teknisi - Agus") {
      setActiveName("Agus (Teknisi)");
    } else if (activeRole === "Manajer Fasilitas") {
      setActiveName("Manajer Sarpras");
    }
    // Clean details panel when swapping roles to avoid invalid role actions
    setSelectedRequestId(null);
    setDetailData(null);
  }, [activeRole]);

  // Load requests
  async function loadRequests() {
    try {
      const url = new URL("/api/requests", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      if (categoryFilter) url.searchParams.set("category", categoryFilter);

      if (activeRole.startsWith("Teknisi -")) {
        url.searchParams.set("technician", activeName);
      }

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

  // Load request details (comments & history log)
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

  useEffect(() => {
    loadRequests();
  }, [searchQuery, statusFilter, categoryFilter, activeRole, activeName]);

  useEffect(() => {
    if (selectedRequestId) {
      loadRequestDetail(selectedRequestId);
    }
  }, [selectedRequestId]);

  // Create report
  async function handleSubmitRequest(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, category }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Gagal membuat laporan.");
        return;
      }

      setSuccessMessage(`Laporan berhasil dikirim! Nomor Tiket: ${result.requestNumber}`);
      setTitle("");
      setDescription("");
      setLocation("");
      setCategory("AC");
      loadRequests();
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat mengirim laporan.");
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

  // Formatter utilities
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
      case "LOW": return "badge-priority-low";
      case "MEDIUM": return "badge-priority-medium";
      case "HIGH": return "badge-priority-high";
      default: return "";
    }
  }

  function formatDate(isoString: string) {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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

  // Pure CSS Chart breakdown calculator
  const totalCount = requests.length;
  function getCategoryStats(catName: string) {
    const count = requests.filter(r => r.category === catName).length;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { count, percentage };
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

        {/* Tab-styled Role selector controls */}
        <div className="role-tabs">
          <button
            className={`role-tab ${activeRole === "Pelapor" ? "active" : ""}`}
            onClick={() => setActiveRole("Pelapor")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Pelapor
          </button>
          <button
            className={`role-tab ${activeRole === "Administrator" ? "active" : ""}`}
            onClick={() => setActiveRole("Administrator")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Admin
          </button>
          <button
            className={`role-tab ${activeRole === "Teknisi - Budi" ? "active" : ""}`}
            onClick={() => setActiveRole("Teknisi - Budi")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83m-3.75 3.75l-3.75-3.75m3.75 3.75l1.58-1.58m-5.33-2.17l-5.83-5.83A2.67 2.67 0 015.75 3L11.58 8.83m-3.75 3.75l3.75 3.75m-3.75-3.75l-1.58 1.58m5.33 2.17l5.83 5.83A2.67 2.67 0 0118.25 21l-5.83-5.83m-3.75-3.75l3.75-3.75" />
            </svg>
            Teknisi Budi
          </button>
          <button
            className={`role-tab ${activeRole === "Teknisi - Agus" ? "active" : ""}`}
            onClick={() => setActiveRole("Teknisi - Agus")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83m-3.75 3.75l-3.75-3.75m3.75 3.75l1.58-1.58m-5.33-2.17l-5.83-5.83A2.67 2.67 0 015.75 3L11.58 8.83m-3.75 3.75l3.75 3.75m-3.75-3.75l-1.58 1.58m5.33 2.17l5.83 5.83A2.67 2.67 0 0118.25 21l-5.83-5.83m-3.75-3.75l3.75-3.75" />
            </svg>
            Teknisi Agus
          </button>
          <button
            className={`role-tab ${activeRole === "Manajer Fasilitas" ? "active" : ""}`}
            onClick={() => setActiveRole("Manajer Fasilitas")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            Manajer
          </button>
        </div>
      </header>

      {/* Alerts */}
      {successMessage && (
        <div className="alert alert-success" onClick={() => setSuccessMessage("")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error" onClick={() => setErrorMessage("")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Manager Panel View */}
      {activeRole === "Manajer Fasilitas" ? (
        <div>
          {/* Dashboard Summary grid */}
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
            {/* Left Column: Pure CSS Category Chart breakdown */}
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
                {["AC", "Listrik", "Internet", "Kebersihan", "Sipil"].map(catName => {
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

            {/* Right Column: Full reports overview */}
            <div className="panel">
              <h2 className="panel-title">Ringkasan Laporan Kampus (FM View)</h2>
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>No. Tiket</th>
                      <th>Judul Aduan</th>
                      <th>Lokasi</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted" style={{ textAlign: "center" }}>
                          Belum ada laporan kerusakan yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req.id} onClick={() => setSelectedRequestId(req.id)}>
                          <td className="text-bold">{req.request_number}</td>
                          <td>{req.title}</td>
                          <td>{req.location}</td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                              {req.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                              {req.status}
                            </span>
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
        /* Regular Roles Views */
        <div className="dashboard-grid">
          {/* Left Column: Form Laporan for Pelapor or Info panel */}
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
                    <label className="form-label">Judul Masalah</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: AC B302 Bocor"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi Kerusakan (Min. 20 Karakter)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Uraikan detail kerusakan fasilitas agar memudahkan teknisi memeriksa..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lokasi Ruang / Gedung</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Gedung B, Ruang 302"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori Kerusakan</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="AC">AC (Pendingin Ruang)</option>
                      <option value="Listrik">Listrik & Lampu</option>
                      <option value="Internet">Internet / Wi-Fi</option>
                      <option value="Kebersihan">Kebersihan</option>
                      <option value="Sipil">Mebel & Dinding</option>
                    </select>
                  </div>
                  <button type="submit" className="button-primary">Kirim Laporan</button>
                </form>
              </div>
            ) : (
              <div className="panel">
                <h2 className="panel-title">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Profil Pengguna
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
              <select
                className="form-select filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                className="form-select filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                <option value="AC">AC</option>
                <option value="Listrik">Listrik</option>
                <option value="Internet">Internet</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Sipil">Sipil</option>
              </select>
            </div>

            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>No. Tiket</th>
                    <th>Judul Laporan</th>
                    <th>Lokasi</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-muted" style={{ textAlign: "center" }}>
                        Tidak ada laporan aduan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} onClick={() => setSelectedRequestId(req.id)}>
                        <td className="text-bold">{req.request_number}</td>
                        <td>{req.title}</td>
                        <td>{req.location}</td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
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

            <p style={{ fontSize: "14.5px", background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid var(--panel-border)", marginBottom: "20px" }}>
              {detailData.request.description}
            </p>

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
                    {detailData.request.priority}
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

            {/* Logs timeline activity */}
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
                      <label className="form-label">Tingkat Prioritas</label>
                      <select
                        className="form-select"
                        value={detailData.request.priority}
                        onChange={(e) => handleUpdateStatus(undefined, e.target.value)}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tugaskan Teknisi Pelaksana</label>
                      <select
                        className="form-select"
                        value={detailData.request.assigned_technician || ""}
                        onChange={(e) => handleUpdateStatus(undefined, undefined, undefined, e.target.value || null)}
                      >
                        <option value="">Menunggu Pendelegasian</option>
                        <option value="Budi (Teknisi)">Budi (Teknisi AC/Listrik)</option>
                        <option value="Agus (Teknisi)">Agus (Teknisi Kebersihan)</option>
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
                        Anda tidak ditugaskan untuk keluhan ini. Pembaruan progres hanya dapat diubah oleh teknisi yang bersangkutan.
                      </p>
                    )}
                  </>
                )}

                {/* Pelapor Role message info */}
                {activeRole === "Pelapor" && (
                  <p className="text-secondary" style={{ fontSize: "13px" }}>
                    Status laporan ini diproses oleh Administrator Sarpras. Anda dapat memberikan komentar balasan pada kotak diskusi di bawah ini.
                  </p>
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
                Diskusi & Komentar
              </h3>
              <div className="comments-container">
                {detailData.comments.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: "13px", padding: "10px 0" }}>
                    Belum ada riwayat percakapan. Kirim komentar pertama Anda di bawah.
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
