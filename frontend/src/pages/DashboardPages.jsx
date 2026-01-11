"use client";

import { useState, useEffect, useMemo } from "react";
import "../styles/DashboardPage.css";
import DanoneLogo from "../assets/DANONE_LOGO_VERTICAL.png";
import AquaLogo from "../assets/Logo_Aqua_Vector_PNG__HD-removebg-preview.png";

function DashboardPages() {
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentProposal, setCurrentProposal] = useState(null);
  const [picList, setPicList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [viewMode, setViewMode] = useState("table");
  const [selectedProposals, setSelectedProposals] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProposal, setDetailProposal] = useState(null);

  // New state for date range filter
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    case_id: "",
    nama: "",
    asal: "",
    status: "In Progress",
    pic_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    bentuk_donasi: "",
    jumlah_produk: "",
    tipe_proposal: "",
    detail_produk: "",
    total_harga: "",
    catatan: "",
    file_pendukung: null,
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const showNotif = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const fetchPICList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pic`);
      if (response.ok) {
        const data = await response.json();
        setPicList(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching PIC list:", error);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/proposals`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      setProposals(data);
      setFilteredProposals(data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setError("Gagal memuat data dari server.");
      setProposals([]);
      setFilteredProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    fetchPICList();
  }, []);

  // Enhanced filter with date range
  useEffect(() => {
    let filtered = [...proposals];

    if (searchTerm) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.nama_proposal
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.asal_proposal
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.PIC?.nama_pic
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.case_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.detail_produk
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (proposal) => proposal.status_pengambilan === statusFilter
      );
    }

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((proposal) => {
        const proposalDate = new Date(proposal.tanggal_masuk);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999); // Include end date fully
        return proposalDate >= start && proposalDate <= end;
      });
    } else if (dateRange.startDate) {
      filtered = filtered.filter((proposal) => {
        const proposalDate = new Date(proposal.tanggal_masuk);
        const start = new Date(dateRange.startDate);
        return proposalDate >= start;
      });
    } else if (dateRange.endDate) {
      filtered = filtered.filter((proposal) => {
        const proposalDate = new Date(proposal.tanggal_masuk);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return proposalDate <= end;
      });
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "tanggal") {
        aValue = new Date(a.tanggal_masuk);
        bValue = new Date(b.tanggal_masuk);
      } else if (sortBy === "pic") {
        aValue = a.PIC?.nama_pic || "";
        bValue = b.PIC?.nama_pic || "";
      } else if (sortBy === "nama") {
        aValue = a.nama_proposal || "";
        bValue = b.nama_proposal || "";
      } else if (sortBy === "total_harga") {
        aValue = Number.parseFloat(a.total_harga || 0);
        bValue = Number.parseFloat(b.total_harga || 0);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProposals(filtered);
    setCurrentPage(1);
  }, [proposals, searchTerm, statusFilter, sortBy, sortOrder, dateRange]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProposals.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const summaryData = useMemo(() => {
    const totalProposals = proposals.length;
    const inProgressCount = proposals.filter(
      (p) => p.status_pengambilan === "In Progress"
    ).length;
    const readyCount = proposals.filter(
      (p) => p.status_pengambilan === "Siap Diambil"
    ).length;
    const doneCount = proposals.filter(
      (p) => p.status_pengambilan === "Done"
    ).length;
    const totalBudget = proposals.reduce(
      (sum, p) => sum + Number.parseFloat(p.total_harga || 0),
      0
    );

    return {
      totalProposals,
      inProgressCount,
      readyCount,
      doneCount,
      totalBudget,
    };
  }, [proposals]);

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const generateCaseId = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `CSR-${currentYear}-${randomNum}`;
  };

  const handleAddNew = () => {
    setModalMode("add");
    setFormData({
      case_id: generateCaseId(),
      nama: "",
      asal: "",
      status: "In Progress",
      pic_id: "",
      tanggal: new Date().toISOString().split("T")[0],
      bentuk_donasi: "",
      jumlah_produk: "",
      tipe_proposal: "",
      detail_produk: "",
      total_harga: "",
      catatan: "",
      file_pendukung: null,
    });
    setShowModal(true);
  };

  const handleEdit = (proposal) => {
    setModalMode("edit");
    setCurrentProposal(proposal);
    setFormData({
      case_id: proposal.case_id || "",
      nama: proposal.nama_proposal || "",
      asal: proposal.asal_proposal || "",
      status: proposal.status_pengambilan || "In Progress",
      pic_id: proposal.id_pic || "",
      tanggal: proposal.tanggal_masuk?.split("T")[0] || "",
      bentuk_donasi: proposal.bentuk_donasi || "",
      jumlah_produk: proposal.jumlah_produk || "",
      tipe_proposal: proposal.tipe_proposal || "",
      detail_produk: proposal.detail_produk || "",
      total_harga: proposal.total_harga || "",
      catatan: proposal.catatan || "",
      file_pendukung: null,
    });
    setShowModal(true);
  };

  const handleViewDetail = (proposal) => {
    setDetailProposal(proposal);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus proposal ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchProposals();
          showNotif("Proposal berhasil dihapus", "success");
        } else {
          showNotif("Gagal menghapus proposal", "error");
        }
      } catch (error) {
        console.error("Error deleting proposal:", error);
        showNotif("Terjadi kesalahan saat menghapus proposal", "error");
      }
    }
  };

  const handleSelectProposal = (id) => {
    setSelectedProposals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProposals.length === currentItems.length) {
      setSelectedProposals([]);
    } else {
      setSelectedProposals(currentItems.map((p) => p.id_proposal));
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedProposals.length} proposal?`
      )
    ) {
      try {
        await Promise.all(
          selectedProposals.map((id) =>
            fetch(`${API_BASE_URL}/proposals/${id}`, { method: "DELETE" })
          )
        );
        await fetchProposals();
        setSelectedProposals([]);
        showNotif(
          `${selectedProposals.length} proposal berhasil dihapus`,
          "success"
        );
      } catch (error) {
        console.error("Error bulk deleting proposals:", error);
        showNotif("Gagal menghapus beberapa proposal", "error");
      }
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(
        selectedProposals.map((id) => {
          const proposal = proposals.find((p) => p.id_proposal === id);
          return fetch(`${API_BASE_URL}/proposals/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...proposal,
              status_pengambilan: newStatus,
            }),
          });
        })
      );
      await fetchProposals();
      setSelectedProposals([]);
      showNotif(
        `Status ${selectedProposals.length} proposal berhasil diubah`,
        "success"
      );
    } catch (error) {
      console.error("Error bulk changing status:", error);
      showNotif("Gagal mengubah status beberapa proposal", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("case_id", formData.case_id);
      formDataToSend.append("nama_proposal", formData.nama);
      formDataToSend.append("asal_proposal", formData.asal);
      formDataToSend.append("status_pengambilan", formData.status);
      formDataToSend.append("tanggal_masuk", formData.tanggal);
      formDataToSend.append("bentuk_donasi", formData.bentuk_donasi);
      formDataToSend.append("jumlah_produk", formData.jumlah_produk);
      formDataToSend.append("tipe_proposal", formData.tipe_proposal);
      formDataToSend.append("detail_produk", formData.detail_produk);
      formDataToSend.append("total_harga", formData.total_harga);
      formDataToSend.append("catatan", formData.catatan);
      formDataToSend.append("id_pic", formData.pic_id || 1);

      if (formData.file_pendukung) {
        formDataToSend.append("file_pendukung", formData.file_pendukung);
      }

      const url =
        modalMode === "add"
          ? `${API_BASE_URL}/proposals`
          : `${API_BASE_URL}/proposals/${currentProposal.id_proposal}`;

      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      if (response.ok) {
        setShowModal(false);
        await fetchProposals();
        showNotif(
          modalMode === "add"
            ? "Proposal berhasil ditambahkan"
            : "Proposal berhasil diperbarui",
          "success"
        );
      } else {
        const errorData = await response.json();
        showNotif(
          `Gagal ${modalMode === "add" ? "menambah" : "mengubah"} proposal: ${
            errorData.message
          }`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showNotif("Terjadi kesalahan saat menyimpan data", "error");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Case ID",
      "Nama Proposal",
      "Asal",
      "Status",
      "PIC",
      "Tanggal",
      "Bentuk Donasi",
      "Jumlah",
      "Total Harga",
    ];

    const rows = filteredProposals.map((p) => [
      p.case_id,
      p.nama_proposal,
      p.asal_proposal,
      p.status_pengambilan,
      p.PIC?.nama_pic || "",
      new Date(p.tanggal_masuk).toLocaleDateString("id-ID"),
      p.bentuk_donasi,
      p.jumlah_produk,
      p.total_harga,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposals_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showNotif("Data berhasil diexport ke CSV", "success");
  };

  // Print PDF function
  const handlePrintPDF = () => {
    const winPrint = window.open("", "", "width=900,height=650");

    winPrint.document.write(`
      <html>
        <head>
          <title>Laporan Proposal CSR</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #10b981;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1e293b;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header p {
              color: #64748b;
              font-size: 14px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 15px;
              margin-bottom: 25px;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .summary-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            }
            .summary-item h3 {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .summary-item p {
              font-size: 20px;
              font-weight: bold;
              color: #1e293b;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 10px 8px; 
              text-align: left;
            }
            th { 
              background-color: #10b981; 
              color: white;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            tr:nth-child(even) { 
              background-color: #f8fafc; 
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            .status-badge {
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              display: inline-block;
            }
            .status-progress { background: #fef3c7; color: #92400e; }
            .status-ready { background: #dbeafe; color: #1e40af; }
            .status-done { background: #d1fae5; color: #065f46; }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              color: #64748b;
            }
            .case-id {
              font-family: 'Courier New', monospace;
              font-weight: 600;
              background: #f1f5f9;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 10px;
            }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Proposal CSR</h1>
            <p>Dicetak pada: ${new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <h3>Total Proposal</h3>
              <p>${summaryData.totalProposals}</p>
            </div>
            <div class="summary-item">
              <h3>In Progress</h3>
              <p>${summaryData.inProgressCount}</p>
            </div>
            <div class="summary-item">
              <h3>Siap Diambil</h3>
              <p>${summaryData.readyCount}</p>
            </div>
            <div class="summary-item">
              <h3>Done</h3>
              <p>${summaryData.doneCount}</p>
            </div>
            <div class="summary-item">
              <h3>Total Budget</h3>
              <p style="font-size: 14px;">${formatCurrency(
                summaryData.totalBudget
              )}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">No</th>
                <th style="width: 12%;">Case ID</th>
                <th style="width: 22%;">Nama Proposal</th>
                <th style="width: 15%;">Asal</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 13%;">PIC</th>
                <th style="width: 10%;">Tanggal</th>
                <th style="width: 8%;">Budget</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProposals
                .map(
                  (p, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td><span class="case-id">${p.case_id}</span></td>
                  <td><strong>${
                    p.nama_proposal
                  }</strong><br><small style="color: #64748b;">${
                    p.tipe_proposal
                  }</small></td>
                  <td>${p.asal_proposal}</td>
                  <td>
                    <span class="status-badge status-${
                      p.status_pengambilan === "In Progress"
                        ? "progress"
                        : p.status_pengambilan === "Siap Diambil"
                        ? "ready"
                        : "done"
                    }">
                      ${p.status_pengambilan}
                    </span>
                  </td>
                  <td>${p.PIC?.nama_pic || "-"}</td>
                  <td>${new Date(p.tanggal_masuk).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}</td>
                  <td style="text-align: right; font-weight: 600;">${formatCurrency(
                    p.total_harga
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sistem Monitoring CSR - Dokumen ini dicetak secara otomatis</p>
          </div>
        </body>
      </html>
    `);

    winPrint.document.close();
    winPrint.focus();
    setTimeout(() => {
      winPrint.print();
      winPrint.close();
      showNotif("PDF berhasil digenerate", "success");
    }, 250);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "In Progress": "status-progress",
      "Siap Diambil": "status-ready",
      Done: "status-done",
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>{status}</span>
    );
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    showNotif("Filter tanggal dihapus", "info");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {showNotification && (
        <div className={`notification-toast ${notificationType}`}>
          <div className="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {notificationType === "success" ? (
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              )}
            </svg>
            <span>{notificationMessage}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => setShowNotification(false)}
          >
            ×
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logos">
            <img src={DanoneLogo} alt="Danone" className="header-logo" />
            <img src={AquaLogo} alt="Aqua" className="header-logo" />
          </div>
        </div>
        <div className="header-center">
          <h1>Dashboard - Sistem Monitoring CSR</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-details">
              <h4>Welcome, Admin</h4>
              <p>Administrator</p>
            </div>
            <div className="user-avatar">A</div>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </div>
      )}

      <div className="summary-section">
        <div className="summary-card total">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>TOTAL</h3>
            <p className="card-number">{summaryData.totalProposals}</p>
          </div>
        </div>

        <div className="summary-card progress">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>PROGRESS</h3>
            <p className="card-number">{summaryData.inProgressCount}</p>
          </div>
        </div>

        <div className="summary-card ready">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>SIAP</h3>
            <p className="card-number">{summaryData.readyCount}</p>
          </div>
        </div>

        <div className="summary-card done">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>DONE</h3>
            <p className="card-number">{summaryData.doneCount}</p>
          </div>
        </div>

        <div className="summary-card budget">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
            </svg>
          </div>
          <div className="card-content">
            <h3>BUDGET</h3>
            <p className="card-number card-number-small">
              {formatCurrency(summaryData.totalBudget)}
            </p>
          </div>
        </div>

        <div className="summary-card chart-card">
          <h3>DISTRIBUSI STATUS PROPOSAL</h3>
          <div className="pie-chart-container">
            <div
              className="pie-chart"
              style={{
                background: `conic-gradient(
                #f59e0b 0deg ${
                  (summaryData.inProgressCount / summaryData.totalProposals) *
                    360 || 0
                }deg,
                #3b82f6 ${
                  (summaryData.inProgressCount / summaryData.totalProposals) *
                    360 || 0
                }deg ${
                  ((summaryData.inProgressCount + summaryData.readyCount) /
                    summaryData.totalProposals) *
                    360 || 0
                }deg,
                #10b981 ${
                  ((summaryData.inProgressCount + summaryData.readyCount) /
                    summaryData.totalProposals) *
                    360 || 0
                }deg 360deg
              )`,
              }}
            ></div>
            <div className="pie-legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#f59e0b" }}
                ></div>
                <div className="legend-text">
                  <span>In Progress</span>
                  <div>
                    <span className="legend-value">
                      {summaryData.inProgressCount}
                    </span>
                    <span className="legend-percent">
                      (
                      {summaryData.totalProposals > 0
                        ? (
                            (summaryData.inProgressCount /
                              summaryData.totalProposals) *
                            100
                          ).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#3b82f6" }}
                ></div>
                <div className="legend-text">
                  <span>Siap Diambil</span>
                  <div>
                    <span className="legend-value">
                      {summaryData.readyCount}
                    </span>
                    <span className="legend-percent">
                      (
                      {summaryData.totalProposals > 0
                        ? (
                            (summaryData.readyCount /
                              summaryData.totalProposals) *
                            100
                          ).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: "#10b981" }}
                ></div>
                <div className="legend-text">
                  <span>Done</span>
                  <div>
                    <span className="legend-value">
                      {summaryData.doneCount}
                    </span>
                    <span className="legend-percent">
                      (
                      {summaryData.totalProposals > 0
                        ? (
                            (summaryData.doneCount /
                              summaryData.totalProposals) *
                            100
                          ).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="controls-left">
          <button className="add-button" onClick={handleAddNew}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Tambah Proposal
          </button>

          {selectedProposals.length > 0 && (
            <div className="bulk-actions">
              <button
                className="bulk-action-btn"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Aksi ({selectedProposals.length})
              </button>

              {showBulkActions && (
                <div className="bulk-actions-dropdown">
                  <button onClick={() => handleBulkStatusChange("In Progress")}>
                    Ubah ke In Progress
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Siap Diambil")}
                  >
                    Ubah ke Siap Diambil
                  </button>
                  <button onClick={() => handleBulkStatusChange("Done")}>
                    Ubah ke Done
                  </button>
                  <button onClick={handleBulkDelete} className="danger">
                    Hapus Semua
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="export-button" onClick={exportToCSV}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            Export CSV
          </button>

          <button
            className="export-button print-button"
            onClick={handlePrintPDF}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
            </svg>
            Print PDF
          </button>

          <button
            className="view-toggle-btn"
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            title={viewMode === "table" ? "Tampilan Card" : "Tampilan Tabel"}
          >
            {viewMode === "table" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,5A2,2 0 0,1 5,3H9A2,2 0 0,1 11,5V9A2,2 0 0,1 9,11H5A2,2 0 0,1 3,9V5M3,15A2,2 0 0,1 5,13H9A2,2 0 0,1 11,15V19A2,2 0 0,1 9,21H5A2,2 0 0,1 3,19V15M13,5A2,2 0 0,1 15,3H19A2,2 0 0,1 21,5V9A2,2 0 0,1 19,11H15A2,2 0 0,1 13,9V5M13,15A2,2 0 0,1 15,13H19A2,2 0 0,1 21,15V19A2,2 0 0,1 19,21H15A2,2 0 0,1 13,19V15Z" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z" />
              </svg>
            )}
          </button>
        </div>

        <div className="controls-right">
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-box"
              placeholder="Cari proposal, PIC, atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="date-filter-group">
            <input
              type="date"
              className="date-filter"
              placeholder="Dari Tanggal"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              title="Dari Tanggal"
            />
            <span className="date-separator">-</span>
            <input
              type="date"
              className="date-filter"
              placeholder="Sampai Tanggal"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              title="Sampai Tanggal"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                className="clear-date-btn"
                onClick={clearDateFilter}
                title="Hapus Filter Tanggal"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Siap Diambil">Siap Diambil</option>
            <option value="Done">Done</option>
          </select>

          <select
            className="sort-filter"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split("-");
              setSortBy(key);
              setSortOrder(order);
            }}
          >
            <option value="tanggal-desc">Terbaru</option>
            <option value="tanggal-asc">Terlama</option>
            <option value="nama-asc">Nama A-Z</option>
            <option value="nama-desc">Nama Z-A</option>
            <option value="total_harga-desc">Budget Tertinggi</option>
            <option value="total_harga-asc">Budget Terendah</option>
            <option value="pic-asc">PIC A-Z</option>
          </select>
        </div>
      </div>

      <div id="printable-table" style={{ display: "none" }}>
        {/* This div is used for printing */}
      </div>

      {viewMode === "table" ? (
        <div className="table-section">
          <div className="table-header">
            <h2>Daftar Proposal</h2>
            <div className="table-info">
              <span className="table-count">
                Menampilkan {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredProposals.length)} dari{" "}
                {filteredProposals.length} proposal
              </span>
              {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                <span className="search-info">
                  {searchTerm && `"${searchTerm}"`}
                  {(dateRange.startDate || dateRange.endDate) && (
                    <span className="date-info">
                      {dateRange.startDate &&
                        ` dari ${new Date(
                          dateRange.startDate
                        ).toLocaleDateString("id-ID")}`}
                      {dateRange.endDate &&
                        ` sampai ${new Date(
                          dateRange.endDate
                        ).toLocaleDateString("id-ID")}`}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="proposals-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedProposals.length === currentItems.length &&
                        currentItems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="table-checkbox"
                    />
                  </th>
                  <th
                    onClick={() => handleSort("case_id")}
                    className="sortable"
                    style={{ width: "120px" }}
                  >
                    <div className="th-content">
                      CASE ID
                      {sortBy === "case_id" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("nama")}
                    className="sortable"
                    style={{ width: "200px" }}
                  >
                    <div className="th-content">
                      NAMA PROPOSAL
                      {sortBy === "nama" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th style={{ width: "140px" }}>ASAL</th>
                  <th style={{ width: "180px" }}>DETAIL PRODUK</th>
                  <th
                    onClick={() => handleSort("total_harga")}
                    className="sortable"
                    style={{ width: "120px" }}
                  >
                    <div className="th-content">
                      BUDGET
                      {sortBy === "total_harga" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status_pengambilan")}
                    className="sortable"
                    style={{ width: "120px" }}
                  >
                    <div className="th-content">
                      STATUS
                      {sortBy === "status_pengambilan" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("pic")}
                    className="sortable"
                    style={{ width: "140px" }}
                  >
                    <div className="th-content">
                      PIC
                      {sortBy === "pic" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("tanggal")}
                    className="sortable"
                    style={{ width: "110px" }}
                  >
                    <div className="th-content">
                      TANGGAL
                      {sortBy === "tanggal" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th style={{ width: "70px" }}>FILE</th>
                  <th style={{ width: "130px" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((proposal) => (
                    <tr key={proposal.id_proposal}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedProposals.includes(
                            proposal.id_proposal
                          )}
                          onChange={() =>
                            handleSelectProposal(proposal.id_proposal)
                          }
                          className="table-checkbox"
                        />
                      </td>
                      <td className="case-id">
                        <span className="case-id-text">{proposal.case_id}</span>
                      </td>
                      <td className="proposal-name">
                        <div className="proposal-name-content">
                          <span className="proposal-name-text">
                            {proposal.nama_proposal}
                          </span>
                          <small className="proposal-type">
                            {proposal.tipe_proposal}
                          </small>
                        </div>
                      </td>
                      <td className="proposal-origin">
                        <span>{proposal.asal_proposal}</span>
                      </td>
                      <td className="product-detail">
                        <div className="product-info">
                          <span className="product-name">
                            {proposal.detail_produk || proposal.bentuk_donasi}
                          </span>
                          <small className="product-qty">
                            {proposal.jumlah_produk}
                          </small>
                        </div>
                      </td>
                      <td className="budget">
                        <span className="budget-amount">
                          {formatCurrency(proposal.total_harga)}
                        </span>
                      </td>
                      <td className="status-cell">
                        {getStatusBadge(proposal.status_pengambilan)}
                      </td>
                      <td className="pic-info">
                        <div className="pic-info-content">
                          <span className="pic-name">
                            {proposal.PIC?.nama_pic || "Tidak ada"}
                          </span>
                          <small className="pic-email">
                            {proposal.PIC?.email_pic}
                          </small>
                        </div>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">
                          {proposal.tanggal_masuk
                            ? new Date(
                                proposal.tanggal_masuk
                              ).toLocaleDateString("id-ID")
                            : "Tidak ada"}
                        </span>
                      </td>
                      <td className="file-cell">
                        {proposal.file_pendukung ? (
                          <a
                            href={`/uploads/${proposal.file_pendukung}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                            title="Download file"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          </a>
                        ) : (
                          <span className="no-file">-</span>
                        )}
                      </td>
                      <td className="actions">
                        <div className="actions-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewDetail(proposal)}
                            title="Lihat Detail"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(proposal)}
                            title="Edit Proposal"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(proposal.id_proposal)}
                            title="Hapus Proposal"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="no-data">
                      <div className="no-data-content">
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          opacity="0.3"
                        >
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                        <h3>Tidak ada proposal yang ditemukan</h3>
                        {(searchTerm ||
                          dateRange.startDate ||
                          dateRange.endDate) && (
                          <p className="no-data-hint">
                            Coba ubah kata kunci pencarian atau filter
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Sebelumnya
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber}>...</span>;
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Selanjutnya
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="cards-section">
          <div className="cards-header">
            <h2>Daftar Proposal</h2>
            <span className="cards-count">
              {filteredProposals.length} proposal
            </span>
          </div>

          <div className="cards-grid">
            {currentItems.length > 0 ? (
              currentItems.map((proposal) => (
                <div key={proposal.id_proposal} className="proposal-card">
                  <div className="proposal-card-header">
                    <div>
                      <h3>{proposal.nama_proposal}</h3>
                      <span className="card-case-id">{proposal.case_id}</span>
                    </div>
                    {getStatusBadge(proposal.status_pengambilan)}
                  </div>

                  <div className="proposal-card-body">
                    <div className="card-info-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>{proposal.asal_proposal}</span>
                    </div>

                    <div className="card-info-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
                      </svg>
                      <span>{proposal.bentuk_donasi}</span>
                    </div>

                    <div className="card-info-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                      <span>
                        {new Date(proposal.tanggal_masuk).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>

                    <div className="card-info-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                      </svg>
                      <span className="card-budget">
                        {formatCurrency(proposal.total_harga)}
                      </span>
                    </div>

                    <div className="card-info-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <span>{proposal.PIC?.nama_pic || "Tidak ada PIC"}</span>
                    </div>
                  </div>

                  <div className="proposal-card-footer">
                    <button
                      className="card-action-btn primary"
                      onClick={() => handleViewDetail(proposal)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      Detail
                    </button>
                    <button
                      className="card-action-btn"
                      onClick={() => handleEdit(proposal)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="card-action-btn danger"
                      onClick={() => handleDelete(proposal.id_proposal)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-content">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  opacity="0.3"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
                <h3>Tidak ada proposal yang ditemukan</h3>
                {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                  <p className="no-data-hint">
                    Coba ubah kata kunci pencarian atau filter
                  </p>
                )}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Sebelumnya
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber}>...</span>;
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Selanjutnya
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailProposal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Detail Proposal</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <div className="detail-header">
                  <div>
                    <h2>{detailProposal.nama_proposal}</h2>
                    <span className="detail-case-id">
                      {detailProposal.case_id}
                    </span>
                  </div>
                  {getStatusBadge(detailProposal.status_pengambilan)}
                </div>
              </div>

              <div className="detail-section">
                <h4>Informasi Umum</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Asal Proposal</label>
                    <p>{detailProposal.asal_proposal}</p>
                  </div>
                  <div className="detail-item">
                    <label>Tanggal Masuk</label>
                    <p>
                      {new Date(
                        detailProposal.tanggal_masuk
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Tipe Proposal</label>
                    <p>{detailProposal.tipe_proposal}</p>
                  </div>
                  <div className="detail-item">
                    <label>PIC</label>
                    <p>
                      {detailProposal.PIC?.nama_pic || "Tidak ada"}
                      <br />
                      <small>{detailProposal.PIC?.email_pic}</small>
                    </p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Informasi Donasi</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Bentuk Donasi</label>
                    <p>{detailProposal.bentuk_donasi}</p>
                  </div>
                  <div className="detail-item">
                    <label>Jumlah Produk</label>
                    <p>{detailProposal.jumlah_produk}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Detail Produk</label>
                    <p>{detailProposal.detail_produk || "-"}</p>
                  </div>
                  <div className="detail-item">
                    <label>Total Harga</label>
                    <p className="detail-budget">
                      {formatCurrency(detailProposal.total_harga)}
                    </p>
                  </div>
                </div>
              </div>

              {detailProposal.catatan && (
                <div className="detail-section">
                  <h4>Catatan</h4>
                  <div className="detail-notes">
                    <p>{detailProposal.catatan}</p>
                  </div>
                </div>
              )}

              {detailProposal.file_pendukung && (
                <div className="detail-section">
                  <h4>File Pendukung</h4>
                  <a
                    href={`/uploads/${detailProposal.file_pendukung}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-file-link"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {detailProposal.file_pendukung}
                  </a>
                </div>
              )}

              <div className="detail-section">
                <h4>Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-date">
                        {new Date(detailProposal.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p className="timeline-text">Proposal dibuat</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <p className="timeline-date">
                        {new Date(detailProposal.updatedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p className="timeline-text">Terakhir diperbarui</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
              <button
                className="btn-submit"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(detailProposal);
                }}
              >
                Edit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content enhanced-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {modalMode === "add" ? "Tambah Proposal Baru" : "Edit Proposal"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form enhanced-form">
              <div className="form-section">
                <h4>Informasi Dasar</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Case ID *</label>
                    <input
                      type="text"
                      name="case_id"
                      value={formData.case_id}
                      onChange={handleFormChange}
                      placeholder="CSR-2025-001"
                      required
                      readOnly={modalMode === "edit"}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Masuk *</label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Proposal *</label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleFormChange}
                      placeholder="Program Bantuan Air Bersih Desa"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Asal Proposal *</label>
                    <input
                      type="text"
                      name="asal"
                      value={formData.asal}
                      onChange={handleFormChange}
                      placeholder="Kepala Desa / Organisasi"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>PIC (Person in Charge) *</label>
                    <select
                      name="pic_id"
                      value={formData.pic_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Pilih PIC</option>
                      {picList.map((pic) => (
                        <option key={pic.id_pic} value={pic.id_pic}>
                          {pic.nama_pic} - {pic.email_pic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Siap Diambil">Siap Diambil</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Informasi Produk</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bentuk Donasi</label>
                    <input
                      type="text"
                      name="bentuk_donasi"
                      value={formData.bentuk_donasi}
                      onChange={handleFormChange}
                      placeholder="Air Mineral, Sembako, Peralatan Sekolah"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipe Proposal</label>
                    <select
                      name="tipe_proposal"
                      value={formData.tipe_proposal}
                      onChange={handleFormChange}
                    >
                      <option value="">Pilih tipe</option>
                      <option value="Sekali Jalan">Sekali Jalan</option>
                      <option value="Berkelanjutan">Berkelanjutan</option>
                      <option value="Tahunan">Tahunan</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Detail Produk</label>
                  <textarea
                    name="detail_produk"
                    value={formData.detail_produk}
                    onChange={handleFormChange}
                    placeholder="Contoh: Air mineral kemasan 600ml merk Aqua, total 100 dus berisi 24 botol per dus"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Jumlah Produk</label>
                    <input
                      type="text"
                      name="jumlah_produk"
                      value={formData.jumlah_produk}
                      onChange={handleFormChange}
                      placeholder="100 dus @ 24 botol = 2400 botol"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Harga (IDR)</label>
                    <input
                      type="number"
                      name="total_harga"
                      value={formData.total_harga}
                      onChange={handleFormChange}
                      placeholder="5000000"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Informasi Tambahan</h4>
                <div className="form-group">
                  <label>Catatan</label>
                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleFormChange}
                    placeholder="Catatan khusus, kondisi khusus, atau informasi tambahan lainnya"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>File Pendukung</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      name="file_pendukung"
                      onChange={handleFormChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <span>
                        {formData.file_pendukung
                          ? formData.file_pendukung.name
                          : "Pilih file atau drag & drop"}
                      </span>
                      <small>PDF, DOC, DOCX, JPG, PNG (Max 5MB)</small>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === "add" ? "Tambah Proposal" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPages;
