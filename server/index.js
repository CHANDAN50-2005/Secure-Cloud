import 'dotenv/config'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1

  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
  })
})

app.use('/api/auth', authRoutes)

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found.' })
})

app.use((error, _request, response, _next) => {
  if (error.code === 11000) {
    return response.status(409).json({ error: 'An account with that email already exists.' })
  }

  const status = error.status || error.statusCode || 500
  if (status >= 500) console.error('API request failed.')

  return response.status(status).json({
    error: status >= 500 ? 'An unexpected server error occurred.' : error.message,
  })
})

const server = app.listen(port, () => {
  console.log(`SecureCloud API listening on port ${port}`)
})

mongoose.connection.on('error', () => {
  console.error('MongoDB connection error.')
})

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Authentication routes are unavailable.')
} else {
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('MongoDB connected.'))
    .catch(async () => {
      console.error('MongoDB connection failed. Check MONGODB_URI and network access.')
      await mongoose.disconnect()
      server.close(() => process.exit(1))
    })
}
