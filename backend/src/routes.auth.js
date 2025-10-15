import { Router } from 'express'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import crypto from 'node:crypto'
import { db } from './db.js'
const router = Router()

const registerSchema = Joi.object({ email:Joi.string().email().required(), password:Joi.string().min(8).max(128).required() })
function hash(p){ return crypto.createHash('sha256').update(p).digest('hex') }

router.post('/register', async (req,res)=>{
  const { value, error } = registerSchema.validate(req.body)
  if(error) return res.status(400).json({ error: error.message })
  const { email, password } = value
  const exists = db.data.users.find(u=>u.email.toLowerCase()===email.toLowerCase())
  if(exists) return res.status(409).json({ error: 'Email already registered' })
  const id = uuid()
  const existingMax = db.data.users.reduce((m,u)=>Math.max(m, (u.id_num||0)), 0)
  const id_num = existingMax + 1
  const displayName = email.split('@')[0]
  const user = { id, id_num, email, displayName, firstName:'', lastName:'', role:'user', password_hash: hash(password), created_at: new Date().toISOString() }
  db.data.users.push(user); await db.write()
  const token = jwt.sign({ sub:id, id:id_num, email, role:'user', displayName, firstName:'', lastName:'' }, process.env.JWT_SECRET||'dev', { expiresIn:'7d' })
  res.status(201).json({ token })
})

const loginSchema = Joi.object({ email:Joi.string().email().required(), password:Joi.string().required() })
router.post('/login', async (req,res)=>{
  const { value, error } = loginSchema.validate(req.body)
  if(error) return res.status(400).json({ error: error.message })
  const { email, password } = value
  const u = db.data.users.find(u=>u.email.toLowerCase()===email.toLowerCase())
  if(!u || u.password_hash!==hash(password)) return res.status(401).json({ error:'Invalid credentials' })
  const token = jwt.sign({ sub:u.id, id:(u.id_num||1), email:u.email, role:(u.role||'user'), displayName:(u.displayName||u.email.split('@')[0]), firstName:(u.firstName||''), lastName:(u.lastName||'') }, process.env.JWT_SECRET||'dev', { expiresIn:'7d' })
  res.json({ token })
})

export default router
