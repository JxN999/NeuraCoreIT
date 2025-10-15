import { Router } from 'express'
import fetch from 'node-fetch'
import { auth } from './auth.js'
const router = Router()
router.post('/chat', auth(true), async (req,res)=>{
  const { provider='openai', messages=[] } = req.body || {}
  try{
    if(provider==='openai'){
      const k=process.env.OPENAI_API_KEY; if(!k) return res.status(501).json({error:'OPENAI_API_KEY not configured'})
      const r=await fetch('https://api.openai.com/v1/chat/completions',{ method:'POST', headers:{'Authorization':`Bearer ${k}`,'Content-Type':'application/json'}, body:JSON.stringify({model:'gpt-4o-mini',messages}) })
      return res.json(await r.json())
    }
    if(provider==='google'){
      const k=process.env.GOOGLE_GENAI_API_KEY; if(!k) return res.status(501).json({error:'GOOGLE_GENAI_API_KEY not configured'})
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{role:'user',parts:[{text:messages?.map(m=>m.content).join('\n')||''}]}]}) })
      return res.json(await r.json())
    }
    return res.status(400).json({ error:'Unsupported provider' })
  }catch(e){ res.status(500).json({ error:e.message }) }
})
export default router
