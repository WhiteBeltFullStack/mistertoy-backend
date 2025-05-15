import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { loggerService } from './services/logger.service.js'
// import { toyService } from './services/toy.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
//* App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))

app.set('query parser', 'extended')

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)

// get toys
// app.get('/api/toy', async (req, res) => {
//   const { filterBy = {}, pageIdx } = req.query

//   try {
//     const { toys, totalCount, PAGE_SIZE } = await toyService.query(filterBy, pageIdx)
//     res.send({ toys, totalCount, PAGE_SIZE })
//   } catch (error) {
//     loggerService.error('Cannot load toys', error)
//     res.status(400).send('Cannot load toys')
//   }
// })
// //get dashboard
// app.get('/api/toy/dashboard', async (req, res) => {
//   console.log('triggered:')
//   // const { filterBy = {}, pageIdx } = req.query

//   try {
//     const stats = await toyService.getStats()
//     res.send(stats)
//   } catch (error) {
//     loggerService.error('Cannot load stats', error)
//     res.status(400).send('Cannot load stats')
//   }
// })
// //get labels
// app.get('/api/toy/labels', async (req, res) => {
//   try {
//     const labels = await toyService.getLabels()
//     res.send(labels)
//   } catch (error) {
//     loggerService.error('Cannot get labels', error)
//     res.status(400).send(error)
//   }
// })
// //get stats
// app.get('/api/toy/labels/count', async (req, res) => {
//   try {
//     const labelsCount = await toyService.getLabelsCount()
//     res.send(labelsCount)
//   } catch (error) {
//     loggerService.error('Cannot get labels count', error)
//     res.status(400).send(error)
//   }
// })
// //get toy by id
// app.get('/api/toy/:toyId', async (req, res) => {
//   const { toyId } = req.params

//   try {
//     const toy = await toyService.get(toyId)
//     res.send(toy)
//   } catch (error) {
//     loggerService.error('Cannot get toy', error)
//     res.status(400).send(error)
//   }
// })

// app.post('/api/toy', async (req, res) => {
//   const { name, price, labels } = req.body
//   const toy = {
//     name,
//     price: +price,
//     labels,
//   }
//   try {
//     const savedToy = await toyService.save(toy)
//     res.send(savedToy)
//   } catch (error) {
//     loggerService.error('Cannot add toy', error)
//     res.status(400).send('Cannot add toy')
//   }
// })

// app.put('/api/toy', async (req, res) => {
//   const { name, price, labels, inStock, _id } = req.body
//   const toy = {
//     _id,
//     name,
//     price,
//     labels,
//     inStock,
//   }
//   try {
//     const savedToy = await toyService.save(toy)
//     res.send(savedToy)
//   } catch (error) {
//     loggerService.error('Cannot add toy', error)
//     res.status(400).send('Cannot add toy')
//   }
// })

// app.delete('/api/toy/:toyId', async (req, res) => {
//   const { toyId } = req.params

//   try {
//     await toyService.remove(toyId)
//     res.send()
//   } catch (error) {
//     loggerService.error('Cannot delete toy', error)
//     res.status(400).send('Cannot delete toy, ' + error)
//   }
// })

app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () => {
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
