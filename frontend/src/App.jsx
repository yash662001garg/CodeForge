import React, { useState, useEffect } from 'react';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [inputStr, setInputStr] = useState('');
  const [output, setOutput] = useState('');
  const [outputState, setOutputState] = useState('empty'); // empty | running | done | error
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/compiler/history/${userId}`);
      const data = await res.json();
      if (data.last_5_codes) {
        setHistory(data.last_5_codes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLoginView) {
      try {
        const res = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.user_id) {
          setUserId(data.user_id);
          setUsername(data.username || email.split('@')[0]);
        } else {
          alert(data.detail || data.message);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const res = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email.split('@')[0], email, password })
        });
        const data = await res.json();
        if (data.user_id) {
          setUserId(data.user_id);
          setUsername(data.username || email.split('@')[0]);
        } else {
          alert(data.detail || data.message);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const runCode = async () => {
    if (!userId) return;
    setOutput('Running...');
    setOutputState('running');
    try {
      const res = await fetch('http://localhost:8000/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, input: inputStr, user_id: userId })
      });
      const data = await res.json();
      setOutput(data.output || '');
      setOutputState(data.output && data.output.toLowerCase().includes('error') ? 'error' : 'done');
      fetchHistory();
    } catch (e) {
      setOutput(e.toString());
      setOutputState('error');
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setCode('');
    setInputStr('');
    setOutput('');
    setOutputState('empty');
    setHistory([]);
    setShowHistory(false);
  };

  const loadHistoryItem = (item) => {
    setCode(item.code);
    setLanguage(item.language);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      e.target.value = val.substring(0, start) + '    ' + val.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 4;
      setCode(e.target.value);
    }
  };

  // ============ AUTH VIEW ============
  if (!userId) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>⚡ CodeForge</h1>
            <p>{isLoginView ? 'Welcome back! Sign in to continue.' : 'Create your account and start coding!'}</p>
          </div>
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-full">
              {isLoginView ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="auth-switch">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? 'Register here' : 'Sign in here'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============ DASHBOARD VIEW ============
  const getPlaceholder = () => {
    const placeholders = {
      python: '# Write your Python code here...\nprint("Hello, CodeForge!")',
      java: '// Write your Java code here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeForge!");\n    }\n}',
      cpp: '// Write your C++ code here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeForge!" << endl;\n    return 0;\n}',
      javascript: '// Write your JavaScript code here...\nconsole.log("Hello, CodeForge!");'
    };
    return placeholders[language] || '';
  };

  return (
    <div className="dashboard">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">⚡</div>
          <h1>CodeForge</h1>
        </div>
        <div className="navbar-actions">
          <button
            className={`btn btn-sm ${showHistory ? 'btn-ghost' : 'btn-ghost'}`}
            onClick={() => setShowHistory(!showHistory)}
            style={showHistory ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
          >
            📋 {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>
            ⏻ Logout
          </button>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className={`dashboard-content ${!showHistory ? 'history-hidden' : ''}`}>

        {/* ===== EDITOR AREA ===== */}
        <div className="editor-area">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="editor-toolbar-left">
              <span className={`lang-dot ${language}`}></span>
              <select
                className="language-select"
                value={language}
                onChange={e => {
                  setLanguage(e.target.value);
                  setCode('');
                  setOutput('');
                  setOutputState('empty');
                }}
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <button className="btn btn-sm btn-success" onClick={runCode}>
              ▶ Run Code
            </button>
          </div>

          {/* Code Editor + Output */}
          <div className="editor-panels">
            <div className="code-panel">
              <div className="panel-header">
                <span><span className="status-dot"></span> Editor</span>
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  {code.split('\n').length} lines
                </span>
              </div>
              <textarea
                className="code-editor"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                spellCheck={false}
              />
            </div>

            <div className="input-output-row" style={{ gridTemplateColumns: '1fr' }}>
              {/* Output */}
              <div className="output-panel">
                <div className="panel-header">
                  <span>◉ Output</span>
                </div>
                <div className={`output-content ${outputState}`}>
                  {output || 'Run your code to see the output here...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== HISTORY SIDEBAR ===== */}
        {showHistory && (
          <div className="history-sidebar">
            <div className="history-header">
              <h2>📋 Recent Code</h2>
              <button className="history-close" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty">
                  <div className="empty-icon">📂</div>
                  <p>No code history yet.<br />Run some code to get started!</p>
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="history-item" onClick={() => loadHistoryItem(h)}>
                    <div className="history-item-header">
                      <span className={`history-lang-badge ${h.language}`}>
                        <span className={`lang-dot ${h.language}`}></span>
                        {h.language}
                      </span>
                      <span className="history-time">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="history-code-preview">
                      {h.code.length > 150 ? h.code.substring(0, 150) + '...' : h.code}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
