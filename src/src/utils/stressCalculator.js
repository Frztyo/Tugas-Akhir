/**
 * stressCalculator.js
 * Logika rule-based untuk prediksi tingkat stres mahasiswa.
 * Tidak menggunakan ML atau API eksternal.
 */

/**
 * Menghitung skor stres berdasarkan input form.
 * Setiap faktor diberi bobot sesuai kontribusinya terhadap stres.
 *
 * @param {Object} data - Data input dari form prediksi
 * @returns {Object} - { score, level, percentage, color, description, tips }
 */
export function calculateStress(data) {
  let score = 0;

  // ── Jam Tidur: kurang tidur = stres lebih tinggi ──────────────────────────
  const sleep = parseFloat(data.jamTidur);
  if (sleep < 5) score += 4;
  else if (sleep < 6) score += 3;
  else if (sleep < 7) score += 2;
  else if (sleep < 8) score += 1;
  // ≥ 8 jam = 0 poin

  // ── Lama Belajar: terlalu lama belajar bisa meningkatkan stres ─────────────
  const study = parseFloat(data.lamaBelajar);
  if (study > 8) score += 3;
  else if (study > 6) score += 2;
  else if (study > 4) score += 1;

  // ── Tugas per Minggu: semakin banyak = semakin stres ──────────────────────
  const tasks = parseInt(data.tugasPerMinggu);
  if (tasks > 10) score += 4;
  else if (tasks > 7) score += 3;
  else if (tasks > 4) score += 2;
  else if (tasks > 2) score += 1;

  // ── Olahraga: olahraga rutin mengurangi stres ─────────────────────────────
  const exercise = parseInt(data.frekuensiOlahraga);
  if (exercise === 0) score += 3;
  else if (exercise < 2) score += 2;
  else if (exercise < 3) score += 1;
  // ≥ 3x/minggu = 0 poin

  // ── IPK: IPK rendah = tekanan akademik lebih tinggi ───────────────────────
  const gpa = parseFloat(data.ipk);
  if (gpa < 2.0) score += 3;
  else if (gpa < 2.5) score += 2;
  else if (gpa < 3.0) score += 1;

  // ── Tekanan Akademik (1–10): langsung sebagai kontributor ─────────────────
  const akademik = parseInt(data.tekananAkademik);
  if (akademik >= 8) score += 4;
  else if (akademik >= 6) score += 3;
  else if (akademik >= 4) score += 2;
  else if (akademik >= 2) score += 1;

  // ── Tekanan Finansial (1–10) ───────────────────────────────────────────────
  const finansial = parseInt(data.tekananFinansial);
  if (finansial >= 8) score += 3;
  else if (finansial >= 5) score += 2;
  else if (finansial >= 3) score += 1;

  // ── Dukungan Sosial (1–10): dukungan tinggi mengurangi stres ──────────────
  const sosial = parseInt(data.dukunganSosial);
  if (sosial <= 3) score += 3;
  else if (sosial <= 5) score += 2;
  else if (sosial <= 7) score += 1;
  // > 7 = 0 poin

  // ── Semester: semester akhir cenderung lebih stres ────────────────────────
  const semester = parseInt(data.semester);
  if (semester >= 7) score += 2;
  else if (semester >= 5) score += 1;

  // ──────────────────────────────────────────────────────────────────────────
  // Skor maksimum teoritis ≈ 29
  // Persentase stres = (skor / 29) * 100
  const maxScore = 29;
  const percentage = Math.min(Math.round((score / maxScore) * 100), 100);

  // ── Klasifikasi Level ──────────────────────────────────────────────────────
  let level, color, description, tips;

  if (score < 8) {
    level = 'Rendah';
    color = '#22c55e'; // hijau
    description =
      'Tingkat stres Anda berada pada kategori RENDAH. Anda tampaknya mampu mengelola tekanan akademik dengan baik. Pertahankan pola hidup sehat Anda!';
    tips = [
      'Pertahankan rutinitas tidur yang baik (7–9 jam per malam).',
      'Lanjutkan kebiasaan olahraga secara teratur.',
      'Jaga keseimbangan antara belajar dan waktu istirahat.',
      'Tetap jaga komunikasi dengan teman dan keluarga.',
      'Lakukan aktivitas hobi untuk menjaga kesehatan mental.',
    ];
  } else if (score <= 15) {
    level = 'Sedang';
    color = '#f59e0b'; // kuning
    description =
      'Tingkat stres Anda berada pada kategori SEDANG. Ada beberapa faktor yang perlu diperhatikan. Lakukan langkah-langkah pencegahan untuk menghindari eskalasi stres.';
    tips = [
      'Buat jadwal belajar yang terstruktur dan realistis.',
      'Prioritaskan tugas menggunakan metode Eisenhower Matrix.',
      'Tidur minimal 7 jam per malam untuk pemulihan optimal.',
      'Luangkan waktu untuk olahraga ringan (jalan kaki, stretching).',
      'Jangan ragu untuk berbicara dengan teman, dosen, atau konselor.',
      'Batasi konsumsi kafein dan hindari begadang berlebihan.',
    ];
  } else {
    level = 'Tinggi';
    color = '#ef4444'; // merah
    description =
      'Tingkat stres Anda berada pada kategori TINGGI. Kondisi ini perlu segera mendapat perhatian. Sangat disarankan untuk mencari dukungan profesional.';
    tips = [
      'Segera konsultasikan kondisi Anda dengan konselor atau psikolog kampus.',
      'Komunikasikan beban akademik dengan dosen pembimbing Anda.',
      'Kurangi beban tugas dengan cara bernegosiasi atau meminta perpanjangan waktu.',
      'Terapkan teknik relaksasi: meditasi, pernapasan dalam, atau yoga.',
      'Pastikan pola tidur teratur — tidur adalah prioritas kesehatan.',
      'Cari dukungan dari keluarga dan sahabat terdekat.',
      'Pertimbangkan untuk mengurangi aktivitas non-esensial sementara waktu.',
    ];
  }

  return { score, level, percentage, color, description, tips };
}
