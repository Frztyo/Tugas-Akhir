/**
 * localStorage.js
 * Utilitas untuk menyimpan dan mengambil riwayat prediksi dari Local Storage.
 */

const STORAGE_KEY = 'stress_prediction_history';

/**
 * Mengambil semua riwayat prediksi dari Local Storage.
 * @returns {Array} Array of prediction objects
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Menyimpan satu entri prediksi baru ke Local Storage.
 * @param {Object} prediction - Objek prediksi yang akan disimpan
 */
export function saveHistory(prediction) {
  const history = getHistory();
  const newEntry = {
    id: Date.now(), // ID unik berdasarkan timestamp
    ...prediction,
    tanggal: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  history.unshift(newEntry); // tambah di awal array agar riwayat terbaru tampil pertama
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
}

/**
 * Menghapus satu entri prediksi berdasarkan ID.
 * @param {number} id - ID unik prediksi yang akan dihapus
 */
export function deleteEntry(id) {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Menghapus seluruh riwayat prediksi.
 */
export function clearAllHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
