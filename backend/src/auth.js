import jwt from 'jsonwebtoken'
export function auth(required=true){
  return (req,res,next)=>{
    const h=req.headers.authorization
    if(!h){ if(required) return res.status(401).json({error:'Missing Authorization header'}); return next() }
    const token=h.replace('Bearer ','').trim()
    try{ req.user=jwt.verify(token, process.env.JWT_SECRET||'dev'); next() }
    catch{ if(required) return res.status(401).json({error:'Invalid token'}); next() }
  }
}
