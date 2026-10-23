import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import express from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import Session from '../models/Session.js'
import User from '../models/User.js'

const scrypt = promisify(scryptCallback)
const router = express.Router()
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'securecloud_session'
const DUMMY_SALT = 'securecloud-invalid-account-check'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
})

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1
}

function databaseUnavailable(response) {
  return response.status(503).json({
    error: 'Authentication is unavailable until the database is connected.',
  })
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  }
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

async function hashPassword(password, salt = randomBytes(16).toString('base64url')) {
  const derivedKey = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  })

  return `${salt}.${derivedKey.toString('base64url')}`
}

async function verifyPassword(password, storedHash) {
  const [salt, encodedKey] = storedHash.split('.')
  if (!salt || !encodedKey) return false

  const expectedKey = Buffer.from(encodedKey, 'base64url')
  const actualKey = await scrypt(password, salt, expectedKey.length, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  })

  return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey)
}

async function createSession(user, response) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await Session.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt,
  })

  response.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: SESSION_DURATION_MS,
  })
}

function requireDatabase(request, response, next) {
  if (!isDatabaseConnected()) return databaseUnavailable(response)
  next()
}

async function requireSession(request, response, next) {
  if (!isDatabaseConnected()) return databaseUnavailable(response)

  const token = request.cookies[COOKIE_NAME]
  if (!token) {
    return response.status(401).json({ error: 'Please sign in to continue.' })
  }

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  })

  if (!session) {
    response.clearCookie(COOKIE_NAME, cookieOptions)
    return response.status(401).json({ error: 'Please sign in to continue.' })
  }

  const user = await User.findById(session.userId)
  if (!user) {
    await Session.deleteOne({ _id: session._id })
    response.clearCookie(COOKIE_NAME, cookieOptions)
    return response.status(401).json({ error: 'Please sign in to continue.' })
  }

  request.user = user
  next()
}

router.post('/register', authLimiter, requireDatabase, async (request, response) => {
  const fullName = typeof request.body?.fullName === 'string'
    ? request.body.fullName.trim()
    : ''
  const email = typeof request.body?.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : ''
  const password = typeof request.body?.password === 'string'
    ? request.body.password
    : ''

  if (!fullName || fullName.length > 100) {
    return response.status(400).json({ error: 'Enter a name up to 100 characters.' })
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return response.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be 8 to 128 characters.' })
  }

  const passwordHash = await hashPassword(password)
  const user = await User.create({ fullName, email, passwordHash })
  await createSession(user, response)

  return response.status(201).json({ user: publicUser(user) })
})

router.post('/login', authLimiter, requireDatabase, async (request, response) => {
  const email = typeof request.body?.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : ''
  const password = typeof request.body?.password === 'string'
    ? request.body.password
    : ''

  if (!email || !password || password.length > 128) {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }

  const user = await User.findOne({ email }).select('+passwordHash')
  const storedHash = user?.passwordHash ?? await hashPassword(password, DUMMY_SALT)
  const passwordMatches = await verifyPassword(password, storedHash)

  if (!user || !passwordMatches) {
    return response.status(401).json({ error: 'Email or password is incorrect.' })
  }

  await createSession(user, response)
  return response.json({ user: publicUser(user) })
})

router.get('/me', requireSession, (request, response) => {
  response.json({ user: publicUser(request.user) })
})

router.post('/logout', async (request, response) => {
  const token = request.cookies[COOKIE_NAME]
  response.clearCookie(COOKIE_NAME, cookieOptions)

  if (!token) return response.status(204).end()
  if (!isDatabaseConnected()) return databaseUnavailable(response)

  await Session.deleteOne({ tokenHash: hashToken(token) })
  return response.status(204).end()
})

export default router
