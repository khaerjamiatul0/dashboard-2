# Design — My Dashboard

---

## 1. Layout Keseluruhan

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (248px)  │  MAIN CONTENT                        │
│                   │                                      │
│  • Brand logo     │  Topbar (greeting + tanggal)         │
│  • Nav links      │  ──────────────────────────────────  │
│  • Motivasi       │  Hero Banner (gradient biru)         │
│    (bottom card)  │    └─ teks kiri + jam digital kanan  │
│                   │  ──────────────────────────────────  │
│                   │  Stats (3 kartu: total/done/rate)    │
│                   │  ──────────────────────────────────  │
│                   │  Section Grid (1.08fr : 0.92fr)      │
│                   │    ├─ Focus Timer (kiri)             │
│                   │    └─ To-Do List (kanan)             │
│                   │  ──────────────────────────────────  │
│                   │  Lower Grid (1fr : 1fr)              │
│                   │    ├─ Quick Links (kiri)             │
│                   │    └─ Daily Note (kanan)             │
│                   │  ──────────────────────────────────  │
│                   │  Footer                              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens

### Warna
| Token | Nilai | Digunakan untuk |
|---|---|---|
| `--navy` | `#172554` | Sidebar, tombol add, heading gelap |
| `--blue` | `#4169e1` | Aksen utama, tombol primary, link |
| `--ink` | `#172033` | Teks utama |
| `--muted` | `#8490a5` | Label, subtitle, placeholder |
| `--line` | `#e9edf5` | Border kartu & input |
| `--bg` | `#f5f7fc` | Background halaman |
| `--white` | `#ffffff` | Background kartu/panel |
| `--green` | `#19a974` | (reserved) status sukses |
| `--orange` | `#f59e0b` | (reserved) status peringatan |

### Tipografi
| Peran | Font | Weight | Ukuran |
|---|---|---|---|
| Heading utama (h1, h2, h3) | Manrope | 800 | 15–31px |
| Body, label, input | DM Sans | 400–700 | 10–13px |
| Angka besar (statistik, timer) | Manrope | 800 | 20–37px |

### Border Radius
| Komponen | Radius |
|---|---|
| Kartu/panel | 17–22px |
| Input & tombol kecil | 10px |
| Timer ring | 50% (lingkaran) |
| Nav item | 12px |
| Toast | 10px |

### Shadow
```css
--shadow: 0 12px 35px rgba(29,48,94,.07);
```

---

## 3. Komponen

### 3.1 Sidebar
- Lebar: 248px (desktop), 205px (tablet), 100% horizontal (mobile).
- Background: `--navy`.
- Nav link aktif: background `#2b3d72`, teks putih.
- Bottom card: background `#223568`, border `#34477d`, padding 17px, border-radius 15px.

### 3.2 Hero Banner
- Gradient: `linear-gradient(115deg, #243d83, #426bd5 65%, #6e8fea)`.
- Dekorasi: dua lingkaran transparan di kanan atas (pseudo-element).
- Teks kiri + jam digital kanan, dipisahkan dengan `justify-content: space-between`.
- Box shadow: `0 15px 30px #4169e126`.

### 3.3 Jam Digital
- Tiga kotak unit (JAM · MENIT · DETIK) dengan background `rgba(255,255,255,.14)`.
- Pemisah `:` beranimasi blink tiap 1 detik (`steps(2, start)`).
- Tanggal di bawah jam, dipisahkan border transparan.

### 3.4 Kartu Statistik
Ikon background per kartu:
- Total tasks → `#edf1ff` (biru muda)
- Completed → `#e8f8f1` (hijau muda)
- Completion rate → `#fff4e5` (oranye muda)

### 3.5 Focus Timer Ring
- Ring menggunakan `conic-gradient` dengan CSS custom property `--progress` (dalam derajat).
- Lingkaran dalam (putih) menutup bagian tengah menggunakan `::before` dengan `inset: 9px`.
- Warna progress: `#4c70df`.

### 3.6 Panel / Kartu Konten
```
background: white
border: 1px solid var(--line)
border-radius: 18px
padding: 22px
box-shadow: var(--shadow)
```

### 3.7 Input & Form
```
border: 1px solid var(--line)
background: #fafbfe
border-radius: 10px
padding: 11px 12px
font-size: 12px
focus: border #8da5f1, box-shadow 0 0 0 3px #4169e115
```

### 3.8 Tombol
| Varian | Style |
|---|---|
| Primary | Background `--blue`, teks putih, shadow biru, hover naik 1px |
| Light | Background `#f0f3fa`, teks `#53617b`, hover lebih gelap |
| Add (+) | Background `--navy`, teks putih, border-radius 10px |
| Delete (×) | Transparan, hover background `#fff0f0` merah |

### 3.9 Toast
- Posisi: `fixed`, pojok kanan bawah (bottom: 22px, right: 22px).
- Background: `--navy`, teks putih.
- Animasi: fade + slide up (`opacity` + `translateY`), durasi 0.25s.
- Muncul 2 detik lalu hilang otomatis.

### 3.10 Pill Badge
```
font-size: 10px
color: #4968c9
background: #eef2ff
padding: 6px 10px
border-radius: 20px
font-weight: 700
```

---

## 4. Responsivitas

### Desktop (≥901px) — Default
- Sidebar 248px fixed di kiri.
- Main content maksimal 1200px, padding 34px 42px.
- Section grid: `1.08fr 0.92fr` (timer lebih lebar).
- Lower grid: `1fr 1fr`.

### Tablet (621–900px)
- Sidebar mengecil ke 205px.
- Main padding: 28px 24px.
- Section grid: 1 kolom penuh.

### Mobile (≤620px)
- Sidebar menjadi bar horizontal, `display: flex`, overflow-x auto.
- Nav label & bottom card disembunyikan.
- Nav link: `white-space: nowrap`, padding dikecilkan.
- Semua section menjadi 1 kolom.
- Hero: flex-direction column, teks & jam tersusun vertikal.
- Timer ring mengecil ke 170px.
- Font heading dan angka statistik dikurangi.

---

## 5. Referensi File

- Markup: `#[[file:index.html]]`
- Styling: `#[[file:style.css]]`
- Logika: `#[[file:script.js]]`
