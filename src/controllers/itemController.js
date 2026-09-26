const itemService = require('../services/itemService')

async function getItems(req, res, next) {
  try {
    const { search, page, limit } = req.query
    const result = await itemService.getItems({ search, page, limit })
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

async function createItem(req, res, next) {
  try {
    const item = await itemService.createItem(req.body)
    res.status(201).json({ message: 'Barang berhasil ditambahkan', item })
  } catch (err) {
    next(err)
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await itemService.updateItem(req.params.id, req.body)
    res.status(200).json({ message: 'Barang berhasil diperbarui', item })
  } catch (err) {
    next(err)
  }
}

async function deleteItem(req, res, next) {
  try {
    await itemService.deleteItem(req.params.id)
    res.status(200).json({ message: 'Barang berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

async function decreaseStock(req, res, next) {
  try {
    const { amount } = req.body
    const item = await itemService.decreaseStock(req.params.id, amount)
    res.status(200).json({ message: 'Stok berhasil dikurangi', item })
  } catch (err) {
    next(err)
  }
}

module.exports = { getItems, createItem, updateItem, deleteItem, decreaseStock }