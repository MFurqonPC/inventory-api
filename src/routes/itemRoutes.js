const express = require('express')
const { body } = require('express-validator')
const itemController = require('../controllers/itemController')
const validate = require('../middlewares/validateMiddleware')
const authenticate = require('../middlewares/authMiddleware')

const router = express.Router()

// semua route di bawah ini wajib login
router.use(authenticate)

router.get('/', itemController.getItems)

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nama barang wajib diisi'),
    body('stock').isInt({ min: 0 }).withMessage('Stok wajib berupa angka dan tidak boleh negatif'),
    body('price').isFloat({ min: 0 }).withMessage('Harga wajib berupa angka dan tidak boleh negatif'),
  ],
  validate,
  itemController.createItem
)

router.put(
  '/:id',
  [
    body('stock').optional().isInt({ min: 0 }).withMessage('Stok tidak boleh negatif'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Harga tidak boleh negatif'),
  ],
  validate,
  itemController.updateItem
)

router.delete('/:id', itemController.deleteItem)

router.patch('/:id/decrease-stock', itemController.decreaseStock)

module.exports = router