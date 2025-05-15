import fs from 'fs'
import { utilService } from './util.service.js'
import path from 'path'

const PAGE_SIZE = 5

const toys = utilService.readJsonFile('data/toy.json')
const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

export const toyService = {
  query,
  get,
  remove,
  save,
  getLabels,
  getLabelsCount,
  getStats,
}

function query(filterBy = {}, pageIdx = 0) {
  let toysToQuery = [...toys]

  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    toysToQuery = toysToQuery.filter(toy => regExp.test(toy.name))
  }
  if (filterBy.maxPrice) {
    toysToQuery = toysToQuery.filter(toy => toy.price <= filterBy.maxPrice)
  }

  if (filterBy.minPrice) {
    toysToQuery = toysToQuery.filter(toy => toy.price >= filterBy.minPrice)
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    toysToQuery = toysToQuery.filter(toy => filterBy.labels.every(label => toy.labels.includes(label)))
  }

  const { sortBy, sortDir = 1 } = filterBy

  if (sortBy === 'name') {
    toysToQuery = toysToQuery.sort((a, b) => a.name.localeCompare(b.name) * sortDir)
  } else if (sortBy === 'price') {
    toysToQuery = toysToQuery.sort((a, b) => (a.price - b.price) * sortDir)
  } else if (sortBy === 'createdAt') {
    toysToQuery = toysToQuery.sort((a, b) => (a.createdAt - b.createdAt) * sortDir)
  }

  const totalCount = toysToQuery.length

  const startIdx = pageIdx * PAGE_SIZE
  const pagedToys = toysToQuery.slice(startIdx, startIdx + PAGE_SIZE)

  return Promise.resolve({
    toys: pagedToys,
    totalCount,
    PAGE_SIZE,
  })
}

function get(toyId) {
  const toy = toys.find(toy => toyId === toy._id)
  if (!toy) return Promise.reject('Toy not found')
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex(toy => toyId === toy._id)
  if (idx === -1) return Promise.reject('No such toy')
  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  if (toy._id) {
    const idx = toys.findIndex(currToy => currToy._id === toy._id)
    // toys[idx] = { ...toys, ...toy }
    toys[idx] = { ...toys[idx], ...toy }
  } else {
    toy._id = _makeId()
    toy.createdAt = Date.now()
    toy.inStock = true
    toys.unshift(toy)
  }
  return _saveToysToFile().then(() => toy)
}

function getLabels() {
  return Promise.resolve(labels)
}

function getLabelsCount() {
  const labelCounts = {}
  toys.forEach(toy => {
    toy.labels.forEach(label => {
      if (!labelCounts[label]) labelCounts[label] = { total: 0, inStock: 0 }
      labelCounts[label].total++
      if (toy.inStock) labelCounts[label].inStock++
    })
  })
  return Promise.resolve(labelCounts)
}

function _makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function getStats() {
  const toysToQuery = [...toys]

  const labelPriceMap = {}
  const labelCountMap = {}
  const labelInStockCountMap = {}

  toysToQuery.forEach(toy => {
    toy.labels.forEach(label => {
      // Avg price per label
      if (!labelPriceMap[label]) {
        labelPriceMap[label] = { totalPrice: 0, count: 0 }
      }
      labelPriceMap[label].totalPrice += toy.price
      labelPriceMap[label].count++

      // Inventory count per label
      if (!labelCountMap[label]) {
        labelCountMap[label] = 0
        labelInStockCountMap[label] = 0
      }
      labelCountMap[label]++
      if (toy.inStock) labelInStockCountMap[label]++
    })
  })

  // Build final average price map
  const avgPricePerLabel = {}
  for (const label in labelPriceMap) {
    const { totalPrice, count } = labelPriceMap[label]
    avgPricePerLabel[label] = +(totalPrice / count).toFixed(2)
  }

  // Build in-stock percentage per label
  const inStockPercentByLabel = {}
  for (const label in labelCountMap) {
    const percent = (labelInStockCountMap[label] / labelCountMap[label]) * 100
    inStockPercentByLabel[label] = +percent.toFixed(2)
  }

  // Generate random line chart data (last 6 months)
  const lineChartData = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    lineChartData.push({
      date: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
      value: Math.floor(Math.random() * 100) + 1,
    })
  }

  return Promise.resolve({
    avgPricePerLabel,
    inStockPercentByLabel,
    lineChartData,
  })
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const toyStr = JSON.stringify(toys, null, 4)
    const dir = path.dirname('data/toy.json')

    // Ensure the directory exists
    fs.mkdir(dir, { recursive: true }, err => {
      if (err) return reject(err)

      // Now write the file
      fs.writeFile('data/toy.json', toyStr, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}
