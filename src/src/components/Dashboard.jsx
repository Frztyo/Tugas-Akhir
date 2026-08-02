// Dashboard.jsx — Statistik & grafik ringkasan prediksi
import { useMemo } from 'react';
import './Dashboard.css';

// ── Grafik batang sederhana menggunakan CSS ──────────────────────────────
function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-item" key={d.label}>
          <div className="bar-col">
            <span className="bar-value">{d.value}</span>
            <div
              className="bar-fill"
              style={{
                height: `${Math.round((d.value / maxVal) * 160)}px`,
                background: d.color,
              }}
            />
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ history }) {
  // ── Hitung statistik ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = history.length;
    const rendah  = history.filter((h) => h.level === 'Rendah').length;
    const sedang  = history.filter((h) => h.level === 'Sedang').length;
    const tinggi  = history.filter((h) => h.level === 'Tinggi').length;

    // Rata-rata persentase stres
    const avgPct = total > 0
      ? Math.round(history.reduce((acc, h) => acc + (h.percentage || 0), 0) / total)
      : 0;

    return { total, rendah, sedang, tinggi, avgPct };
  }, [history]);

  // ── Statistik semester ────────────────────────────────────────────────
  const semesterDist = useMemo(() => {
    const dist = {};
    history.forEach((h) => {
      const sem = `Sem ${h.semester}`;
      dist[sem] = (dist[sem] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]))
      .map(([label, value]) => ({ label, value, color: 'var(--primary)' }));
  }, [history]);

  // ── Kartu statistik utama ─────────────────────────────────────────────
  const statCards = [
    { icon: '📊', label: 'Total Prediksi', value: stats.total, color: 'var(--primary)' },
    { icon: '😊', label: 'Stres Rendah',   value: stats.rendah, color: 'var(--green)' },
    { icon: '😐', label: 'Stres Sedang',   value: stats.sedang, color: 'var(--yellow)' },
    { icon: '😰', label: 'Stres Tinggi',   value: stats.tinggi, color: 'var(--red)' },
    { icon: '📈', label: 'Rata-rata Stres', value: `${stats.avgPct}%`, color: '#8b5cf6' },
  ];

  // ── Data grafik distribusi level ──────────────────────────────────────
  const barData = [
    { label: 'Rendah', value: stats.rendah, color: 'var(--green)' },
    { label: 'Sedang', value: stats.sedang, color: 'var(--yellow)' },
    { label: 'Tinggi', value: stats.tinggi, color: 'var(--red)' },
  ];

  if (stats.total === 0) {
    return (
      <div className="card fade-up" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '.75rem' }}>📊</p>
        <p style={{ color: 'var(--text-muted)' }}>
          Belum ada data untuk ditampilkan. Lakukan prediksi pertama Anda!
        </p>
      </div>
    );
  }

  return (
    <div className="fade-up dashboard-wrapper">

      {/* ── Kartu Statistik ─────────────────────────────────────────── */}
      <div className="stat-grid">
        {statCards.map((s) => (
          <div className="stat-card card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '1a', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grafik ─────────────────────────────────────────────────── */}
      <div className="charts-grid">

        {/* Grafik distribusi level stres */}
        <div className="card">
          <h3 className="chart-title">📉 Distribusi Tingkat Stres</h3>
          <BarChart data={barData} />
        </div>

        {/* Grafik distribusi per semester (jika ada) */}
        {semesterDist.length > 0 && (
          <div className="card">
            <h3 className="chart-title">🎓 Distribusi per Semester</h3>
            <BarChart data={semesterDist} />
          </div>
        )}

      </div>

      {/* ── Progress Ring sederhana (CSS) ──────────────────────────── */}
      <div className="card proportion-card">
        <h3 className="chart-title">🥧 Proporsi Kategori Stres</h3>
        <div className="proportion-bars">
          {barData.map((d) => {
            const pct = stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0;
            return (
              <div key={d.label} className="prop-row">
                <span className="prop-label">{d.label}</span>
                <div className="prop-track">
                  <div
                    className="prop-fill"
                    style={{ width: `${pct}%`, background: d.color }}
                  />
                </div>
                <span className="prop-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
