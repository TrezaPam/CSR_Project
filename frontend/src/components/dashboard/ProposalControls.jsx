import React from "react";

function ProposalControls({
  handleAddNew,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="controls-section">
      <div className="controls-left">
        <button className="add-button" onClick={handleAddNew}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Tambah Proposal Baru
        </button>
        {/* Logika untuk bulk actions bisa ditambahkan di sini nanti */}
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
        </select>
      </div>
    </div>
  );
}

export default ProposalControls;
