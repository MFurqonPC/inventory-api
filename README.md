# Inventory Management API

RESTful API sederhana untuk manajemen inventaris barang, dengan autentikasi JWT dan proteksi endpoint. Dibuat dengan Node.js, Express, Sequelize, dan MySQL.

## Fitur

- Register & Login dengan JWT
- CRUD barang (create, read dengan search + pagination, update, delete) — semua terproteksi login
- Endpoint khusus pengurangan stok yang aman dari race condition
- Validasi input (stok dan harga tidak boleh negatif)

## Teknologi

- Node.js + Express
- MySQL (dijalankan via Docker) + Sequelize
- JWT (jsonwebtoken) + bcryptjs
- express-validator

## Cara Menjalankan

```bash
git clone https://github.com/MFurqonPC/inventory-api.git
cd inventory-api
npm install
```

Salin `.env.example` menjadi `.env`, lalu isi `JWT_SECRET` dengan string acak (bebas, yang penting rahasia).

Jalankan database dengan Docker:
```bash
docker compose up -d
```

Jalankan server:
```bash
npm run dev
```

Server berjalan di `http://localhost:3000`. Saat pertama kali dijalankan, Sequelize otomatis membuat tabel yang dibutuhkan di database.

## Dokumentasi API

Import file `Inventory-API.postman_collection.json` ke Postman untuk mencoba semua endpoint secara langsung.

Ringkasan endpoint:

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | - | Registrasi user baru |
| POST | `/auth/login` | - | Login, mengembalikan JWT |
| GET | `/items?search=&page=&limit=` | ✅ | Daftar barang, dengan search dan pagination |
| POST | `/items` | ✅ | Tambah barang |
| PUT | `/items/:id` | ✅ | Edit barang |
| PATCH | `/items/:id/decrease-stock` | ✅ | Kurangi stok (aman dari race condition) |
| DELETE | `/items/:id` | ✅ | Hapus barang |

Endpoint dengan tanda ✅ butuh header `Authorization: Bearer <token>`, token didapat dari hasil Login.

## Jawaban Pertanyaan Pemahaman

### 1. Alur Request

Alurnya: **Router → Middleware → Controller → Service → Repository**.

**Router** nangkep request dan cocokin path-nya. **Middleware** ngecek token JWT (`authenticate`) dan validasi input (`validate`) — kalau ada yang gagal, langsung ditolak di sini. **Controller** cuma nerima request dan balikin response, nggak megang logika bisnis. **Service** tempat logika bisnisnya (misal validasi stok nggak boleh minus). **Repository** satu-satunya bagian yang ngomong ke database lewat Sequelize.

Saya pisahin gini biar tiap lapisan punya satu tanggung jawab aja. Kalau nanti mau ganti database atau ORM, cukup ubah repository-nya, bagian lain nggak perlu disentuh.

### 2. Keamanan & Token

Saya pilih **HttpOnly Cookie** (di project ini masih pakai Bearer token biasa biar gampang dites di Postman).

Alasannya: token di **Local Storage** bisa dibaca JavaScript, jadi rawan dicuri kalau ada celah **XSS**. Token di **HttpOnly Cookie** nggak bisa diakses JavaScript sama sekali, jadi lebih aman dari XSS. Risikonya emang geser ke **CSRF**, tapi itu bisa dimitigasi dengan `SameSite=Strict` atau CSRF token. Buat saya, risiko XSS lebih berbahaya, jadi HttpOnly Cookie tetap pilihan yang lebih aman.

### 3. Penanganan Konkurensi

Kalau stok dibaca dulu di kode baru dihitung dan disimpan, ada celah waktu di mana 2 request bisa sama-sama baca stok = 1 dan sama-sama berhasil ngurangin, padahal harusnya cuma satu yang boleh.

Solusinya, saya pakai satu query UPDATE atomik langsung di database:

```sql
UPDATE items SET stock = stock - :amount WHERE id = :id AND stock >= :amount
```

Database yang ngunci baris itu selama update jalan, jadi request kedua baru diproses setelah yang pertama selesai. Kalau stoknya udah nggak cukup (`stock >= amount` salah), nggak ada baris yang ke-update (`affectedRows = 0`), dan saya balikin `409 Conflict`. Stok jadi nggak mungkin minus. Sudah saya tes di endpoint `PATCH /items/:id/decrease-stock` dan hasilnya sesuai.