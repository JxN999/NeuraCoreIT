import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { auth } from './auth.js'
import { db } from './db.js'
const router = Router()
const uploadDir = path.join(process.env.DATA_DIR||'./data','uploads')
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({ destination:(req,f,cb)=>cb(null,uploadDir), filename:(req,f,cb)=>cb(null, `${Date.now()}-${f.originalname}`) })
const upload = multer({ storage })
router.post('/upload', auth(true), upload.single('file'), async (req,res)=>{
  const f=req.file; const id=uuid(); const u=req.user
  db.data.files.push({ id, user_id:u.sub, original_name:f.originalname, mime:f.mimetype, size:f.size, path:f.path, created_at:new Date().toISOString() })
  await db.write(); res.status(201).json({ id, name:f.originalname, size:f.size, mime:f.mimetype })
})
router.get('/', auth(true), async (req,res)=>{
  const u=req.user; const rows=db.data.files.filter(f=>f.user_id===u.sub).map(f=>({ id:f.id, name:f.original_name, size:f.size, mime:f.mime, created_at:f.created_at }))
  res.json(rows)
})
router.get('/:id/download', auth(true), async (req,res)=>{
  const u=req.user; const row=db.data.files.find(f=>f.id===req.params.id && f.user_id===u.sub); if(!row) return res.status(404).json({error:'Not found'})
  res.download(row.path, row.original_name)
})
router.delete('/:id', auth(true), async (req,res)=>{
  const u=req.user; const idx=db.data.files.findIndex(f=>f.id===req.params.id && f.user_id===u.sub); if(idx===-1) return res.status(404).json({error:'Not found'})
  try{ fs.unlinkSync(db.data.files[idx].path) }catch{}
  db.data.files.splice(idx,1); await db.write(); res.status(204).end()
})
export default router
