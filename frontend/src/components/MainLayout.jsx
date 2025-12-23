import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";

function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          className="hamburger-btn"
          onClick={handleToggleSidebar}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseMobileSidebar}
      />

      {/* Mobile overlay when sidebar is open */}
      {isMobile && mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={handleCloseMobileSidebar}
          role="presentation"
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
