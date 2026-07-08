import { useState, useRef, useEffect } from 'react';

/* ── Language starter templates ─────────────────────────────── */
const STARTERS = {
  javascript: `// Write your solution here\nfunction solution(input) {\n  // Your code\n  return input;\n}\n\n// Read from stdin\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(solution(lines[0]));`,
  python:     `# Write your solution here\nimport sys\n\ndef solution(data):\n    # Your code\n    return data\n\nlines = sys.stdin.read().strip().split('\\n')\nprint(solution(lines[0]))`,
  java:       `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code\n        System.out.println(sc.nextLine());\n    }\n}`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code\n    string s;\n    getline(cin, s);\n    cout << s << endl;\n    return 0;\n}`,
  c:          `#include <stdio.h>\n\nint main() {\n    char line[1000];\n    fgets(line, sizeof(line), stdin);\n    printf("%s", line);\n    return 0;\n}`,
  typescript: `// Write your solution here\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(lines[0]);`,
  go:         `package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    line, _ := reader.ReadString('\\n')\n    fmt.Print(line)\n}`,
  rust:       `use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let line = stdin.lock().lines().next().unwrap().unwrap();\n    println!("{}", line);\n}`,
  php:        `<?php\n$line = trim(fgets(STDIN));\necho $line . "\\n";`,
  csharp:     `using System;\n\nclass Solution {\n    static void Main() {\n        string line = Console.ReadLine();\n        Console.WriteLine(line);\n    }\n}`,
};

const LANG_LABELS = {
  javascript:'JavaScript', python:'Python', java:'Java', cpp:'C++',
  c:'C', typescript:'TypeScript', go:'Go', rust:'Rust', php:'PHP', csharp:'C#'
};

const STATUS_COLOR = {
  3: '#10b981', // Accepted
  4: '#ef4444', // Wrong Answer
  5: '#f59e0b', // TLE
  6: '#ef4444', // Compile Error
  11:'#ef4444', // Runtime Error
};

