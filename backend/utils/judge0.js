/**
 * judge0.js — Judge0 CE via RapidAPI
 *
 * API Key: set JUDGE0_API_KEY in .env
 * Host:    judge0-ce.p.rapidapi.com
 *
 * For self-hosted Judge0 (docker):
 *   Set JUDGE0_URL=http://localhost:2358 and leave JUDGE0_API_KEY blank.
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const JUDGE0_URL = (process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/$/, '');
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || '';
const IS_RAPIDAPI = JUDGE0_URL.includes('rapidapi.com');

function buildHeaders(extra = {}) {
  const base = { 'Content-Type': 'application/json', ...extra };
  if (IS_RAPIDAPI && JUDGE0_KEY) {
    base['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    base['X-RapidAPI-Key']  = JUDGE0_KEY;
  }
  return base;
}

/**
 * Submit source code to Judge0 and poll until finished.
 * Returns the full Judge0 submission result object.
 */
async function runCode({ source_code, language_id, stdin = '', cpu_time_limit = 5, memory_limit = 131072 }) {
  if (!source_code) throw new Error('source_code is required.');
  if (!language_id) throw new Error('language_id is required.');

  // ── Step 1: Create submission ──────────────────────────────────────
  const createUrl = `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`;
  const createRes = await fetch(createUrl, {
    method:  'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      source_code,
      language_id,
      stdin:          stdin || '',
      cpu_time_limit: Number(cpu_time_limit),
      memory_limit:   Number(memory_limit)
    })
  });

  if (!createRes.ok) {
    const txt = await createRes.text().catch(() => '');
    throw new Error(`Judge0 create submission failed (HTTP ${createRes.status}): ${txt}`);
  }

  const { token } = await createRes.json();
  if (!token) throw new Error('Judge0 did not return a submission token.');

  // ── Step 2: Poll until status_id > 2 ──────────────────────────────
  // status_id: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error/Done
  const pollUrl = `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=token,status,status_id,stdout,stderr,compile_output,time,memory`;

  let result = { status_id: 1 };
  for (let i = 0; i < 25; i++) {
    await sleep(700);
    const pollRes = await fetch(pollUrl, { headers: buildHeaders() });
    if (!pollRes.ok) continue;
    result = await pollRes.json();
    if (result.status_id > 2) break;
  }

  return result;
}

/**
 * Run source code against an array of test cases.
 * Returns array of per-test-case results.
 */
async function runTestCases({ source_code, language_id, testCases = [], timeLimit = 5, memoryLimit = 128 }) {
  const memory_limit = memoryLimit * 1024; // MB → KB
  const results = [];

  for (const tc of testCases) {
    let actualOutput  = '';
    let stderr        = '';
    let compileError  = '';
    let time          = '';
    let passed        = false;
    let status_id     = 0;

    try {
      const res = await runCode({
        source_code,
        language_id,
        stdin:          tc.input || '',
        cpu_time_limit: timeLimit,
        memory_limit
      });

      actualOutput = (res.stdout   || '').trim();
      stderr       = (res.stderr   || '').trim();
      compileError = (res.compile_output || '').trim();
      time         = res.time || '';
      status_id    = res.status_id;

      const expected = (tc.expectedOutput || '').trim();
      // status_id 3 = Accepted AND output matches
      passed = (res.status_id === 3) && (actualOutput === expected);

    } catch (err) {
      stderr = err.message;
    }

    results.push({
      input:          tc.input || '',
      expectedOutput: (tc.expectedOutput || '').trim(),
      actualOutput,
      passed,
      isHidden:       !!tc.isHidden,
      stderr,
      compileError,
      time,
      status_id
    });
  }

  return results;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = { runCode, runTestCases, JUDGE0_URL, IS_RAPIDAPI };
