// ResultCard.jsx — Menampilkan hasil prediksi dengan indikator warna dan saran
import './ResultCard.css';

export default function ResultCard({ result }) {
  const { nama, semester, level, percentage, color, description, tips } = result;

  // Tentukan class badge sesuai level
  const badgeClass = {
    Rendah: 'badge-rendah',
    Sedang: 'badge-sedang',
    Tinggi: 'badge-tinggi',
  }[level];

  // Emoji indikator
  const emoji = { Rendah: '😊', Sedang: '😐', Tinggi: '😰' }[level];

  return (
    <div className="result-card card" style={{ borderTop: `4px solid ${color}` }}>
      {/* Header */}
      <div className="result-header">
        <div>
          <h3 className="result-name">{nama}</h3>
          <p className="result-meta">Semester {semester} · Hasil Prediksi</p>
        </div>
        <span className={`badge ${badgeClass} result-badge`}>
          {emoji} Stres {level}
        </span>
      </div>

      {/* Persentase meter */}
      <div className="result-meter">
        <div className="meter-label">
          <span>Estimasi Tingkat Stres</span>
          <span className="meter-pct" style={{ color }}>{percentage}%</span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${percentage}%`, background: color }}
          />
        </div>
      </div>

      {/* Deskripsi */}
      <p className="result-desc">{description}</p>

      {/* Saran */}
      <div className="result-tips">
        <h4>💡 Saran untuk Anda:</h4>
        <ul>
          {tips.map((tip, i) => (
            <li key={i}>
              <span className="tip-bullet">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
