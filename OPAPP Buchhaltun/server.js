const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const publicDir = path.join(__dirname, 'OPAPP Buchhaltun');
const dataDir = path.join(publicDir, 'data');
const stores = new Set(['konten','buchungen','waren','lagerbewegungen','bestellungen','users']);

async function readStore(store){
  try {
    const file = path.join(dataDir, store + '.json');
    const text = await fs.readFile(file, 'utf8');
    return JSON.parse(text || '[]');
  } catch(err){
    return [];
  }
}

async function writeStore(store,data){
  const file = path.join(dataDir, store + '.json');
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function parseBody(req){
  return new Promise(resolve => {
    let data='';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { resolve({}); }
    });
  });
}

function sendJSON(res, obj, status=200){
  res.statusCode = status;
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req,res)=>{
  const parsed = url.parse(req.url, true);
  if(parsed.pathname.startsWith('/api')){
    if(parsed.pathname === '/api/login' && req.method === 'POST'){
      const body = await parseBody(req);
      const users = await readStore('users');
      const user = users.find(u => u.email === body.email && u.password === body.password);
      if(user){
        return sendJSON(res,{success:true,user:{id:user.id,name:user.name}});
      }
      return sendJSON(res,{success:false,error:'Ungültige Zugangsdaten'},401);
    }
    const parts = parsed.pathname.split('/').filter(Boolean); // ['api','store','id?']
    const store = parts[1];
    const id = parts[2];
    if(!stores.has(store)){
      res.statusCode = 404; res.end(); return;
    }
    if(req.method === 'GET' && !id){
      const data = await readStore(store);
      return sendJSON(res, data);
    }
    if(req.method === 'POST' && !id){
      const body = await parseBody(req);
      const data = await readStore(store);
      body.id = body.id || Date.now().toString();
      body.created_at = new Date().toISOString();
      body.updated_at = body.created_at;
      data.push(body);
      await writeStore(store,data);
      return sendJSON(res, body, 201);
    }
    if(req.method === 'PUT' && id){
      const body = await parseBody(req);
      const data = await readStore(store);
      const idx = data.findIndex(r => String(r.id||r.nummer) === id);
      if(idx !== -1){
        body.id = data[idx].id;
        body.updated_at = new Date().toISOString();
        data[idx] = body;
        await writeStore(store,data);
      }
      return sendJSON(res, body);
    }
    if(req.method === 'DELETE' && id){
      const data = await readStore(store);
      const idx = data.findIndex(r => String(r.id||r.nummer) === id);
      if(idx !== -1){
        data.splice(idx,1);
        await writeStore(store,data);
      }
      res.statusCode = 204;
      return res.end();
    }
    res.statusCode = 405; res.end(); return;
  }
  // serve static files
  let filePath = path.join(publicDir, parsed.pathname);
  try {
    const stat = await fs.stat(filePath);
    if(stat.isDirectory()){
      filePath = path.join(filePath, 'buchhaltung.html');
    }
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
    res.statusCode = 200;
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.end(data);
  } catch(err){
    res.statusCode = 404;
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
