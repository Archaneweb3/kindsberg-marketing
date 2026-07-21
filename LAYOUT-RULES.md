# Layout Rules — Kindsberg (Ever clone)

Dokumen ini mencegah loop: ubah layout → bug → revert.
Baca ini dulu sebelum minta “ganti grid / tata letak”.

---

## 0. Goal vs cara (penting)

**Goal client / lo — BOLEH dan HARUS:**
- Tata letak beda dari Ever
- Ga keliatan clone / ketahuan template yang sama
- Data (teks, foto, CTA) tetap dipakai

**Yang dilarang bukan goal itu**, melainkan **cara ini**:
- Tetap pakai teater scroll Ever
- Lalu “acak” class `layout__part--x* / w*` atau `!important` kiri/kanan
- Harap animasi tetap jalan tanpa bug

Cara itu hampir selalu gagal.  
Cara yang bener buat goal yang sama = **Mode B (rebuild)**: posisi memang diganti, tapi lewat HTML/CSS/JS baru — bukan geser slot di dalam mesin Ever.

Singkat:
- ❌ “Geser grid Ever supaya beda” → dilarang (teknik rusak)
- ✅ “Ganti komposisi supaya beda” → wajib (lewat rebuild)

---

## 1. Dua mode kerja (pilih satu)

| Mode | Artinya | Sentuh apa | Hasil |
|------|---------|------------|--------|
| **A — Poles** | Tetap kerangka Ever | CSS visual + copy + asset | Aman, **masih mirip Ever** (kurang untuk “jangan ketahuan”) |
| **B — Rebuild** | Layout benar-benar beda | HTML baru + CSS baru + patch `landing.js` | **Ini jalur anti-detect** — bebas posisi |

Mode A = poles biar rapi / brand.  
Mode B = jawaban untuk “client minta layout beda biar ga sama Ever”.

Tidak ada mode “acak `layout__part--x* / w*` di dalam teater + zero bug + keliatan beda total”.

---

## 2. Jangan lakukan ini (teknik, bukan goal)

- Geser class grid Ever: `layout__part--x0` … `w6`, dll. **sambil** biarkan multi-scene scroll tetap
- Paksa posisi dengan `!important` pada `left` / `width` / `top` / `transform` yang di-tween JS
- Hide teater Ever lalu tempel layout baru di atasnya tanpa ubah scroll points
- Rebuild 2+ section sekaligus
- Coding rebuild tanpa brief layout (desktop + mobile)

`!important` **tidak** membuka kebebasan grid. JS tetap mengukur geometri scene → overlap / kosong / scroll rusak.

Kalau mau posisi acak/beda: lakukan di **Mode B**, bukan di slot Ever.

---

## 3. Status section (update saat berubah)

| Section | ID | Mode aman sekarang | Catatan |
|---------|-----|--------------------|---------|
| Hero | `#top` | **A — Poles** | Split desktop **50 / 50**; kiri = video bangunan, kanan = gambar 2 orang; peek rounded |
| Solutions | `#architecture` | **A + slot swap** | Copy kiri (`x0`) ↔ handshake kanan (`x4`); quote `x2` biar tidak nabrak; mobile order ikut |
| Process | `#interior` | **A only** (scroll-safe) | Deco di-hide; title hitam (bukan `--large` putih) dikecilin; cascade 3 gambar di-mirror (atas di kanan); gallery = gambar kiri (`x0 w4`), teks/angka/arrow kanan (`x4 w2`) |
| Why Us / Territory | `#territory` | **A** / nanti **B** | Deco di-hide (`territory__deco-1/-2` + slide deco) |
| Surroundings / Location | `#location` | **A** / nanti **B** | |
| Compare / Apartments | `#apartments` | **A only** (scroll-safe) | Title dikecilin biar tidak nabrak slider; copy pendek |
| Insights / News | `#news` | **A** / nanti **B** | |
| Footer | — | bebas | |

Kalau brief client = “jangan ketahuan Ever” → section itu antri **Mode B**, jangan Mode A dipaksa.

---

## 4. Mode A — Poles (aman, tapi masih mirip)

**Boleh**
- `border-radius` / bentuk bingkai (lingkaran → rounded square)
- Warna, tipografi ringan, spacing visual kecil
- Ganti teks, foto, video
- Hide deco ornamental (`brand.css`)
- Modal isi (teks/gambar) selama `#id` modal sama

**Jangan**
- Ubah `data-custom-scroll-id`
- Ubah `layout__part--x* / y* / w* / h*`
- Hapus `scroll-controller-section` / `data-custom-scroll-wrapper`
- Patch scene di `landing.js`

