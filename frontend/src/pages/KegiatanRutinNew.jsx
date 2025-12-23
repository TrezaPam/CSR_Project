// ===============================================
// KEGIATAN RUTIN - MODERNIZED EXCEL VIEW
// Features: Analytics, Export, Bulk Ops, Smart Filters
// File: frontend/src/pages/KegiatanRutinNew.jsx
// ===============================================

import { useState, useEffect, useCallback } from "react";
import "../styles/KegiatanRutinExcel.css";

const KegiatanRutinNew = () => {
  // ===============================================
  // STATE MANAGEMENT
  // ===============================================

  const [stakeholdersData, setStakeholdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedSchedules, setSelectedSchedules] = useState(new Set());
  const [sortBy, setSortBy] = useState("institution");
  const [statusFilter, setStatusFilter] = useState("all");

  const [stakeholderForm, setStakeholderForm] = useState({
    institution_name: "",
    receiving_agency: "",
    branch: "",
    default_quantity: 0,
    contact_person: "",
    phone: "",
    address: "",
    is_active: true,
  });

  const [scheduleForm, setScheduleForm] = useState({
    stakeholder_id: "",
    pickup_date: "",
    quantity: 0,
    status: "scheduled",
    pic: "",
    notes: "",
    proof_file: null,
  });

  const API_BASE_URL = "http://localhost:5000/api/routines";

  // ===============================================
  // API CALLS
  // ===============================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/schedules/by-stakeholder?year=${selectedYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setStakeholdersData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================================
  // STAKEHOLDER HANDLERS
  // ===============================================

  const openAddStakeholderModal = () => {
    setEditingStakeholder(null);
    setStakeholderForm({
      institution_name: "",
      receiving_agency: "",
      branch: "",
      default_quantity: 0,
      contact_person: "",
      phone: "",
      address: "",
      is_active: true,
    });
    setShowStakeholderModal(true);
  };

  const openEditStakeholderModal = (stakeholder) => {
    setEditingStakeholder(stakeholder);
    setStakeholderForm({
      institution_name: stakeholder.institution_name,
      receiving_agency: stakeholder.receiving_agency || "",
      branch: stakeholder.branch || "",
      default_quantity: stakeholder.default_quantity,
      contact_person: stakeholder.contact_person || "",
      phone: stakeholder.phone || "",
      address: stakeholder.address || "",
      is_active: stakeholder.is_active,
    });
    setShowStakeholderModal(true);
  };

  const handleStakeholderSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingStakeholder) {
        response = await fetch(
          `${API_BASE_URL}/stakeholders/${editingStakeholder.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stakeholderForm),
          }
        );
      } else {
        response = await fetch(`${API_BASE_URL}/stakeholders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stakeholderForm),
        });
      }

      if (response.ok) {
        alert(
          `Stakeholder berhasil ${
            editingStakeholder ? "diperbarui" : "ditambahkan"
          }`
        );
        fetchData();
        setShowStakeholderModal(false);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDeleteStakeholder = async (id) => {
    if (
      !window.confirm("Hapus stakeholder ini? Semua jadwal akan ikut terhapus.")
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/stakeholders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Stakeholder berhasil dihapus");
        fetchData();
      } else {
        alert("Gagal menghapus stakeholder");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ===============================================
  // SCHEDULE HANDLERS
  // ===============================================

  const openAddScheduleModal = (stakeholderId) => {
    setEditingSchedule(null);
    setScheduleForm({
      stakeholder_id: stakeholderId,
      pickup_date: "",
      quantity: 0,
      status: "scheduled",
      pic: "",
      notes: "",
      proof_file: null,
    });
    setShowScheduleModal(true);
  };

  const openEditScheduleModal = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      stakeholder_id: schedule.stakeholder_id,
      pickup_date: schedule.pickup_date,
      quantity: schedule.quantity,
      status: schedule.status,
      pic: schedule.pic || "",
      notes: schedule.notes || "",
      proof_file: null,
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("stakeholder_id", scheduleForm.stakeholder_id);
    formData.append("pickup_date", scheduleForm.pickup_date);
    formData.append("quantity", scheduleForm.quantity);
    formData.append("status", scheduleForm.status);
    formData.append("pic", scheduleForm.pic);
    formData.append("notes", scheduleForm.notes);

    if (scheduleForm.proof_file) {
      formData.append("proof_file", scheduleForm.proof_file);
    }

    try {
      let response;
      if (editingSchedule) {
        response = await fetch(
          `${API_BASE_URL}/schedules/${editingSchedule.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch(`${API_BASE_URL}/schedules`, {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        alert(
          `Jadwal berhasil ${editingSchedule ? "diperbarui" : "ditambahkan"}`
        );
        fetchData();
        setShowScheduleModal(false);
      } else {
        alert("Gagal menyimpan jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Hapus jadwal ini?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Jadwal berhasil dihapus");
        fetchData();
      } else {
        alert("Gagal menghapus jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGenerateSchedules = async () => {
    const month = parseInt(prompt("Masukkan bulan (1-12):"));
    if (!month || month < 1 || month > 12) {
      alert("Bulan tidak valid");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/schedules/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year: selectedYear }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchData();
      } else {
        alert("Gagal generate jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { text: "Terjadwal", class: "status-scheduled" },
      completed: { text: "Selesai", class: "status-completed" },
      pending: { text: "Pending", class: "status-pending" },
      cancelled: { text: "Batal", class: "status-cancelled" },
    };
    const s = statusMap[status] || { text: status, class: "" };
    return <span className={`status-badge ${s.class}`}>{s.text}</span>;
  };

  const getMonthSchedules = (schedules, month) => {
    return schedules.filter((s) => {
      const scheduleDate = new Date(s.pickup_date);
      return scheduleDate.getMonth() + 1 === month;
    });
  };

  // ===============================================
  // ANALYTICS & INSIGHTS
  // ===============================================

  const calculateAnalytics = () => {
    let totalSchedules = 0;
    let completed = 0;
    let scheduled = 0;
    let pending = 0;
    let cancelled = 0;
    let totalQuantity = 0;
    const branchCounts = {};

    stakeholdersData.forEach((sh) => {
      if (sh.branch && !branchCounts[sh.branch]) {
        branchCounts[sh.branch] = 0;
      }
      if (sh.branch) branchCounts[sh.branch]++;

      (sh.schedules || []).forEach((s) => {
        totalSchedules++;
        totalQuantity += s.quantity || 0;

        if (s.status === "completed") completed++;
        else if (s.status === "scheduled") scheduled++;
        else if (s.status === "pending") pending++;
        else if (s.status === "cancelled") cancelled++;
      });
    });

    const completionRate =
      totalSchedules > 0 ? Math.round((completed / totalSchedules) * 100) : 0;

    return {
      totalSchedules,
      completed,
      scheduled,
      pending,
      cancelled,
      totalQuantity,
      completionRate,
      branchCounts,
      uniqueBranches: Object.keys(branchCounts).length,
      uniqueStakeholders: stakeholdersData.length,
    };
  };

  const analytics = calculateAnalytics();

  // ===============================================
  // EXPORT & PRINT FEATURES
  // ===============================================

  const exportToCSV = () => {
    const headers = ["No", "Institusi", "Cabang", "Jumlah"];
    const monthNames = [...Array(12)].map((_, i) =>
      new Date(0, i).toLocaleString("id-ID", { month: "short" })
    );
    headers.push(...monthNames, "Total Jadwal");

    const rows = [headers];

    filteredData.forEach((sh, idx) => {
      const row = [
        idx + 1,
        sh.institution_name,
        sh.branch || "-",
        sh.default_quantity,
      ];

      monthNames.forEach((_, monthIdx) => {
        const schedules = getMonthSchedules(sh.schedules || [], monthIdx + 1);
        row.push(schedules.length > 0 ? schedules[0].pickup_date : "-");
      });

      row.push((sh.schedules || []).length);
      rows.push(row);
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kegiatan-rutin-${selectedYear}.csv`;
    link.click();
  };

  const generatePrintReport = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    let htmlContent = `
      <html>
        <head>
          <title>Laporan Kegiatan Rutin - ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #667eea; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #667eea; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .stat-box { padding: 15px; background: #f0f0f0; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <h1>Laporan Kegiatan Rutin CSR - Tahun ${selectedYear}</h1>
          <p style="text-align: center; color: #666;">Tanggal cetak: ${new Date().toLocaleDateString(
            "id-ID"
          )}</p>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${analytics.totalSchedules}</div>
              <div>Total Jadwal</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${analytics.completed}</div>
              <div>Selesai</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${analytics.pending}</div>
              <div>Pending</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${analytics.completionRate}%</div>
              <div>Completion Rate</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Institusi</th>
                <th>Cabang</th>
                <th>Jumlah</th>
                <th>Total Jadwal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach((sh, idx) => {
      const totalSchedules = (sh.schedules || []).length;
      const completedSchedules = (sh.schedules || []).filter(
        (s) => s.status === "completed"
      ).length;

      htmlContent += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${sh.institution_name}</strong></td>
          <td>${sh.branch || "-"}</td>
          <td>${sh.default_quantity}</td>
          <td>${totalSchedules}</td>
          <td>${completedSchedules} Selesai / ${totalSchedules}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
          <p style="margin-top: 30px; text-align: right; color: #666; font-size: 12px;">
            Laporan ini digenerated dari Sistem Manajemen CSR
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // ===============================================
  // BULK OPERATIONS
  // ===============================================

  const handleBulkStatusUpdate = async (status) => {
    if (selectedSchedules.size === 0) {
      alert("Pilih minimal 1 jadwal");
      return;
    }

    let updated = 0;
    for (const id of selectedSchedules) {
      try {
        await fetch(`${API_BASE_URL}/schedules/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        updated++;
      } catch (error) {
        console.error("Error updating:", error);
      }
    }

    alert(`${updated} jadwal berhasil diupdate ke status ${status}`);
    setSelectedSchedules(new Set());
    fetchData();
  };

  const filteredData = stakeholdersData
    .filter((sh) => {
      const matchesSearch = sh.institution_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesBranch =
        filterBranch === "all" || sh.branch === filterBranch;

      // Status filter logic
      let matchesStatus = true;
      if (statusFilter !== "all") {
        const schedules = sh.schedules || [];
        if (statusFilter === "completed") {
          matchesStatus = schedules.some((s) => s.status === "completed");
        } else if (statusFilter === "pending") {
          matchesStatus = schedules.some((s) => s.status === "pending");
        } else if (statusFilter === "empty") {
          matchesStatus = schedules.length === 0;
        }
      }

      return matchesSearch && matchesBranch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "institution") {
        return a.institution_name.localeCompare(b.institution_name);
      } else if (sortBy === "branch") {
        return (a.branch || "").localeCompare(b.branch || "");
      } else if (sortBy === "schedules") {
        return (b.schedules?.length || 0) - (a.schedules?.length || 0);
      }
      return 0;
    });

  // ===============================================
  // RENDER
  // ===============================================

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-calendar-check"></i> Kegiatan Rutin
          </h1>
          <p className="page-subtitle">
            Dashboard jadwal pengambilan CSR dengan analytics real-time
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <i className="fas fa-download"></i> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={generatePrintReport}>
            <i className="fas fa-print"></i> Cetak
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleGenerateSchedules}
          >
            <i className="fas fa-magic"></i> Generate
          </button>
          <button className="btn btn-primary" onClick={openAddStakeholderModal}>
            <i className="fas fa-plus"></i> Tambah
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="analytics-grid">
          <div className="analytics-card primary">
            <div className="analytics-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="analytics-content">
              <h3>{analytics.totalSchedules}</h3>
              <p>Total Jadwal</p>
              <div className="analytics-meta">
                {analytics.uniqueStakeholders} Institusi
              </div>
            </div>
          </div>

          <div className="analytics-card success">
            <div className="analytics-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="analytics-content">
              <h3>{analytics.completed}</h3>
              <p>Selesai</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${analytics.completionRate}%` }}
                ></div>
              </div>
              <div className="analytics-meta">
                {analytics.completionRate}% Rate
              </div>
            </div>
          </div>

          <div className="analytics-card warning">
            <div className="analytics-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="analytics-content">
              <h3>{analytics.pending}</h3>
              <p>Pending</p>
              <div className="analytics-meta">Perlu Perhatian</div>
            </div>
          </div>

          <div className="analytics-card info">
            <div className="analytics-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="analytics-content">
              <h3>{analytics.totalQuantity}</h3>
              <p>Total Item</p>
              <div className="analytics-meta">
                Rata-rata{" "}
                {analytics.totalSchedules > 0
                  ? Math.round(
                      analytics.totalQuantity / analytics.totalSchedules
                    )
                  : 0}
                /jadwal
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Controls */}
      <div className="filter-section">
        <div className="filter-group">
          <label>
            <i className="fas fa-calendar"></i> Tahun
          </label>
          <select
            className="filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-map-marker"></i> Cabang
          </label>
          <select
            className="filter-select"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="all">Semua Cabang</option>
            {Object.keys(analytics.branchCounts || {}).map((branch) => (
              <option key={branch} value={branch}>
                {branch} ({analytics.branchCounts[branch]})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-search"></i> Cari
          </label>
          <input
            type="text"
            className="filter-input"
            placeholder="Nama institusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-filter"></i> Status
          </label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="pending">Pending</option>
            <option value="empty">Belum Dijadwal</option>
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-sort"></i> Urutkan
          </label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="institution">Nama Institusi</option>
            <option value="branch">Cabang</option>
            <option value="schedules">Jumlah Jadwal</option>
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-eye"></i> &nbsp;
          </label>
          <button
            className="btn btn-sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            title={
              showAnalytics ? "Sembunyikan Analytics" : "Tampilkan Analytics"
            }
          >
            {showAnalytics ? "Sembunyikan" : "Tampilkan"} Analytics
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSchedules.size > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <i className="fas fa-info-circle"></i>
            <span>{selectedSchedules.size} jadwal dipilih</span>
          </div>
          <div className="bulk-buttons">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleBulkStatusUpdate("completed")}
            >
              Tandai Selesai
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkStatusUpdate("pending")}
            >
              Tandai Pending
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedSchedules(new Set())}
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* Excel-like Table View */}
      <div className="excel-table-container">
        <div className="excel-table-wrapper">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="col-no">No</th>
                <th className="col-institution">Nama Institusi</th>
                <th className="col-agency">Instansi Penerima</th>
                <th className="col-branch">Cabang</th>
                <th className="col-qty">Jumlah</th>
                {[...Array(12)].map((_, i) => (
                  <th key={i} className="col-month">
                    {new Date(0, i).toLocaleString("id-ID", {
                      month: "short",
                    })}
                  </th>
                ))}
                <th className="col-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="18"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Tidak ada data stakeholder
                  </td>
                </tr>
              ) : (
                filteredData.map((stakeholder, index) => (
                  <tr key={stakeholder.id}>
                    <td className="col-no">{index + 1}</td>
                    <td className="col-institution">
                      {stakeholder.institution_name}
                    </td>
                    <td className="col-agency">
                      {stakeholder.receiving_agency || "-"}
                    </td>
                    <td className="col-branch">{stakeholder.branch || "-"}</td>
                    <td className="col-qty">{stakeholder.default_quantity}</td>
                    {[...Array(12)].map((_, monthIndex) => {
                      const monthSchedules = getMonthSchedules(
                        stakeholder.schedules || [],
                        monthIndex + 1
                      );
                      const schedule = monthSchedules[0];

                      return (
                        <td
                          key={monthIndex}
                          className="col-month"
                          onClick={() => {
                            if (schedule) {
                              openEditScheduleModal(schedule);
                            } else {
                              openAddScheduleModal(stakeholder.id);
                            }
                          }}
                        >
                          {schedule ? (
                            <div className="schedule-cell">
                              <div className="schedule-date">
                                {formatDate(schedule.pickup_date)}
                              </div>
                              <div className="schedule-status">
                                {getStatusBadge(schedule.status)}
                              </div>
                            </div>
                          ) : (
                            <div className="schedule-cell-empty">
                              <i className="fas fa-plus-circle"></i>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEditStakeholderModal(stakeholder)}
                        title="Edit Stakeholder"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteStakeholder(stakeholder.id)}
                        title="Hapus Stakeholder"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Stakeholder */}
      {showStakeholderModal && (
        <div
          className="modal active"
          onClick={() => setShowStakeholderModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingStakeholder ? "Edit Stakeholder" : "Tambah Stakeholder"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowStakeholderModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleStakeholderSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Institusi *</label>
                    <input
                      type="text"
                      value={stakeholderForm.institution_name}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          institution_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Instansi Penerima</label>
                    <input
                      type="text"
                      value={stakeholderForm.receiving_agency}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          receiving_agency: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cabang</label>
                    <input
                      type="text"
                      value={stakeholderForm.branch}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          branch: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Jumlah Default</label>
                    <input
                      type="number"
                      value={stakeholderForm.default_quantity}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          default_quantity: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      value={stakeholderForm.contact_person}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          contact_person: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Telepon</label>
                    <input
                      type="text"
                      value={stakeholderForm.phone}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <textarea
                    value={stakeholderForm.address}
                    onChange={(e) =>
                      setStakeholderForm({
                        ...stakeholderForm,
                        address: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={stakeholderForm.is_active}
                      onChange={(e) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          is_active: e.target.checked,
                        })
                      }
                    />{" "}
                    Aktif
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowStakeholderModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Schedule */}
      {showScheduleModal && (
        <div
          className="modal active"
          onClick={() => setShowScheduleModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowScheduleModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleScheduleSubmit}>
                <div className="form-group">
                  <label>Tanggal Pengambilan *</label>
                  <input
                    type="date"
                    value={scheduleForm.pickup_date}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        pickup_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jumlah *</label>
                  <input
                    type="number"
                    value={scheduleForm.quantity}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PIC</label>
                  <input
                    type="text"
                    value={scheduleForm.pic}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, pic: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={scheduleForm.status}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="scheduled">Terjadwal</option>
                    <option value="completed">Selesai</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Catatan</label>
                  <textarea
                    value={scheduleForm.notes}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        notes: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Bukti Pengiriman</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        proof_file: e.target.files[0],
                      })
                    }
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                  {editingSchedule && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setShowScheduleModal(false);
                        handleDeleteSchedule(editingSchedule.id);
                      }}
                    >
                      Hapus
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanRutinNew;
