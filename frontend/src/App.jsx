import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

// Import Halaman dan Komponen
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPages from "./pages/DashboardPages.jsx";
import KegiatanRutin from "./pages/KegiatanRutinNew.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx"; // Pastikan nama file ini benar (Singular: Route)
import MainLayout from "./components/mainLayout.jsx";
import KegiatanRutinNew from "./pages/KegiatanRutinNew.jsx";

// Komponen Placeholder untuk menu yang belum jadi
const ComingSoonPage = ({ title }) => (
  <div style={{ padding: "2rem", textAlign: "center", width: "100%" }}>
    <h1>{title}</h1>
    <p>Halaman ini sedang dalam pengembangan.</p>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Mulai dengan loading true

  useEffect(() => {
    // Cek token saat aplikasi pertama kali dibuka
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false); // Selesai cek, matikan loading
    };

    checkAuth();
  }, []);

  // Tampilkan loading screen sampai pengecekan token selesai
  // Ini PENTING agar tidak ada "flicker" atau salah redirect di awal
  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner"></div>
        <p>Memuat Aplikasi...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. RUTE PUBLIK (LOGIN) */}
      <Route
        path="/login"
        element={
          // Jika user sudah login tapi maksa buka /login, lempar ke dashboard
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* 2. RUTE PRIVAT (DILINDUNGI) */}
      {/* Semua rute di dalam sini butuh login */}
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Halaman Dashboard Utama */}
        <Route path="/dashboard" element={<DashboardPages />} />

        {/* Halaman Kegiatan Rutin */}
        <Route path="/routine" element={<KegiatanRutinNew />} />

        {/* Halaman Reports */}
        <Route path="/reports" element={<ReportPage />} />

        {/* Halaman Lainnya (Placeholder) */}
        <Route
          path="/proposals"
          element={<ComingSoonPage title="Kelola Proposal" />}
        />
        <Route
          path="/admin/*"
          element={<ComingSoonPage title="Kelola Admin" />}
        />
        <Route path="/pic" element={<ComingSoonPage title="Kelola PIC" />} />
        <Route
          path="/settings/*"
          element={<ComingSoonPage title="Pengaturan" />}
        />
      </Route>

      {/* 3. RUTE ROOT (DEFAULT) */}
      {/* Ini yang menentukan halaman pertama kali dibuka */}
      <Route
        path="/"
        element={
          // Logika sederhana: Punya tiket? Ke Dashboard. Gak punya? Ke Login.
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 4. RUTE 404 (HALAMAN TIDAK DITEMUKAN) */}
      <Route
        path="*"
        element={
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404</h1>
            <p>Halaman tidak ditemukan</p>
            <a href="/">Kembali ke Beranda</a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
