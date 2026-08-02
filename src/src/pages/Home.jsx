// Home.jsx — Halaman landing / beranda aplikasi
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  // Fitur-fitur yang ditampilkan di landing page
  const features = [
    {
      icon: '🧪',
      title: 'Prediksi Akurat',
      desc: 'Algoritma rule-based yang mempertimbangkan 11 faktor akademik, sosial, dan finansial.',
    },
    {
      icon: '📋',
      title: 'Riwayat Tersimpan',
      desc: 'Semua prediksi tersimpan otomatis di browser. Tidak perlu akun atau login.',
    },
    {
      icon: '📊',
      title: 'Dashboard Visual',
      desc: 'Lihat statistik dan tren tingkat stres mahasiswa melalui grafik interaktif.',
    },
    {
      icon: '💡',
      title: 'Saran Personal',
      desc: 'Dapatkan rekomendasi spesifik sesuai kategori stres Anda untuk hidup lebih baik.',
    },
  ];

  const steps = [
    { step: '01', label: 'Isi form prediksi dengan data Anda' },
    { step: '02', label: 'Klik tombol "Prediksi Sekarang"' },
    { step: '03', label: 'Lihat hasil dan saran personal' },
    { step: '04', label: 'Pantau perkembangan di Dashboard' },
  ];

  return (
    <div className="home">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text fade-up">
            <div className="hero-chip">🚀 Versi 2 (UJI DOWNTIME)</div>
            <h1 className="hero-title">
              Sistem Prediksi<br />
              <span className="gradient-text">Tingkat Stres Mahasiswa</span>
            </h1>
            <p className="hero-desc">
              Ketahui tingkat stres Anda secara cepat dan akurat berdasarkan faktor akademik,
              pola hidup, dan kondisi finansial. Dapatkan saran personal untuk hidup lebih
              sehat dan produktif.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-hero"
                onClick={() => navigate('/prediksi')}
                id="btn-start-prediction"
              >
                🚀 Mulai Prediksi
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/dashboard')}
                id="btn-see-dashboard"
              >
                📊 Lihat Dashboard
              </button>
            </div>
          </div>

          {/* Visual dekoratif */}
          <div className="hero-visual fade-up">
            <div className="stress-ring">
              <div className="ring ring-outer" />
              <div className="ring ring-mid" />
              <div className="ring ring-inner" />
              <div className="ring-center">
                <span className="ring-emoji">🧠</span>
                <span className="ring-label">AI Prediksi</span>
              </div>
            </div>
            {/* Badge mengambang */}
            <div className="float-badge badge-rendah float-1">😊 Rendah</div>
            <div className="float-badge badge-sedang float-2">😐 Sedang</div>
            <div className="float-badge badge-tinggi float-3">😰 Tinggi</div>
          </div>
        </div>

        {/* Gelombang dekoratif */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* ── Fitur Utama ────────────────────────────────────────────── */}
      <section className="section container">
        <h2 className="section-title">Mengapa Menggunakan StressMeter?</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cara Menggunakan ───────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Cara Menggunakan</h2>
          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step-item" key={s.step}>
                <div className="step-num">{s.step}</div>
                <p className="step-label">{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="btn btn-success"
              style={{ fontSize: '1.05rem', padding: '.75rem 2rem' }}
              onClick={() => navigate('/prediksi')}
              id="btn-start-now"
            >
              🎯 Mulai Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────── */}
      <section className="container" style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
        <p className="disclaimer">
          ⚠️ Disclaimer: Sistem ini bersifat indikatif dan tidak menggantikan konsultasi profesional.
          Jika Anda mengalami stres berat, segera hubungi konselor atau psikolog kampus.
        </p>
      </section>
    </div>
  );
}
