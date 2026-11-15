# Requirements — My Dashboard

**Proyek:** dashboard-2  
**Stack:** HTML · CSS · JavaScript (Vanilla)  
**Penyimpanan:** `localStorage` (tidak ada backend)

---

## 1. Overview & Tujuan

Dashboard produktivitas personal berbasis web statis. Pengguna dapat memantau waktu nyata, mengelola tugas harian, mengatur sesi fokus (Pomodoro), dan menyimpan tautan situs yang sering dikunjungi — semuanya di satu halaman tanpa perlu login atau koneksi server.

---

## 2. Fitur Utama

### 2.1 Jam Digital Real-Time
- Menampilkan jam, menit, detik yang diperbarui tiap detik.
- Format tampilan: tiga kotak terpisah (JAM · MENIT · DETIK) dengan animasi kedip pemisah.
- Tanggal lengkap ditampilkan dalam Bahasa Indonesia (hari, tanggal, bulan, tahun).
- Label bulan/tahun di topbar ikut berubah mengikuti waktu perangkat.

### 2.2 Greeting Dinamis
- Sapaan berubah otomatis berdasarkan jam perangkat pengguna:
  - 04.00–10.59 → *Good morning* 🌤️
  - 11.00–17.59 → *Good afternoon* ☀️
  - 18.00–03.59 → *Good night* 🌙

### 2.3 Statistik Tugas (Live Counter)
Tiga kartu statistik yang diperbarui setiap kali daftar tugas berubah:

| Kartu | Isi |
|---|---|
| Total Tasks | Jumlah semua tugas |
| Completed | Jumlah tugas yang dicentang |
| Completion Rate | Persentase (selesai ÷ total × 100%) |

### 2.4 Focus Timer (Pomodoro)
- Default: 25 menit fokus, 5 menit istirahat.
- Pengguna dapat mengubah durasi:
  - Focus: 1–180 menit
  - Break: 1–60 menit
- Tombol **Start / Pause** dan **Reset**.
- Ring progress melingkar bergerak sesuai sisa waktu.
- Tab browser menampilkan countdown saat timer berjalan.
- Saat timer habis: mode berganti otomatis (fokus → istirahat → fokus), alarm berbunyi via Web Audio API (3 beep × 5 siklus).
- Validasi: durasi tidak dapat diubah saat timer sedang berjalan.

### 2.5 To-Do List
- Tambah tugas baru lewat form input (maks. 90 karakter).
- Centang tugas → teks dicoret, statistik diperbarui.
- Hapus tugas per item.
- Data disimpan ke `localStorage` key `focusspace_tasks`, tetap ada setelah halaman di-refresh.
- Tampil pesan kosong jika belum ada tugas.

### 2.6 Quick Links
- Simpan nama + URL situs favorit.
- URL dinormalisasi otomatis (tambah `https://` jika belum ada).
- Tombol **Open** membuka URL di tab baru (`target="_blank"`, `rel="noopener noreferrer"`).
- Hapus link per item.
- Data disimpan ke `localStorage` key `focusspace_links`.

### 2.7 Daily Note / Reminder
- Konten statis berisi motivasi dan quick tip produktivitas.
- Tidak dapat diedit pengguna (read-only).

### 2.8 Toast Notification
- Notifikasi ringan muncul di pojok kanan bawah selama 2 detik untuk setiap aksi (tambah tugas, hapus, link ditambah, timer di-reset, dsb.).

---

## 3. Navigasi

- Sidebar kiri dengan 4 tautan: **Overview · Focus Timer · My Tasks · Quick Links**.
- Klik tautan: scroll halus ke section yang sesuai + highlight tautan aktif.
- Di mobile (≤620px): sidebar berubah menjadi horizontal scroll di atas halaman.

---

## 4. Responsivitas

| Breakpoint | Perilaku |
|---|---|
| ≥ 901px | Layout penuh: sidebar 248px + main |
| 621–900px | Sidebar mengecil (205px), section-grid menjadi 1 kolom |
| ≤ 620px | Sidebar horizontal, layout blok penuh, font & padding mengecil |

---

## 5. Persyaratan Non-Fungsional

| # | Persyaratan |
|---|---|
| NFR-1 | Tidak membutuhkan server, database, atau login |
| NFR-2 | Semua data tersimpan di `localStorage` browser pengguna |
| NFR-3 | Halaman dapat dibuka langsung sebagai file `.html` lokal |
| NFR-4 | Jam mengikuti zona waktu perangkat pengguna (tidak hardcode) |
| NFR-5 | Alarm menggunakan Web Audio API; gagal secara diam-diam jika browser tidak mendukung |
| NFR-6 | Tidak ada dependensi eksternal selain Google Fonts |
| NFR-7 | Aksesibilitas dasar: label `aria-label` pada tombol dan elemen interaktif |

---

## 6. Batasan Saat Ini (Known Limitations)

- Data hanya tersimpan di browser yang sama; tidak sinkron antar perangkat.
- Tidak ada fitur edit tugas (hanya tambah/hapus).
- Daily Note tidak dapat diubah pengguna.
- Tidak ada kategori atau prioritas tugas.
- Tidak ada notifikasi sistem (hanya alarm audio).
