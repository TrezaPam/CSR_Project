// ==================== SIDEBAR WITH REACT ROUTER LINKS ====================
// File: frontend/src/components/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { FileText, BarChart3, Home, Calendar, Menu, X, LogOut } from "lucide-react";
import "../styles/Sidebar.css";

function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
}) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      description: "Overview sistem CSR",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
      description: "Laporan dan analitik",
    },
    {
      id: "routine",
      label: "Kegiatan Rutin",
      icon: Calendar,
      path: "/routine", // ← PATH UNTUK KEGIATAN RUTIN
      description: "Jadwal kegiatan rutin",
    },
  ];

  const handleMobileClose = () => {
    if (window.innerWidth <= 768 && onToggle) {
      onToggle();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
  };

  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="sidebar-header">
        <h3>CSR System</h3>
        <button
          onClick={onToggle}
          className="toggle-btn"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav" aria-label="Main menu">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  data-tooltip={item.label}
                  aria-label={item.label}
                  aria-describedby={collapsed ? `tooltip-${item.id}` : undefined}
                  onClick={handleMobileClose}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>

                  {/* Hidden description for screen readers */}
                  {collapsed && (
                    <span id={`tooltip-${item.id}`} className="sr-only">
                      {item.description}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <div className="user-details">
            <span className="user-name">Admin</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;