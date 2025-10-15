(function(){
  var API = (window.localStorage && localStorage.getItem('api_base')) || (typeof VITE_API_URL!=='undefined' ? VITE_API_URL : 'http://localhost:8080');
  var $ = function(id){ return document.getElementById(id) }
  var email = $('email'), pw = $('pw'), msg = $('msg'), btn = $('btn')
  function show(m, ok){ msg.textContent = m; msg.style.color = ok ? '#86efac' : '#fecaca' }
  async function post(url, body){
    const r = await fetch(API + url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if(!r.ok){ throw new Error(await r.text()) }
    return await r.json()
  }
  btn.addEventListener('click', async function(){
    show('Registriere...', true)
    try{
      const data = await post('/auth/register', { email: email.value.trim(), password: pw.value })
      if (data && data.token && window.localStorage){ localStorage.setItem('jwt_token', data.token) }
      show('Erfolgreich! Du bist eingeloggt.', true)
      setTimeout(function(){ window.location.href = './' }, 800)
    }catch(e){
      show('Fehler: ' + (e.message||e), false)
    }
  })
})()
