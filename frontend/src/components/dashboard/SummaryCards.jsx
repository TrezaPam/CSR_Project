import React from "react";

// Helper untuk format mata uang
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

function SummaryCards({ summaryData }) {
  return (
    <div className="summary-section">
      <div className="summary-card total">
        <div className="card-icon">{/* SVG Icon */}</div>
        <div className="card-content">
          <h3>TOTAL PROPOSALS</h3>
          <p className="card-number">{summaryData.totalProposals}</p>
        </div>
      </div>
      <div className="summary-card progress">
        <div className="card-icon">{/* SVG Icon */}</div>
        <div className="card-content">
          <h3>IN PROGRESS</h3>
          <p className="card-number">{summaryData.inProgressCount}</p>
        </div>
      </div>
      <div className="summary-card ready">
        <div className="card-icon">{/* SVG Icon */}</div>
        <div className="card-content">
          <h3>SIAP DIAMBIL</h3>
          <p className="card-number">{summaryData.readyCount}</p>
        </div>
      </div>
      <div className="summary-card done">
        <div className="card-icon">{/* SVG Icon */}</div>
        <div className="card-content">
          <h3>DONE</h3>
          <p className="card-number">{summaryData.doneCount}</p>
        </div>
      </div>
      <div className="summary-card budget">
        <div className="card-icon">{/* SVG Icon */}</div>
        <div className="card-content">
          <h3>TOTAL BUDGET</h3>
          <p className="card-number budget-amount">
            {formatCurrency(summaryData.totalBudget)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
