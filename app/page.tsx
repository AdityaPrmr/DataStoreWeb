"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(path: string) {
    try {
      setLoading(true); 
      const res = await fetch(`https://datastore-1mtx.onrender.com/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": code,
        },
        body: JSON.stringify({
          data: data,
          code: code,
        }),
      });

      if (!res.ok) throw new Error("API Error");

      if(path == "decp")
      {
        const json = await res.json();
        setResult(json.decp);
      }
      else
      {
        const json = await res.json();
        setResult(json.data);
      }
    } catch (error: any) {
      setResult("Error: " + error.message);
    }
    finally {
    setLoading(false);   // ⬅️ stop loading
  }
  }

async function refreshData() {
  setLoading(true);

  const TIMEOUT = 15000; // ⬅️ 15 seconds API wait before timeout
  const RETRY_DELAY = 2000; // ⬅️ 2 seconds between retries

  while (true) {
    try {
      console.log("Trying to refresh...");

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      const res = await fetch("https://datastore-1mtx.onrender.com", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.status == 404) {
        alert("Refreshed Successfully!");
        break; // <-- SUCCESS → exit loop
      }

      throw new Error("Server Error");
    } 
    catch (err: any) {
      console.log("Retrying in 2 seconds...", err.message);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  setLoading(false);
}




const allowedChars = [
  'g','5','b','3','o','K','Z','t','"','J',
  'A','s','V','u','}','\\','d','U','1','H',
  '(','%','7','n','X','l','m','c','q','f',
  '-','S','!','i','{','C','x','y',']',' ','',
  '6','j','[','k','M','2','&','<','.', 'B',
  'e',':','^','P','`','p','>','D','L','_',
  '~',',','h','a','T','*','0','/','F','w',
  '4','\'','I','z',';','$','@','|','G','N',
  'O','Y','r','Q','W','R','=','E','8','9','+','#','?','v',')','\n'
];


  // 📂 Read file and load into textarea
  function handleFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      // validate each character
      for (let char of text) {
        if (!allowedChars.includes(char)) {   // ✅ correct Set check
          alert("--"+char+"--");
          return;
        }
      }

      // if valid, put text in textarea
      setData(text);
    };

    reader.readAsText(file);
  }




  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  }

  // 📝 Download Result as .txt
  function downloadResult() {
    if (!result) return;

    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "result.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (<>

    {loading && (
      <div style={{
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        <div 
          style={{
            width: "18px",
            height: "18px",
            border: "3px solid #ccc",
            borderTop: "3px solid #0070f3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}
        />
        Loading...
      </div>
    )}

    <button
  onClick={refreshData}
  style={{
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    marginBottom: "20px",
    fontWeight: "bold",
  }}
>
  🔄 Refresh
</button>

    <div
      style={{
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>🔐 Encrypt / Decrypt Tool</h1>

      {/* Data Input + File Upload */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Data to Encrypt / Decrypt
        </label>

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter data..."
          style={{
            padding: "12px",
            flex: 1,
            minHeight: "150px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            whiteSpace: "pre-wrap",
          }}
        />

        <input
          type="file"
          accept="*/*"
          onChange={handleFileSelect}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "120px",
            height: "40px", // optional if you want fixed height
          }}
        />
      </div>
      </div>

      {/* Code / Authorization */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Authorization / Code
        </label>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code..."
          style={{
            padding: "12px",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => callApi("enc")}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: "#0070f3",
            color: "white",
          }}
        >
          Encrypt
        </button>

        <button
          onClick={() => callApi("decp")}
          style={{
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: "#555",
            color: "white",
          }}
        >
          Decrypt
        </button>
      </div>

      {/* Result */}
      <pre
        style={{
          marginTop: "30px",
          background: "#f7f7f7",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          whiteSpace: "pre-wrap",
          maxWidth: "100%",       // ⬅️ added
          color: "#333",          // ⬅️ added text color
          overflowX: "auto", 
        }}
      >
        {result}
      </pre>
    {/* Copy + Download Buttons */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={copyResult}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: "#0070f3",
            color: "white",
          }}
        >
          Copy Result
        </button>

        <button
          onClick={downloadResult}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: "#28a745",
            color: "white",
          }}
        >
          Download .txt
        </button>
      </div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </>);
}