export default function CodeEditor({
  question,       // { _id, text, testCases, codingLanguages, codeSnippet, marks, timeLimit }
  attemptId,
  onSave,         // called with { isCorrect, marks, testsPassed, testsTotal } after submit
  disabled = false
}) {
  const allowed = question.codingLanguages?.length
    ? question.codingLanguages
    : ['javascript','python','java','cpp','c','typescript','go','rust','php','csharp'];

  const [lang, setLang]           = useState(allowed[0] || 'python');
  const [code, setCode]           = useState(question.codeSnippet || STARTERS[allowed[0] || 'python'] || '');
  const [stdin, setStdin]         = useState(question.testCases?.[0]?.input || '');
  const [running, setRunning]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activePanel, setActivePanel] = useState('testcases'); // testcases | output | result
  const textareaRef = useRef(null);

  // Tab key support in editor
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        const newVal = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newVal);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
      }
    };
    ta.addEventListener('keydown', onKeyDown);
    return () => ta.removeEventListener('keydown', onKeyDown);
  }, [code]);

  const handleLangChange = (l) => {
    setLang(l);
    setCode(question.codeSnippet || STARTERS[l] || '');
    setRunResult(null);
    setSubmitResult(null);
  };

  const runCode = async () => {
    setRunning(true); setRunResult(null); setActivePanel('output');
    try {
      const r = await fetch('/api/assessment/run-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language: lang, stdin })
      });
      setRunResult(await r.json());
    } catch (e) { setRunResult({ stderr: e.message }); }
    finally { setRunning(false); }
  };

  const submitCode = async () => {
    setSubmitting(true); setSubmitResult(null); setActivePanel('result');
    try {
      const r = await fetch('/api/assessment/submit-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, questionId: question._id, source_code: code, language: lang })
      });
      const d = await r.json();
      setSubmitResult(d);
      if (onSave && !d.error) onSave(d);
    } catch (e) { setSubmitResult({ error: e.message }); }
    finally { setSubmitting(false); }
  };

  const lineCount = code.split('\n').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, border:'1.5px solid #1e293b', borderRadius:'14px', overflow:'hidden', background:'#0f172a', fontFamily:'inherit' }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 1rem', background:'#1e293b', borderBottom:'1px solid #334155', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
          {allowed.map(l => (
            <button key={l} onClick={() => handleLangChange(l)} disabled={disabled}
              style={{ padding:'0.3rem 0.75rem', borderRadius:'6px', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'0.78rem', transition:'all 0.15s',
                background: lang === l ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                color: lang === l ? 'white' : 'rgba(255,255,255,0.6)' }}>
              {LANG_LABELS[l] || l}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button onClick={runCode} disabled={running || disabled}
            style={{ padding:'0.4rem 1rem', borderRadius:'7px', border:'none', cursor: running||disabled ? 'not-allowed':'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'0.82rem', background:'rgba(16,185,129,0.2)', color:'#34d399', transition:'all 0.2s', opacity: running||disabled ? 0.6 : 1 }}>
            {running ? '⏳ Running…' : '▶ Run'}
          </button>
          <button onClick={submitCode} disabled={submitting || disabled}
            style={{ padding:'0.4rem 1.1rem', borderRadius:'7px', border:'none', cursor: submitting||disabled ? 'not-allowed':'pointer', fontFamily:'inherit', fontWeight:800, fontSize:'0.82rem', background: disabled ? '#334155' : 'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white', transition:'all 0.2s', opacity: submitting||disabled ? 0.6 : 1 }}>
            {submitting ? '⏳ Submitting…' : '✅ Submit'}
          </button>
        </div>
      </div>

      {/* ── Code editor + info split ── */}
      <div style={{ display:'flex', minHeight:'320px' }}>

        {/* Line numbers + textarea */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          <div style={{ background:'#0d1117', color:'#4b5563', fontSize:'0.82rem', fontFamily:"'Courier New',monospace", padding:'1rem 0.6rem', textAlign:'right', userSelect:'none', lineHeight:1.65, minWidth:'40px', borderRight:'1px solid #1e293b' }}>
            {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
          </div>
          <textarea ref={textareaRef} value={code} onChange={e => setCode(e.target.value)} disabled={disabled}
            spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
            style={{ flex:1, background:'#0f172a', color:'#e2e8f0', border:'none', outline:'none', padding:'1rem', fontFamily:"'Courier New',Courier,monospace", fontSize:'0.88rem', lineHeight:1.65, resize:'none', tabSize:2, whiteSpace:'pre', overflowX:'auto', caretColor:'#0ea5e9' }} />
        </div>

        {/* Right sidebar — problem info on desktop */}
        <div style={{ width:'220px', background:'#0d1117', borderLeft:'1px solid #1e293b', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem', overflowY:'auto', flexShrink:0 }}>
          <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em' }}>Test Cases</div>
          {(question.testCases || []).map((tc, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid #1e293b', borderRadius:'7px', padding:'0.6rem', fontSize:'0.75rem' }}>
              <div style={{ color:'#94a3b8', fontWeight:700, marginBottom:'0.25rem' }}>Case {i+1} {tc.label ? `· ${tc.label}` : ''}</div>
              <div style={{ color:'#cbd5e1', fontFamily:'monospace', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>Input: {tc.input || '(none)'}</div>
              <div style={{ color:'#86efac', fontFamily:'monospace', marginTop:'0.2rem', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>Exp: {tc.expectedOutput}</div>
            </div>
          ))}
          <div style={{ fontSize:'0.72rem', color:'#4b5563', marginTop:'auto', paddingTop:'0.5rem', borderTop:'1px solid #1e293b' }}>
            ⏱ Limit: {question.timeLimit || 5}s<br/>
            📊 Marks: {question.marks}
          </div>
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div style={{ borderTop:'1px solid #1e293b' }}>
        {/* Panel tabs */}
        <div style={{ display:'flex', background:'#0d1117', borderBottom:'1px solid #1e293b' }}>
          {[['testcases','📋 Stdin'], ['output','▶ Output'], ['result','✅ Result']].map(([id, label]) => (
            <button key={id} onClick={() => setActivePanel(id)}
              style={{ padding:'0.5rem 1rem', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:'0.8rem', background:'none', color: activePanel === id ? '#0ea5e9' : '#64748b', borderBottom: activePanel === id ? '2px solid #0ea5e9' : '2px solid transparent', transition:'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding:'0.85rem 1rem', minHeight:'110px', maxHeight:'220px', overflowY:'auto' }}>

          {/* Stdin */}
          {activePanel === 'testcases' && (
            <div>
              <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:'0.35rem', fontWeight:600 }}>Custom Input (stdin)</div>
              <textarea value={stdin} onChange={e => setStdin(e.target.value)} placeholder="Enter custom input..."
                style={{ width:'100%', background:'#0d1117', color:'#e2e8f0', border:'1px solid #334155', borderRadius:'7px', padding:'0.6rem', fontFamily:'monospace', fontSize:'0.82rem', resize:'vertical', minHeight:'70px', outline:'none', boxSizing:'border-box' }} />
            </div>
          )}

          {/* Run output */}
          {activePanel === 'output' && (
            <div>
              {running && <div style={{ color:'#64748b', fontSize:'0.85rem' }}>⏳ Executing...</div>}
              {runResult && !running && (
                <div>
                  {runResult.compile_output && <div style={{ color:'#ef4444', fontFamily:'monospace', fontSize:'0.82rem', marginBottom:'0.5rem', whiteSpace:'pre-wrap' }}>⚠️ Compile Error:\n{runResult.compile_output}</div>}
                  {runResult.stderr && <div style={{ color:'#f87171', fontFamily:'monospace', fontSize:'0.82rem', marginBottom:'0.5rem', whiteSpace:'pre-wrap' }}>Stderr:\n{runResult.stderr}</div>}
                  {runResult.stdout !== undefined && (
                    <div>
                      <div style={{ fontSize:'0.72rem', color:'#64748b', marginBottom:'0.25rem' }}>Output ({runResult.time || '—'}s · {runResult.status})</div>
                      <pre style={{ color: '#86efac', fontFamily:'monospace', fontSize:'0.85rem', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{runResult.stdout || '(no output)'}</pre>
                    </div>
                  )}
                  {runResult.error && <div style={{ color:'#ef4444', fontSize:'0.85rem' }}>Error: {runResult.error}</div>}
                </div>
              )}
              {!running && !runResult && <div style={{ color:'#4b5563', fontSize:'0.82rem' }}>Click ▶ Run to execute your code.</div>}
            </div>
          )}

          {/* Submit result */}
          {activePanel === 'result' && (
            <div>
              {submitting && <div style={{ color:'#64748b', fontSize:'0.85rem' }}>⏳ Running test cases...</div>}
              {submitResult && !submitting && (
                submitResult.error
                  ? <div style={{ color:'#ef4444', fontSize:'0.85rem' }}>Error: {submitResult.error}</div>
                  : (
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:800, fontSize:'1rem', color: submitResult.isCorrect ? '#10b981' : '#ef4444' }}>
                          {submitResult.isCorrect ? '✅ All Passed!' : `❌ ${submitResult.testsPassed}/${submitResult.testsTotal} Passed`}
                        </span>
                        <span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{submitResult.earnedMarks}/{submitResult.maxMarks} marks</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                        {(submitResult.testResults || []).map((t, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.5rem 0.75rem', background: t.passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius:'7px', border:`1px solid ${t.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                            <span style={{ fontWeight:800, fontSize:'0.82rem', color: t.passed ? '#10b981' : '#ef4444', flexShrink:0 }}>{t.passed ? '✓' : '✗'}</span>
                            <div style={{ flex:1, fontSize:'0.78rem', fontFamily:'monospace' }}>
                              <div style={{ color:'#94a3b8' }}>Case {i+1}{t.isHidden ? ' (hidden)' : ''}</div>
                              {!t.isHidden && <div style={{ color:'#cbd5e1' }}>Input: {t.input || '—'}</div>}
                              {!t.isHidden && <div style={{ color:'#86efac' }}>Expected: {t.expectedOutput}</div>}
                              {!t.isHidden && !t.passed && <div style={{ color:'#f87171' }}>Got: {t.actualOutput || '(empty)'}</div>}
                              {(t.compileError || t.stderr) && <div style={{ color:'#fb923c', whiteSpace:'pre-wrap' }}>{t.compileError || t.stderr}</div>}
                            </div>
                            <span style={{ fontSize:'0.72rem', color:'#64748b', flexShrink:0 }}>{t.time || ''}s</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
              {!submitting && !submitResult && <div style={{ color:'#4b5563', fontSize:'0.82rem' }}>Click ✅ Submit to run against all test cases.</div>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
