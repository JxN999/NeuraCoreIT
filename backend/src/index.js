import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes.auth.js'
import fileRoutes from './routes.files.js'
import aiRoutes from './routes.ai.js'

const app = express()
const port = Number(process.env.PORT || 8080)
const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(','), credentials: false, allowedHeaders: ['Content-Type','Authorization'] }))
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.get('/health', (_req,res)=>res.json({ ok:true }))
app.use('/auth', authRoutes)
app.use('/files', fileRoutes)
app.use('/ai', aiRoutes)
app.use((req,res)=>res.status(404).json({error:'Not found'}))
app.listen(port, ()=>console.log(`NCIT zero-native backend on http://localhost:${port}`))
