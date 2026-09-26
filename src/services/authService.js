const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/userRepository')

async function register({ username, password }) {
  const existing = await userRepository.findByUsername(username)
  if (existing) {
    const error = new Error('Username sudah terdaftar')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await userRepository.create({ username, password: hashedPassword })

  return { id: user.id, username: user.username }
}

async function login({ username, password }) {
  const user = await userRepository.findByUsername(username)
  if (!user) {
    const error = new Error('Username atau password salah')
    error.statusCode = 401
    throw error
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const error = new Error('Username atau password salah')
    error.statusCode = 401
    throw error
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return { token }
}

module.exports = { register, login }