// ===============================================
// KEGIATAN RUTIN - REACT COMPONENT (DYNAMIC)
// File: frontend/src/pages/KegiatanRutin.jsx
// ===============================================

import { useState, useEffect, useCallback } from "react";
import "../styles/KegiatanRutinExcel.css"; // Pakai stylesheet Excel view agar konsisten
import DanoneLogo from "../assets/DANONE_LOGO_VERTICAL.png";
import AquaLogo from "../assets/Logo_Aqua_Vector_PNG__HD-removebg-preview.png";

const KegiatanRutin = () => {
  // ===============================================
  // STATE MANAGEMENT
  // ===============================================

  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [formData, setFormData] = useState({
    stakeholder: "",
    category: "",
    pickup_date: "", // Sesuaikan nama field dengan database (snake_case)
    item_count: "", // Sesuaikan nama field
    pic: "",
    status: "scheduled",
    notes: "",
    proof_file: null, // Tambahan untuk bukti pengiriman
  });

  // ===============================================
  const API_BASE_URL = "http://localhost:5000/api"; // Sesuaikan port backend Anda

  // ===============================================
  // API CALLS
  // ===============================================

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      // Membangun query string untuk filter
      const queryParams = new URLSearchParams({
        year: selectedYear,
        ...(selectedMonth && { month: selectedMonth }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`${API_BASE_URL}/routines?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
      }
    } catch (error) {
      console.error("Error fetching routines:", error);
      alert("Gagal memuat data kegiatan rutin");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, searchQuery]);

  // Fetch data saat filter berubah
  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);
  // ===============================================

  const calculateStats = () => {
    return {
      total: scheduleData.length,
      completed: scheduleData.filter((s) => s.status === "completed").length,
      pending: scheduleData.filter((s) => s.status === "pending").length,
      stakeholders: new Set(scheduleData.map((s) => s.stakeholder)).size,
    };
  };

  const stats = calculateStats();

  // ===============================================
  // MODAL HANDLERS
  // ===============================================

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      stakeholder: "",
      category: "",
      pickup_date: "",
      item_count: "",
      pic: "",
      status: "scheduled",
      notes: "",
      proof_file: null,
    });
    setShowScheduleModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      stakeholder: schedule.stakeholder,
      category: schedule.category,
      pickup_date: schedule.pickup_date,
      item_count: schedule.item_count,
      pic: schedule.pic,
      status: schedule.status,
      notes: schedule.notes || "",
      proof_file: null, // Reset file input saat edit
    });
    setShowScheduleModal(true);
  };

  const openDetailModal = (scheduleOrDateObj) => {
    // Handler ini bisa menerima object jadwal tunggal ATAU object tanggal (untuk view kalender)
    setSelectedSchedule(scheduleOrDateObj);
    setShowDetailModal(true);
  };

  const closeModals = () => {
    setShowScheduleModal(false);
    setShowDetailModal(false);
  };

  // ===============================================
  // FORM HANDLERS
  // ===============================================

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append("stakeholder", formData.stakeholder);
    dataToSend.append("category", formData.category);
    dataToSend.append("pickup_date", formData.pickup_date);
    dataToSend.append("item_count", formData.item_count);
    dataToSend.append("pic", formData.pic);
    dataToSend.append("status", formData.status);
    dataToSend.append("notes", formData.notes);

    if (formData.proof_file) {
      dataToSend.append("proof_file", formData.proof_file);
    }

    try {
      let response;
      if (editingSchedule) {
        // Update existing
        response = await fetch(
          `${API_BASE_URL}/routines/${editingSchedule.id}`,
          {
            method: "PUT",
            body: dataToSend,
          }
        );
      } else {
        // Add new
        response = await fetch(`${API_BASE_URL}/routines`, {
          method: "POST",
          body: dataToSend,
        });
      }

      if (response.ok) {
        alert(
          `Jadwal berhasil ${editingSchedule ? "diperbarui" : "ditambahkan"}`
        );
        fetchRoutines(); // Refresh data
        closeModals();
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?"))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Jadwal berhasil dihapus");
        fetchRoutines();
      } else {
        alert("Gagal menghapus jadwal");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // ===============================================
  // UTILITY & CALENDAR FUNCTIONS
  // ===============================================

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Terjadwal",
      completed: "Selesai",
      pending: "Pending",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  // ... (Fungsi renderCalendar, isDateToday, exportToExcel bisa tetap sama,
  // HANYA PERLU MENYESUAIKAN nama field: pickupDate -> pickup_date, itemCount -> item_count)

  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      // Filter data yang sudah ada di state scheduleData (yang sudah di-fetch)
      const schedulesOnDay = scheduleData.filter((s) => s.pickup_date === date);

      const today = new Date();
      const isToday =
        date ===
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(today.getDate()).padStart(2, "0")}`;

      let dayClass = "calendar-day";
      if (schedulesOnDay.length > 0) dayClass += " has-schedule";
      if (isToday) dayClass += " today";

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => {
            if (schedulesOnDay.length > 0) {
              openDetailModal({ date, schedules: schedulesOnDay });
            }
          }}
        >
          <div className="day-number">{day}</div>
          {schedulesOnDay.length > 0 && (
            <div className="day-events">
              <i className="fas fa-circle"></i>
              {schedulesOnDay.length} jadwal
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // ===============================================
  // RENDER
  // ===============================================

  if (loading && scheduleData.length === 0) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="main-content">
      {/* Sidebar handled by MainLayout usually, assuming this is page content */}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-logos">
          <img src={DanoneLogo} alt="Danone" className="header-logo" />
          <img src={AquaLogo} alt="Aqua" className="header-logo" />
        </div>
        <div className="page-title">
          <h1>
            <i className="fas fa-calendar-check"></i> Kegiatan Rutin
          </h1>
          <p className="page-subtitle">
            Kelola jadwal pengambilan donasi CSR bulanan untuk stakeholders
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => alert("Export feature here")}
          >
            <i className="fas fa-file-excel"></i> Export Excel
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label>
            <i className="fas fa-calendar-alt"></i> Bulan
          </label>
          <select
            className="filter-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-calendar"></i> Tahun
          </label>
          <select
            className="filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="filter-group">
          <label>
            <i className="fas fa-search"></i> Cari
          </label>
          <input
            type="text"
            className="filter-input"
            placeholder="Nama / Kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Terjadwal</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Selesai</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Menunggu</p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="calendar-section">
        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="calendar-header">Min</div>
            <div className="calendar-header">Sen</div>
            <div className="calendar-header">Sel</div>
            <div className="calendar-header">Rab</div>
            <div className="calendar-header">Kam</div>
            <div className="calendar-header">Jum</div>
            <div className="calendar-header">Sab</div>
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Schedule Modal (Add/Edit) */}
      {showScheduleModal && (
        <div className="modal active" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</h2>
              <button className="modal-close" onClick={closeModals}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Stakeholder</label>
                  <input
                    type="text"
                    name="stakeholder"
                    value={formData.stakeholder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal</label>
                  <input
                    type="date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jumlah Item</label>
                  <input
                    type="number"
                    name="item_count"
                    value={formData.item_count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PIC</label>
                  <input
                    type="text"
                    name="pic"
                    value={formData.pic}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="scheduled">Terjadwal</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Catatan</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Bukti Pengiriman (Opsional)</label>
                  <input
                    type="file"
                    name="proof_file"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="modal active" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Kegiatan: {formatDate(selectedSchedule.date)}</h2>
              <button className="modal-close" onClick={closeModals}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedSchedule.schedules &&
                selectedSchedule.schedules.map((s) => (
                  <div
                    key={s.id}
                    className="detail-item"
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px 0",
                    }}
                  >
                    <h4>
                      {s.stakeholder}{" "}
                      <span className={`status-badge status-${s.status}`}>
                        {getStatusLabel(s.status)}
                      </span>
                    </h4>
                    <p>
                      <strong>Kategori:</strong> {s.category}
                    </p>
                    <p>
                      <strong>Jumlah:</strong> {s.item_count} item
                    </p>
                    <p>
                      <strong>PIC:</strong> {s.pic}
                    </p>
                    <p>
                      <strong>Catatan:</strong> {s.notes || "-"}
                    </p>
                    {s.proof_file && (
                      <p>
                        <strong>Bukti: </strong>
                        <a
                          href={`http://localhost:5000/uploads/${s.proof_file}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat File
                        </a>
                      </p>
                    )}
                    <div
                      className="action-buttons"
                      style={{ marginTop: "10px" }}
                    >
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          closeModals();
                          openEditModal(s);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          closeModals();
                          handleDelete(s.id);
                        }}
                        style={{ marginLeft: "5px" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanRutin;
