import { JSONFilePreset } from 'lowdb/node'
import fs from 'node:fs'
import path from 'node:path'
const dataDir = process.env.DATA_DIR || './data'
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'db.json')
export const db = await JSONFilePreset(dbPath, { users: [], files: [] })
