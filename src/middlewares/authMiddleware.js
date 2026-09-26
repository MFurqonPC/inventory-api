const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization // format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // simpan info user ke request, dipakai controller berikutnya
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' })
  }
}

module.exports = authenticate