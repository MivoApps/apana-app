import https from 'https';
import fs from 'fs';
import path from 'path';

// Load .env.development.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.development.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }
} catch (e) {}

const KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;
const BOARD_ID = process.env.TRELLO_APANA_BOARD_ID;

if (!KEY || !TOKEN) {
  console.error('Error: TRELLO_API_KEY and TRELLO_TOKEN must be configured in .env.development.local');
  process.exit(1);
}

function request(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const fullUrl = `https://api.trello.com/1${endpoint}${separator}key=${KEY}&token=${TOKEN}`;
    const urlObj = new URL(fullUrl);

    let body = null;
    const headers = { 'Accept': 'application/json' };

    if (data && (method === 'POST' || method === 'PUT')) {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(urlObj, { method, headers }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const command = process.argv[2];

async function main() {
  if (command === 'lists') {
    const res = await request('GET', `/boards/${BOARD_ID}/lists?fields=name,id`);
    console.log(JSON.stringify(res.data, null, 2));
  } else if (command === 'cards') {
    const res = await request('GET', `/boards/${BOARD_ID}/cards?fields=name,id,idList,url`);
    console.log(JSON.stringify(res.data, null, 2));
  } else if (command === 'create') {
    const listNameOrId = process.argv[3];
    const cardTitle = process.argv[4];
    const cardDesc = process.argv[5] || '';

    // If listNameOrId is a name, resolve it
    let idList = listNameOrId;
    if (!idList.match(/^[0-9a-fA-F]{24}$/)) {
      const listsRes = await request('GET', `/boards/${BOARD_ID}/lists?fields=name,id`);
      const found = listsRes.data.find(l => l.name.toLowerCase().includes(listNameOrId.toLowerCase()));
      if (!found) {
        console.error(`List "${listNameOrId}" not found. Available:`, listsRes.data.map(l => l.name).join(', '));
        process.exit(1);
      }
      idList = found.id;
    }

    const res = await request('POST', `/cards`, {
      idList,
      name: cardTitle,
      desc: cardDesc
    });

    console.log(JSON.stringify({
      success: true,
      id: res.data.id,
      name: res.data.name,
      url: res.data.url
    }, null, 2));
  } else if (command === 'move') {
    const cardId = process.argv[3];
    const targetListName = process.argv[4];

    const listsRes = await request('GET', `/boards/${BOARD_ID}/lists?fields=name,id`);
    const found = listsRes.data.find(l => l.name.toLowerCase().includes(targetListName.toLowerCase()));
    if (!found) {
      console.error(`List "${targetListName}" not found.`);
      process.exit(1);
    }

    const res = await request('PUT', `/cards/${cardId}`, { idList: found.id });
    console.log(JSON.stringify({ success: true, card: res.data.name, list: found.name }, null, 2));
  } else {
    console.log('Usage: node scripts/trello.mjs [lists|cards|create <list> <title> <desc>|move <cardId> <targetList>]');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
