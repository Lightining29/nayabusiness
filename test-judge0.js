require('dotenv').config({ path: 'backend/.env' });
const KEY  = process.env.JUDGE0_API_KEY;

async function test() {
  const { default: fetch } = await import('node-fetch');
  // Test connection
  const aboutRes = await fetch('https://judge0-ce.p.rapidapi.com/about', {
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'x-rapidapi-key': KEY
    }
  });
  const about = await aboutRes.json();
  console.log('✅ Judge0 Connected! Version:', about.version || JSON.stringify(about).slice(0,80));

  // Run a quick Python Hello World
  const subRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'x-rapidapi-key': KEY
    },
    body: JSON.stringify({ source_code: 'print("Hello Judge0!")', language_id: 71, stdin: '' })
  });
  const sub = await subRes.json();
  console.log('✅ Python run result:', sub.stdout?.trim(), '| Status:', sub.status?.description);
}

test().catch(e => console.error('❌ Error:', e.message));
