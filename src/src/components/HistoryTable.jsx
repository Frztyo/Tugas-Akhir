// HistoryTable.jsx — Tabel riwayat prediksi dengan pencarian & filter
import { useState } from 'react';
import { deleteEntry, clearAllHistory } from '../utils/localStorage';
import './HistoryTable.css';

export default function HistoryTable({ history, onUpdate }) {
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('Semua');

  // ── Filter & Pencarian ─────────────────────────────────────────────────
  const filtered = history.filter((item) => {
    const matchSearch = item.nama?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Semua' || item.level === filter;
    return matchSearch && matchFilter;
  });

  // ── Hapus satu entri ──────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (window.confirm('Hapus data ini?')) {
      deleteEntry(id);
      onUpdate(); // refresh dari parent
    }
  };

  // ── Hapus semua riwayat ───────────────────────────────────────────────
  const handleClearAll = () => {
    if (window.confirm('Hapus SELURUH riwayat prediksi? Tindakan ini tidak dapat dibatalkan.')) {
      clearAllHistory();
      onUpdate();
    }
  };

  const badgeClass = { Rendah: 'badge-rendah', Sedang: 'badge-sedang', Tinggi: 'badge-tinggi' };

  return (
    <div className="fade-up">
      {/* Toolbar: Pencarian + Filter + Hapus Semua */}
      <div className="history-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              id="search-history"
            />
          </div>

          {/* Filter level */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input filter-select"
            id="filter-level"
          >
            <option value="Semua">Semua Level</option>
            <option value="Rendah">Stres Rendah</option>
            <option value="Sedang">Stres Sedang</option>
            <option value="Tinggi">Stres Tinggi</option>
          </select>
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={handleClearAll}
          disabled={history.length === 0}
          id="btn-clear-all"
        >
          🗑 Hapus Semua
        </button>
      </div>

      {/* Tabel atau Empty State */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-icon">📭</p>
          <p className="empty-text">
            {history.length === 0
              ? 'Belum ada riwayat prediksi. Mulai prediksi pertama Anda!'
              : 'Tidak ada data yang sesuai pencarian.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Semester</th>
                <th>Tanggal</th>
                <th>Hasil</th>
                <th>Persentase</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{item.nama}</td>
                  <td>Semester {item.semester}</td>
                  <td style={{ fontSize: '.83rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.tanggal}
                  </td>
                  <td>
                    <span className={`badge ${badgeClass[item.level]}`}>
                      {item.level}
                    </span>
                  </td>
                  <td>
                    <div className="mini-bar-wrap">
                      <div
                        className="mini-bar"
                        style={{
                          width: `${item.percentage}%`,
                          background:
                            item.level === 'Rendah' ? 'var(--green)'
                            : item.level === 'Sedang' ? 'var(--yellow)'
                            : 'var(--red)',
                        }}
                      />
                      <span className="mini-pct">{item.percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                      id={`btn-delete-${item.id}`}
                      title="Hapus entri ini"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="history-count">
        Menampilkan <strong>{filtered.length}</strong> dari <strong>{history.length}</strong> data
      </p>
    </div>
  );
}
