// App.jsx — Routing utama aplikasi
// v1.0.1 — Pengujian Trigger Otomatis GitHub Actions
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prediction from './pages/Prediction';
import HistoryTable from './components/HistoryTable';
import Dashboard from './components/Dashboard';
import { getHistory } from './utils/localStorage';
import './App.css';

export default function App() {
  // State riwayat di-lift ke App agar dapat di-refresh dari berbagai halaman
  const [history, setHistory] = useState(() => getHistory());

  // Refresh riwayat dari Local Storage
  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Beranda */}
        <Route path="/" element={<Home />} />

        {/* Halaman Prediksi */}
        <Route
          path="/prediksi"
          element={<Prediction onSaved={refreshHistory} />}
        />

        {/* Halaman Riwayat */}
        <Route
          path="/riwayat"
          element={
            <div className="page">
              <div className="container">
                <div className="page-header fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '.5rem' }}>
                    📋 Riwayat Prediksi
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>
                    Semua hasil prediksi tersimpan di browser Anda melalui Local Storage.
                  </p>
                </div>
                <HistoryTable history={history} onUpdate={refreshHistory} />
              </div>
            </div>
          }
        />

        {/* Halaman Dashboard */}
        <Route
          path="/dashboard"
          element={
            <div className="page">
              <div className="container">
                <div className="page-header fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '.5rem' }}>
                    📊 Dashboard Statistik
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>
                    Ringkasan visual dari semua prediksi yang telah dilakukan.
                  </p>
                </div>
                <Dashboard history={history} />
              </div>
            </div>
          }
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="page" style={{ textAlign: 'center' }}>
              <div className="container" style={{ paddingTop: '4rem' }}>
                <p style={{ fontSize: '4rem' }}>🔍</p>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Halaman Tidak Ditemukan</h2>
                <a href="/" className="btn btn-primary">← Kembali ke Beranda</a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
