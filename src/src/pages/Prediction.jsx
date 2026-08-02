// Prediction.jsx — Halaman prediksi stres dengan notifikasi
import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import './Prediction.css';

export default function Prediction() {
  const [notification, setNotification] = useState(null);

  // Tampilkan notifikasi sukses setelah prediksi disimpan
  const handleSaved = () => {
    setNotification({ type: 'success', message: '✅ Prediksi berhasil disimpan ke Riwayat!' });
    // Auto-dismiss setelah 3 detik
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header halaman */}
        <div className="page-header fade-up">
          <h1 className="page-title">🧪 Prediksi Tingkat Stres</h1>
          <p className="page-subtitle">
            Isi semua field di bawah ini untuk mendapatkan estimasi tingkat stres Anda
            berdasarkan kondisi akademik, pola tidur, dan dukungan sosial.
          </p>
        </div>

        {/* Form prediksi */}
        <PredictionForm onSaved={handleSaved} />
      </div>

      {/* Toast notification */}
      {notification && (
        <div className={`notification ${notification.type}`} role="alert">
          {notification.message}
        </div>
      )}
    </div>
  );
}