**File tipikal:** `assets/stylesheets/subtle-refresh.css`, `brand.css`, copy di `index.html`

Pakai A hanya untuk polish cepat. **Jangan andalkan A untuk lolos “beda dari Ever”.**

---

## 5. Mode B — Rebuild (ini yang bikin posisi beda)

Di sini lo **memang mengganti tata letak** — kiri/kanan, stack, tanpa lingkaran, tanpa disc, dll.
Bedanya: kerangka baru, bukan slot Ever digeser.

### Wajib sebelum coding
1. Brief ½ halaman: goal anti-Ever, layout desktop, layout mobile, CTA, yang tidak boleh ada
2. Approve visual (sketsa kasar boleh)
3. Satu section saja

### Checklist teknis rebuild
- [ ] Komposisi baru (bukan mirror Ever: circle + disc + title billboard)
- [ ] Section baru **tanpa** mengandalkan grid `layout__part` Ever untuk layout utama
- [ ] Tetap punya `id` yang dipakai nav (contoh Solutions: `#architecture`)
- [ ] Modal terkait tetap hidup (contoh: `#architecture-info`)
- [ ] `landing.js`: kurangi points scene section itu jadi **1 stop** (atau sesuai brief)
- [ ] Transisi scroll: section sebelumnya → section ini → section berikutnya
- [ ] Menu aliases (`data-menu-aliases`) diarahkan ke id section yang tersisa
- [ ] Backup `landing.js` sebelum patch
- [ ] Cache bust: `landing.js?v=…` dan CSS override
- [ ] QA: orang awam harus ngerasa beda dari Ever dalam ~3 detik

### Data yang dipertahankan
Ambil dari section lama: judul, subtitle, body, list/paths, CTA, path gambar, link modal.
Rebuild = kerangka baru + **data lama**.

---

## 6. `landing.js` — aturan singkat

File minified. Scene list ada di `points:[…]` dan transisi `from:"…" / to:"…"`.

- Mode A: **jangan edit**
- Mode B: edit hanya points + transitions milik section itu
- Setelah patch: scroll harus `Hero → [section] → next` tanpa scene gallery/quote lama (kecuali brief bilang tetap)

Jangan mengandalkan CSS untuk “mematikan” scene. Matikan di **points/transitions**.

---

## 7. QA wajib (setiap perubahan layout)

**Desktop + mobile**
- [ ] Scroll masuk section mulus
- [ ] Scroll keluar ke section berikutnya mulus
- [ ] Tidak ada text overlap / kepotong
- [ ] Tidak ada area kosong aneh / section “nempel”
- [ ] Nav / hash ke section masih benar
- [ ] Modal CTA (jika ada) buka & tutup normal
- [ ] Hard refresh (Ctrl+Shift+R) setelah ganti CSS/JS
- [ ] Mode B: komposisi jelas beda dari Ever (bukan cuma radius/copy)

Kalau 1 item gagal → jangan lanjut section lain; perbaiki atau revert.

---

## 8. Cara minta kerja ke agent

**Poles (Mode A)**  
> “Poles Process mode A: rounded frame + pendekin copy. Jangan geser grid Ever.”

**Rebuild anti-Ever (Mode B)**  
> “Rebuild Solutions mode B supaya ga ketahuan Ever. Brief: … Desktop: … Mobile: … CTA: … Data lama dipakai. Jangan sentuh Process.”

**Salah paham (jangan)**  
> “Acak class x/w Ever biar beda, jangan bug.”  
→ Goal-nya benar, tekniknya salah. Minta **Mode B** sebagai gantinya.

---

## 9. Keputusan cepat

- “Warna / sudut / teks beda” → **A**
- “Posisi / komposisi beda biar ga ketahuan Ever” → **B** (wajib)
- Capek / deadline → **A** dulu di section belum kritis; jadwalkan **B** untuk section yang paling “Ever banget” (Solutions, Process, …)

---

## 10. Backup penting

| File | Kegunaan |
|------|----------|
| `index.ever-clone.bak.html` | HTML referensi struktur Ever |
| `assets/javascripts/landing.js.bak-pre-sol2` | JS scroll sebelum eksperimen Solutions rebuild |
| `assets/javascripts/landing.js.bak-modeb-20260720` | JS sebelum Mode B Solutions (1-stop) |

Sebelum Mode B: salin lagi `landing.js` ke backup bertanggal.

---

*Goal anti-Ever = sah. Yang dilarang hanya menggeser mesin Ever dari dalam. Ganti posisi dengan Mode B.*
