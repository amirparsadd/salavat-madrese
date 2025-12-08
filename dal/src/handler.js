const { Hono } = require('hono')
const { z } = require('zod')
const { zValidator } = require('@hono/zod-validator')

const {
  getClickCount,
  incrementClickCount,
  getConfig,
  setConfig,
  getAllConfigs
} = require('./db')

const { ACCESS_TOKEN } = require('./config')

const app = new Hono()

app.use('*', (c, next) => {
  const auth = c.req.header('authorization')
  if (!auth || auth !== ACCESS_TOKEN) {
    return c.json({ success: false, error: 'Invalid authorization header' }, 403)
  }
  return next()
})

app.get('/clicks', async (c) => {
  const count = await getClickCount()
  return c.json({ success: true, data: count })
})

app.post(
  '/clicks',
  zValidator(
    'json',
    z.object({
      amount: z.number().min(0)
    })
  ),
  async (c) => {
    const { amount } = c.req.valid('json')
    await incrementClickCount(amount)
    return c.json({ success: true }, 201)
  }
)

app.get('/configs', async (c) => {
  const configs = await getAllConfigs()
  return c.json({ success: true, data: configs })
})

app.get('/configs/:key', async (c) => {
  const key = c.req.param('key')
  const value = await getConfig(key)

  if (value === null) {
    return c.json({ success: false, error: 'Config not found' }, 404)
  }

  return c.json({ success: true, data: value })
})

const configBody = z.object({
  value: z.string()
})

const createConfigBody = z.object({
  key: z.string(),
  value: z.string()
})

app.post(
  '/configs',
  zValidator('json', createConfigBody),
  async (c) => {
    const { key, value } = c.req.valid('json')
    await setConfig(key, value)
    return c.json({ success: true }, 201)
  }
)

app.put(
  '/configs/:key',
  zValidator('json', configBody),
  async (c) => {
    const key = c.req.param('key')
    const { value } = c.req.valid('json')
    await setConfig(key, value)
    return c.json({ success: true })
  }
)

app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404))

module.exports = app