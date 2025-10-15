import { Router } from 'express'
import Joi from 'joi'
import { auth } from './auth.js'
import { db } from './db.js'
import crypto from 'node:crypto'

const router = Router()

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().allow(''),
  lastName: Joi.string().allow(''),
  role: Joi.string().valid('admin','user','editor').default('user')
})

router.get('/', auth(true), async (req, res)=>{
  const list = db.data.users.map(u => ({
    id: u.id_num || 0,
    email: u.email,
    displayName: u.displayName || (u.email?.split('@')[0] || ''),
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    role: u.role || 'user',
    profilePictureUrl: null
  }))
  res.json(list)
})

router.post('/', auth(true), async (req, res)=>{
  const { value, error } = userSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })
  const exists = db.data.users.find(u => u.email.toLowerCase() === value.email.toLowerCase())
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const id = crypto.randomUUID()
  const existingMax = db.data.users.reduce((m,u)=> Math.max(m, (u.id_num||0)), 0)
  const id_num = existingMax + 1
  const displayName = value.email.split('@')[0]
  const user = { id, id_num, email:value.email, displayName, firstName:value.firstName||'', lastName:value.lastName||'', role:value.role||'user', password_hash: '', created_at: new Date().toISOString() }
  db.data.users.push(user)
  await db.write()
  res.status(201).json({ id: id_num })
})

router.patch('/:id', auth(true), async (req, res)=>{
  const id = Number(req.params.id)
  const u = db.data.users.find(u => (u.id_num||0) === id)
  if(!u) return res.status(404).json({ error: 'Not found' })
  const { firstName, lastName, role } = req.body || {}
  if (typeof firstName === 'string') u.firstName = firstName
  if (typeof lastName === 'string') u.lastName = lastName
  if (typeof role === 'string') u.role = role
  await db.write()
  res.json({ ok:true })
})

export default router
