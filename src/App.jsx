import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [companyCode, setCompanyCode] = useState(null);
  const [log, setLog] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- STYLES (Fixes the "labelStyle is not defined" error) ---
  const labelStyle = { fontSize: '14px', marginBottom: '5px', color: '#333', fontWeight: 'bold' };
  const backBtnStyle = { flex: 1, padding: '8px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
  const submitBtnStyle = { flex: 2, padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  // Check if user is already logged in
  useEffect(() => {
    const savedCode = localStorage.getItem('companyCode');
    if (savedCode) {
      setCompanyCode(savedCode);
      setStep(2);
    }
  }, []);

  const handleLogin = () => {
    if (!companyCode) return alert("Enter a code!");
    localStorage.setItem('companyCode', companyCode);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!nextFocus) return alert("Enter focus for next session");
    setIsLoading(true);
    setStatus("Syncing...");

    try {
      const response = await fetch('https://logit-gctm.onrender.com/log-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyCode: companyCode,
          user: "Employee", // You can add a username input later if you want
          accomplishment: log,
          nextFocus: nextFocus,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setStatus("Saved!");
        setTimeout(() => {
            setIsLoading(false);
            setStatus("");
            setLog(""); 
            // Optional: Close window here
        }, 1000);
      } else {
        setStatus("Error saving.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setStatus("Network Error");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('companyCode');
    setCompanyCode(null);
    setStep(1);
    setStatus("");
  };

  return (
    <div style={{ width: '300px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* STEP 1: LOGIN */}
      {step === 1 && (
        <div>
          <h2>LogIt.</h2>
          <p style={{fontSize: '12px', color: '#666'}}>Enter Company Code</p>
          <input 
            type="text" 
            placeholder="e.g. 5396"
            onChange={(e) => setCompanyCode(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Enter
          </button>
        </div>
      )}

      {/* STEP 2: LOGGING */}
      {step === 2 && !isLoading && (
        <div>
          <p style={labelStyle}>What did you accomplish?</p>
          <textarea 
            rows="3" 
            value={log} 
            onChange={(e) => setLog(e.target.value)} 
            placeholder="Fixed the bug..." 
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />

          <p style={labelStyle}>Focus for next 15 mins?</p>
          <textarea 
            rows="2" 
            value={nextFocus} 
            onChange={(e) => setNextFocus(e.target.value)} 
            placeholder="Start working on..." 
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />

          <div style={{ display: 'flex' }}>
             <button onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
             <button onClick={handleSubmit} style={submitBtnStyle}>Log Work</button>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', width: '100%' }}
          >
            (Change Company)
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h3>Log It.</h3>
            <p>{status}</p>
        </div>
      )}

    </div>
  );
}

export default App;