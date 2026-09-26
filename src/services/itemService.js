const itemRepository = require('../repositories/itemRepository')

async function getItems({ search = '', page = 1, limit = 10 }) {
  const pageNum = Math.max(parseInt(page), 1)
  const limitNum = Math.max(parseInt(limit), 1)
  const offset = (pageNum - 1) * limitNum

  const { rows, count } = await itemRepository.findAll({ search, limit: limitNum, offset })

  return {
    data: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    },
  }
}

async function createItem(data) {
  return itemRepository.create(data)
}

async function updateItem(id, data) {
  const item = await itemRepository.findById(id)
  if (!item) {
    const error = new Error('Barang tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (data.stock !== undefined && data.stock < 0) {
    const error = new Error('Stok tidak boleh bernilai negatif')
    error.statusCode = 400
    throw error
  }

  return itemRepository.update(item, data)
}

async function deleteItem(id) {
  const item = await itemRepository.findById(id)
  if (!item) {
    const error = new Error('Barang tidak ditemukan')
    error.statusCode = 404
    throw error
  }
  return itemRepository.remove(item)
}

async function decreaseStock(id, amount) {
  if (!amount || amount <= 0) {
    const error = new Error('Jumlah pengurangan harus lebih dari 0')
    error.statusCode = 400
    throw error
  }

  const affectedRows = await itemRepository.decreaseStock(id, amount)

  if (affectedRows === 0) {
    const error = new Error('Stok tidak mencukupi atau barang tidak ditemukan')
    error.statusCode = 409
    throw error
  }

  return itemRepository.findById(id)
}

module.exports = { getItems, createItem, updateItem, deleteItem, decreaseStock }