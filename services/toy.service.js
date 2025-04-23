import fs from 'fs'
import { utilService } from './util.service.js'

const PAGE_SIZE = 6
const toys = utilService.readJsonFile('data/toy.json')
const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

export const toyService = {
  query,
  get,
  remove,
  save,
  getLabels,
  getLabelsCount,
}

function query(filterBy = {}, pageIdx = 0) {
  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    toys = toys.filter(toy => regExp.test(toy.name))
  }
  if (filterBy.maxPrice) {
    toys = toys.filter(toy => toy.price <= filterBy.maxPrice)
  }

  if (filterBy.minPrice) {
    toys = toys.filter(toy => toy.price >= filterBy.minPrice)
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    toys = toys.filter(toy => filterBy.labels.every(label => toy.labels.includes(label)))
  }

  const { sortBy, sortDir = 1 } = filterBy

  if (sortBy === 'name') {
    toys = toys.sort((a, b) => a.name.localeCompare(b.name) * sortDir)
  } else if (sortBy === 'price') {
    toys = toys.sort((a, b) => (a.price - b.price) * sortDir)
  } else if (sortBy === 'createdAt') {
    toys = toys.sort((a, b) => (a.createdAt - b.createdAt) * sortDir)
  }

  const totalCount = toys.length

  const startIdx = pageIdx * PAGE_SIZE
  const pagedToys = toys.slice(startIdx, startIdx + PAGE_SIZE)

  return Promise.resolve({
    toys: pagedToys,
    totalCount,
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
    toys[idx] = { ...toys, ...toy }
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

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const toyStr = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toy.json', toyStr, err => {
      if (err) {
        return console.log(err)
      }
      resolve()
    })
  })
}
