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
git clone [ISI_LINK_REPO]
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

**Router** menerima request dan mencocokkan path-nya. **Middleware** memeriksa token JWT (`authenticate`) dan memvalidasi input (`validate`) — jika salah satu gagal, request langsung ditolak di tahap ini. **Controller** hanya menerima request dan mengembalikan response, tanpa menangani logika bisnis. **Service** adalah tempat logika bisnis berada (misalnya validasi stok tidak boleh negatif). **Repository** adalah satu-satunya bagian yang berkomunikasi langsung dengan database melalui Sequelize.

Saya memisahkan lapisan-lapisan ini agar masing-masing hanya memiliki satu tanggung jawab. Jika suatu saat database atau ORM diganti, cukup ubah repository-nya saja, sementara bagian lain tidak perlu disentuh.

### 2. Keamanan & Token

Saya memilih **HttpOnly Cookie** (pada project ini masih menggunakan Bearer token biasa agar lebih mudah diuji melalui Postman).

Alasannya: token yang disimpan di **Local Storage** dapat dibaca oleh JavaScript, sehingga rentan dicuri jika terjadi celah **XSS**. Token di **HttpOnly Cookie** tidak dapat diakses oleh JavaScript sama sekali, sehingga lebih aman dari XSS. Risikonya bergeser ke **CSRF**, namun ini dapat dimitigasi dengan `SameSite=Strict` atau CSRF token terpisah. Menurut saya, risiko XSS lebih berbahaya, sehingga HttpOnly Cookie tetap menjadi pilihan yang lebih aman.

### 3. Penanganan Konkurensi

Jika stok dibaca terlebih dahulu di kode, baru dihitung dan disimpan, terdapat celah waktu antara proses baca dan tulis. Dua request dapat membaca stok yang sama (misalnya 1) hampir bersamaan dan sama-sama berhasil mengurangi stok, padahal seharusnya hanya satu yang boleh berhasil.

Solusi yang saya gunakan adalah satu query UPDATE atomik langsung di database:

```sql
UPDATE items SET stock = stock - :amount WHERE id = :id AND stock >= :amount
```

Database akan mengunci baris tersebut selama query berjalan, sehingga request kedua baru diproses setelah request pertama selesai. Jika stok sudah tidak mencukupi (`stock >= amount` bernilai salah), tidak ada baris yang ter-update (`affectedRows = 0`), dan saya mengembalikan response `409 Conflict`. Dengan cara ini stok tidak akan pernah menjadi negatif. Saya sudah menguji ini pada endpoint `PATCH /items/:id/decrease-stock` dan hasilnya sesuai ekspektasi.