const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const validate = require('../middlewares/validateMiddleware')

const router = express.Router()

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username wajib diisi'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  validate,
  authController.register
)

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username wajib diisi'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
  ],
  validate,
  authController.login
)

module.exports = router