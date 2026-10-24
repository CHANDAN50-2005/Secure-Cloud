import express from 'express'
import helmet from 'helmet'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(helmet())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`SecureCloud API listening on port ${port}`)
})
