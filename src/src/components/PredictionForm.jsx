// PredictionForm.jsx — Form input prediksi tingkat stres
import { useState } from 'react';
import { calculateStress } from '../utils/stressCalculator';
import { saveHistory } from '../utils/localStorage';
import ResultCard from './ResultCard';

// ── Konfigurasi field form ─────────────────────────────────────────────────
const FIELDS = [
  { id: 'nama',            label: 'Nama Mahasiswa',                    type: 'text',   min: null, max: null, step: null, placeholder: 'Masukkan nama lengkap' },
  { id: 'umur',            label: 'Umur (tahun)',                      type: 'number', min: 16,   max: 40,   step: 1,    placeholder: '18–35' },
  { id: 'semester',        label: 'Semester (aktif)',                  type: 'number', min: 1,    max: 14,   step: 1,    placeholder: '1–14' },
  { id: 'jamTidur',        label: 'Jam Tidur per Hari',               type: 'number', min: 0,    max: 24,   step: 0.5,  placeholder: 'contoh: 7' },
  { id: 'lamaBelajar',     label: 'Lama Belajar per Hari (jam)',       type: 'number', min: 0,    max: 24,   step: 0.5,  placeholder: 'contoh: 4' },
  { id: 'tugasPerMinggu',  label: 'Tugas per Minggu (jumlah)',         type: 'number', min: 0,    max: 30,   step: 1,    placeholder: 'contoh: 5' },
  { id: 'frekuensiOlahraga', label: 'Frekuensi Olahraga per Minggu', type: 'number', min: 0,    max: 14,   step: 1,    placeholder: 'contoh: 3' },
  { id: 'ipk',             label: 'IPK (0.00 – 4.00)',                 type: 'number', min: 0,    max: 4,    step: 0.01, placeholder: 'contoh: 3.25' },
  { id: 'tekananAkademik', label: 'Tingkat Tekanan Akademik (1–10)',   type: 'number', min: 1,    max: 10,   step: 1,    placeholder: '1 = sangat rendah, 10 = sangat tinggi' },
  { id: 'tekananFinansial',label: 'Tingkat Tekanan Finansial (1–10)', type: 'number', min: 1,    max: 10,   step: 1,    placeholder: '1 = tidak ada, 10 = sangat berat' },
  { id: 'dukunganSosial',  label: 'Tingkat Dukungan Sosial (1–10)',   type: 'number', min: 1,    max: 10,   step: 1,    placeholder: '1 = tidak ada, 10 = sangat baik' },
];

const INITIAL_STATE = Object.fromEntries(FIELDS.map((f) => [f.id, '']));

export default function PredictionForm({ onSaved }) {
  const [form, setForm]       = useState(INITIAL_STATE);
  const [errors, setErrors]   = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Perbarui nilai field ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    // Hapus error field saat user mulai mengetik
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  // ── Validasi semua field wajib ─────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    FIELDS.forEach(({ id }) => {
      if (!form[id].toString().trim()) {
        newErrors[id] = 'Field ini wajib diisi';
      }
    });
    return newErrors;
  };

  // ── Submit form → hitung prediksi ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      // Scroll ke error pertama
      const firstErrId = Object.keys(err)[0];
      document.getElementById(firstErrId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulasi proses kalkulasi dengan loading singkat
    setLoading(true);
    setTimeout(() => {
      const calc = calculateStress(form);
      const saved = saveHistory({ ...form, ...calc });
      setResult({ ...calc, ...saved });
      setLoading(false);
      if (onSaved) onSaved(); // trigger notifikasi di parent
      // Scroll ke hasil
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  // ── Reset form ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(INITIAL_STATE);
    setErrors({});
    setResult(null);
  };

  // ── Render field berdasarkan tipe ─────────────────────────────────────
  const renderField = ({ id, label, type, min, max, step, placeholder }) => (
    <div className="form-group" key={id}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={form[id]}
        onChange={handleChange}
        className={`form-input ${errors[id] ? 'error' : ''}`}
        autoComplete="off"
      />
      {errors[id] && (
        <p style={{ color: 'var(--red)', fontSize: '.78rem', marginTop: '.3rem' }}>
          ⚠ {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="card fade-up" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            🧪 Form Prediksi Stres
          </h2>

          {/* Grid 2 kolom di layar ≥ md */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0 1.5rem' }}>
            {FIELDS.map(renderField)}
          </div>

          {/* Tombol aksi */}
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="btn-predict"
            >
              {loading ? '⏳ Menghitung...' : '🔍 Prediksi Sekarang'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              id="btn-reset"
            >
              🔄 Reset Form
            </button>
          </div>
        </div>
      </form>

      {/* Tampilkan hasil prediksi */}
      {result && (
        <div id="result-section" className="fade-up">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
