import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState(0); // Step 0 = Setup
  const [username, setUsername] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [log, setLog] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already setup
    const savedName = localStorage.getItem("employeeName");
    const savedCode = localStorage.getItem("companyCode");
    
    if (savedName && savedCode) {
      setUsername(savedName);
      setCompanyCode(savedCode);
      setStep(1); // Skip setup
    }
  }, []);

  const handleSetup = () => {
    if (!username || !companyCode) return alert("Please fill all fields");
    localStorage.setItem("employeeName", username);
    localStorage.setItem("companyCode", companyCode);
    setStep(1);
  };

  const handleNext = () => setStep(step + 1);

  const handleSubmit = async () => {
    if (!nextFocus) return alert("Enter focus");
    setIsLoading(true); setStatus("Syncing...");

    try {
      const response = await fetch('http://localhost:3000/log-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // SEND COMPANY CODE WITH LOG
        body: JSON.stringify({ 
          companyCode: companyCode, 
          user: username, 
          accomplishment: log, 
          nextFocus: nextFocus, 
          timestamp: new Date().toISOString() 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(""); 
        setTimeout(() => { setLog(""); setNextFocus(""); setStep(1); setIsLoading(false); }, 2000); 
      } else {
        setStatus("Error: Check Code"); setIsLoading(false);
      }
    } catch (error) { setStatus("Connection Failed"); setIsLoading(false); }
  };

  return (
    <div className="container" style={{textAlign: 'center', padding: '20px', fontFamily: 'Inter, sans-serif'}}>
      
      {/* HEADER */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px'}}>
        <img src="icon.png" width="24" /> 
        <h3 style={{margin:0}}>Log It.</h3>
      </div>

      {/* STEP 0: ONBOARDING */}
      {step === 0 && (
        <div>
           <p style={labelStyle}>Setup Your Profile</p>
           <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" style={inputStyle}/>
           <input type="text" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} placeholder="Company Code (Ask Manager)" style={inputStyle}/>
           <button onClick={handleSetup} style={btnStyle}>Save Profile</button>
        </div>
      )}

      {/* STEP 1: LOG */}
      {step === 1 && !isLoading && (
        <div>
          <p style={labelStyle}>Hi {username}, what did you do?</p>
          <textarea rows="3" value={log} onChange={(e) => setLog(e.target.value)} placeholder="I finished..." style={inputStyle}/>
          <button onClick={handleNext} style={btnStyle}>Next</button>
          <p style={{fontSize:'10px', color:'#999', marginTop:'10px'}}>Code: {companyCode}</p>
        </div>
      )}

      {/* STEP 2: FOCUS */}
      {step === 2 && !isLoading && (
        <div>
          <p style={labelStyle}>Focus for next 15 mins?</p>
          <textarea rows="3" value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} placeholder="Start working on..." style={inputStyle}/>
          <div style={{display:'flex', gap:'5px'}}>
             <button onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
             <button onClick={handleSubmit} style={submitBtnStyle}>Log It</button>
          </div>
        </div>
      )}

      {isLoading && <p style={{color:'#666'}}>{status}</p>}
    </div>
  );
}

const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '10px', display: 'block' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const submitBtnStyle = { ...btnStyle, background: '#000' }; 
const backBtnStyle = { ...btnStyle, background: '#999', width: '30%' };

export default App;
