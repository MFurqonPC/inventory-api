const User = require('../models/User')

async function findByUsername(username) {
  return User.findOne({ where: { username } })
}

async function create(userData) {
  return User.create(userData)
}

module.exports = { findByUsername, create }