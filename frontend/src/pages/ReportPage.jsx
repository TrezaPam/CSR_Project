import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Filter,
} from "lucide-react";
import "../styles/ReportPage.css";

function ReportPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [comparisonMonth, setComparisonMonth] = useState(1); // Default January

  const API_BASE_URL = "http://localhost:5000/api";

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/proposals`);
      if (response.ok) {
        const result = await response.json();
        setProposals(result.data || result);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan pengeluaran per bulan
  const getMonthlyExpense = (month, year) => {
    return proposals
      .filter((p) => {
        const date = new Date(p.tanggal_masuk);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      })
      .reduce((total, p) => total + (parseFloat(p.total_harga) || 0), 0);
  };

  // Fungsi untuk mendapatkan jumlah proposal per bulan
  const getMonthlyProposalCount = (month, year) => {
    return proposals.filter((p) => {
      const date = new Date(p.tanggal_masuk);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    }).length;
  };

  // Data untuk 12 bulan
  const yearlyData = monthNames.map((name, index) => {
    const monthNum = index + 1;
    return {
      month: name,
      expense: getMonthlyExpense(monthNum, selectedYear),
      count: getMonthlyProposalCount(monthNum, selectedYear),
    };
  });

  // Data bulan terpilih vs bulan pembanding
  const currentMonthData = {
    month: monthNames[selectedMonth - 1],
    expense: getMonthlyExpense(selectedMonth, selectedYear),
    count: getMonthlyProposalCount(selectedMonth, selectedYear),
  };

  const comparisonMonthData = {
    month: monthNames[comparisonMonth - 1],
    expense: getMonthlyExpense(comparisonMonth, selectedYear),
    count: getMonthlyProposalCount(comparisonMonth, selectedYear),
  };

  const difference = currentMonthData.expense - comparisonMonthData.expense;
  const percentageChange = comparisonMonthData.expense
    ? ((difference / comparisonMonthData.expense) * 100).toFixed(2)
    : 0;

  const totalYearExpense = yearlyData.reduce(
    (sum, data) => sum + data.expense,
    0
  );
  const totalYearProposals = yearlyData.reduce(
    (sum, data) => sum + data.count,
    0
  );
  const averageMonthlyExpense = totalYearExpense / 12;

  const maxExpense = Math.max(...yearlyData.map((d) => d.expense));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ["Bulan", "Pengeluaran (IDR)", "Jumlah Proposal"],
      ...yearlyData.map((data) => [data.month, data.expense, data.count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-pengeluaran-${selectedYear}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <div className="report-title-section">
          <h1>
            <FileText size={32} />
            Laporan Pengeluaran CSR
          </h1>
          <p className="report-subtitle">
            Analisis pengeluaran dan perbandingan bulanan tahun {selectedYear}
          </p>
        </div>

        <div className="report-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <FileText size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label>
            <Filter size={16} />
            Tahun
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Bulan Utama
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Bandingkan dengan
          </label>
          <select
            value={comparisonMonth}
            onChange={(e) => setComparisonMonth(Number(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card primary">
          <div className="card-icon">
            <DollarSign size={28} />
          </div>
          <div className="card-content">
            <p className="card-label">Total Pengeluaran {selectedYear}</p>
            <h2 className="card-value">{formatCurrency(totalYearExpense)}</h2>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">
            <FileText size={28} />
          </div>
          <div className="card-content">
            <p className="card-label">Total Proposal {selectedYear}</p>
            <h2 className="card-value">{totalYearProposals}</h2>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <Calendar size={28} />
          </div>
          <div className="card-content">
            <p className="card-label">Rata-rata per Bulan</p>
            <h2 className="card-value">
              {formatCurrency(averageMonthlyExpense)}
            </h2>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="comparison-section">
        <h2 className="section-title">Perbandingan Bulanan</h2>
        <div className="comparison-grid">
          <div className="comparison-card">
            <div className="comparison-header">
              <h3>{currentMonthData.month}</h3>
              <span className="badge badge-primary">Bulan Utama</span>
            </div>
            <div className="comparison-value">
              {formatCurrency(currentMonthData.expense)}
            </div>
            <div className="comparison-meta">
              <span>{currentMonthData.count} Proposal</span>
            </div>
          </div>

          <div className="comparison-vs">
            <div className="vs-badge">VS</div>
            <div className="trend-indicator">
              {difference >= 0 ? (
                <div className="trend-up">
                  <TrendingUp size={24} />
                  <span>+{formatCurrency(Math.abs(difference))}</span>
                  <span className="percentage">(+{percentageChange}%)</span>
                </div>
              ) : (
                <div className="trend-down">
                  <TrendingDown size={24} />
                  <span>-{formatCurrency(Math.abs(difference))}</span>
                  <span className="percentage">({percentageChange}%)</span>
                </div>
              )}
            </div>
          </div>

          <div className="comparison-card">
            <div className="comparison-header">
              <h3>{comparisonMonthData.month}</h3>
              <span className="badge badge-secondary">Pembanding</span>
            </div>
            <div className="comparison-value">
              {formatCurrency(comparisonMonthData.expense)}
            </div>
            <div className="comparison-meta">
              <span>{comparisonMonthData.count} Proposal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-section">
        <h2 className="section-title">Grafik Pengeluaran Tahunan</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {yearlyData.map((data, index) => {
              const heightPercent =
                maxExpense > 0 ? (data.expense / maxExpense) * 100 : 0;
              const isSelected = index + 1 === selectedMonth;
              const isComparison = index + 1 === comparisonMonth;

              return (
                <div key={index} className="bar-group">
                  <div className="bar-wrapper">
                    <div
                      className={`bar ${isSelected ? "selected" : ""} ${
                        isComparison ? "comparison" : ""
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${data.month}: ${formatCurrency(data.expense)}`}
                    >
                      <span className="bar-value">
                        {formatCurrency(data.expense)}
                      </span>
                    </div>
                  </div>
                  <span className="bar-label">
                    {data.month.substring(0, 3)}
                  </span>
                  <span className="bar-count">{data.count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color selected"></span>
            <span>Bulan Utama</span>
          </div>
          <div className="legend-item">
            <span className="legend-color comparison"></span>
            <span>Bulan Pembanding</span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="table-section">
        <h2 className="section-title">Detail Pengeluaran per Bulan</h2>
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Jumlah Proposal</th>
                <th>Total Pengeluaran</th>
                <th>% dari Total</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((data, index) => {
                const percentage =
                  totalYearExpense > 0
                    ? ((data.expense / totalYearExpense) * 100).toFixed(2)
                    : 0;

                return (
                  <tr key={index}>
                    <td className="month-cell">{data.month}</td>
                    <td className="count-cell">{data.count}</td>
                    <td className="expense-cell">
                      {formatCurrency(data.expense)}
                    </td>
                    <td className="percentage-cell">
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>Total</td>
                <td>{totalYearProposals}</td>
                <td>{formatCurrency(totalYearExpense)}</td>
                <td>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
