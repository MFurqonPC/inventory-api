const express = require('express')
const sequelize = require('./config/database')
const authRoutes = require('./routes/authRoutes')
const itemRoutes = require('./routes/itemRoutes')
const errorHandler = require('./middlewares/errorMiddleware')
require('dotenv').config()

const app = express()
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/items', itemRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' })
})

const PORT = process.env.PORT || 3000

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' })
})

app.use(errorHandler)

sequelize
  .sync() // di production sebaiknya pakai migration, bukan sync()
  .then(() => {
    console.log('Database terhubung dan model tersinkronisasi')
    app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`))
  })
  .catch((err) => console.error('Gagal koneksi database:', err))

