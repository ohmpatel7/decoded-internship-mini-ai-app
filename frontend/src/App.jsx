import { useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
  ...data,
  source: data.note ? "fallback" : "ai"
});

    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
      <h1>Mini AI App – Frontend</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          placeholder="Enter a system description..."
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "300px", padding: "8px", marginRight: "10px" }}
        />
        <button type="submit">Extract Features</button>
      </form>

      <h3>Result:</h3>
{result && (
  <p>
    Source:{" "}
    {result.source === "ai" ? (
      <span style={{ color: "green", fontWeight: "bold" }}>AI Generated</span>
    ) : (
      <span style={{ color: "orange", fontWeight: "bold" }}>Fallback Demo</span>
    )}
  </p>
)}
<pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: 6 }}>
  {result ? JSON.stringify(result, null, 2) : "No result yet"}
</pre>

    </div>
  );
}

export default App;
