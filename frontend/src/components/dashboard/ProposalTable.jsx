import React from "react";

const FILE_BASE_URL = "http://localhost:5000/uploads";

// Helper-helper ini bisa dipindah ke file utilitas terpisah nanti
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
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

function ProposalTable({
  proposals,
  handleSort,
  sortBy,
  sortOrder,
  handleEdit,
  handleDelete,
  handleViewDetail,
}) {
  return (
    <div className="table-section">
      <div className="table-header">
        <h2>Daftar Proposal</h2>
        <span className="table-count">
          {proposals.length} proposal ditemukan
        </span>
      </div>
      <div className="table-container">
        <table className="proposals-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("case_id")} className="sortable">
                CASE ID{" "}
                {sortBy === "case_id" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("nama")} className="sortable">
                NAMA PROPOSAL{" "}
                {sortBy === "nama" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>ASAL</th>
              <th>DETAIL PRODUK</th>
              <th
                onClick={() => handleSort("total_harga")}
                className="sortable"
              >
                BUDGET{" "}
                {sortBy === "total_harga" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>STATUS</th>
              <th>PIC</th>
              <th onClick={() => handleSort("tanggal")} className="sortable">
                TANGGAL{" "}
                {sortBy === "tanggal" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>FILE</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <tr key={proposal.id_proposal}>
                  <td className="case-id">{proposal.case_id}</td>
                  <td className="proposal-name">{proposal.nama_proposal}</td>
                  <td>{proposal.asal_proposal}</td>
                  <td className="product-detail">{proposal.detail_produk}</td>
                  <td className="budget">
                    {formatCurrency(proposal.total_harga)}
                  </td>
                  <td>{getStatusBadge(proposal.status_pengambilan)}</td>
                  <td>{proposal.PIC?.nama_pic || "N/A"}</td>
                  <td>
                    {new Date(proposal.tanggal_masuk).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                  <td>
                    {proposal.file_pendukung ? (
                      <a
                        className="file-link"
                        href={`${FILE_BASE_URL}/${proposal.file_pendukung}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Lihat file"
                      >
                        📎
                      </a>
                    ) : (
                      <span className="no-file">-</span>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetail(proposal)}
                    >
                      {/* SVG Icon View */}
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(proposal)}
                    >
                      {/* SVG Icon Edit */}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(proposal.id_proposal)}
                    >
                      {/* SVG Icon Delete */}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  Tidak ada proposal yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProposalTable;
