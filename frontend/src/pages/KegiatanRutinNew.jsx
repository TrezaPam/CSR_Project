// ===============================================
// KEGIATAN RUTIN - MODERNIZED EXCEL VIEW
// Features: Analytics, Export, Bulk Ops, Smart Filters
// File: frontend/src/pages/KegiatanRutinNew.jsx
// ===============================================

import { useState, useEffect, useCallback } from "react";
import "../styles/KegiatanRutinExcel.css";
import * as routineService from "../api/routineService";

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
  });

  const [scheduleForm, setScheduleForm] = useState({
    stakeholder_id: "",
    pickup_date: "",
    status: "scheduled",
    notes: "",
    proof_file: null,
  });

  // ===============================================
  // API CALLS
  // ===============================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutinesByStakeholder(selectedYear);
      setStakeholdersData(data);
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
    });
    setShowStakeholderModal(true);
  };

  const handleStakeholderSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStakeholder) {
        await routineService.updateStakeholder(
          editingStakeholder.id,
          stakeholderForm
        );
        alert("Stakeholder berhasil diperbarui");
      } else {
        await routineService.createStakeholder(stakeholderForm);
        alert("Stakeholder berhasil ditambahkan");
      }
      fetchData();
      setShowStakeholderModal(false);
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
      await routineService.deleteStakeholder(id);
      alert("Stakeholder berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menghapus stakeholder");
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
      status: "scheduled",
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
      status: schedule.status,
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
    formData.append("status", scheduleForm.status);
    formData.append("notes", scheduleForm.notes);

    if (scheduleForm.proof_file) {
      formData.append("proof_file", scheduleForm.proof_file);
    }

    try {
      if (editingSchedule) {
        await routineService.updateRoutine(editingSchedule.id, formData);
        alert("Jadwal berhasil diperbarui");
      } else {
        await routineService.createRoutine(formData);
        alert("Jadwal berhasil ditambahkan");
      }
      fetchData();
      setShowScheduleModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Hapus jadwal ini?")) return;

    try {
      await routineService.deleteRoutine(id);
      alert("Jadwal berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menghapus jadwal");
    }
  };

  const handleGenerateSchedules = async () => {
    const month = parseInt(prompt("Masukkan bulan (1-12):"));
    if (!month || month < 1 || month > 12) {
      alert("Bulan tidak valid");
      return;
    }

    try {
      const result = await routineService.generateMonthlySchedules(
        month,
        selectedYear
      );
      alert(result.message);
      fetchData();
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

      // Tambahkan qty default ke total item
      totalQuantity += sh.default_quantity || 0;

      (sh.schedules || []).forEach((s) => {
        totalSchedules++;

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
        await routineService.updateRoutine(id, { status });
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
        <div className="filter-group search-group">
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
        <div className="filter-group filter-actions">
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

      {/* Modern Card-Based View */}
      <div className="excel-table-container">
        <div className="cards-grid">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>Tidak ada data stakeholder</p>
            </div>
          ) : (
            filteredData.map((stakeholder, index) => (
              <div key={stakeholder.id} className="stakeholder-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="header-left">
                    <span className="card-number">{index + 1}</span>
                    <div className="header-text">
                      <h3>{stakeholder.institution_name}</h3>
                      {stakeholder.receiving_agency && (
                        <p className="agency">{stakeholder.receiving_agency}</p>
                      )}
                    </div>
                  </div>
                  <div className="card-actions">
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
                  </div>
                </div>

                {/* Card Info */}
                <div className="card-info">
                  {stakeholder.branch && (
                    <div className="info-item">
                      <span className="info-label">Cabang</span>
                      <span className="info-value">{stakeholder.branch}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Qty Default</span>
                    <span className="info-value qty-badge">
                      {stakeholder.default_quantity}
                    </span>
                  </div>
                </div>

                {/* Monthly Schedule Grid */}
                <div className="card-months">
                  <p className="months-title">Jadwal Kegiatan {selectedYear}</p>
                  <div className="months-grid">
                    {[...Array(12)].map((_, monthIndex) => {
                      const monthSchedules = getMonthSchedules(
                        stakeholder.schedules || [],
                        monthIndex + 1
                      );
                      const schedule = monthSchedules[0];
                      const monthName = new Date(0, monthIndex).toLocaleString(
                        "id-ID",
                        { month: "short" }
                      );

                      return (
                        <div
                          key={monthIndex}
                          className={`month-cell ${
                            schedule ? "has-schedule" : "empty"
                          }`}
                          onClick={() => {
                            if (schedule) {
                              openEditScheduleModal(schedule);
                            } else {
                              openAddScheduleModal(stakeholder.id);
                            }
                          }}
                        >
                          <div className="month-name">{monthName}</div>
                          {schedule ? (
                            <div className="schedule-info">
                              <div className="schedule-date">
                                {formatDate(schedule.pickup_date)}
                              </div>
                              {schedule.proof_file && (
                                <button
                                  type="button"
                                  className="btn-proof"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `http://localhost:5000/uploads/${schedule.proof_file}`;
                                    window.open(url, "_blank");
                                  }}
                                >
                                  <i className="fas fa-image"></i> Lihat Bukti
                                </button>
                              )}
                              {getStatusBadge(schedule.status)}
                            </div>
                          ) : (
                            <div className="add-schedule">
                              <i className="fas fa-plus-circle"></i>
                              <span>Tambah</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
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
                  <label>Bukti Pengambilan</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        proof_file: e.target.files[0],
                      })
                    }
                  />
                  <small
                    style={{
                      color: "#666",
                      marginTop: "5px",
                      display: "block",
                    }}
                  >
                    Ambil foto langsung dari kamera atau pilih dari galeri
                  </small>
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
