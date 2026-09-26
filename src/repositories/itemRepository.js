const { Op } = require('sequelize')
const Item = require('../models/Item')

async function findAll({ search, limit, offset }) {
  const where = search
    ? { name: { [Op.like]: `%${search}%` } }
    : {}

  return Item.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'ASC']],
  })
}

async function findById(id) {
  return Item.findByPk(id)
}

async function create(data) {
  return Item.create(data)
}

async function update(item, data) {
  return item.update(data)
}

async function remove(item) {
  return item.destroy()
}

async function decreaseStock(id, amount) {
  const [affectedRows] = await Item.sequelize.query(
    `UPDATE Items SET stock = stock - :amount WHERE id = :id AND stock >= :amount`,
    {
      replacements: { id, amount },
      type: Item.sequelize.QueryTypes.UPDATE,
    }
  )
  return affectedRows
}

module.exports = { findAll, findById, create, update, remove, decreaseStock }