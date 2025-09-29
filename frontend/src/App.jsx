import { useState } from "react";

function App() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:5050/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the backend or AI failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial", padding: 20, color: "#eee" }}>
      <h1 style={{ fontSize: 48, marginBottom: 20 }}>Mini AI App – Frontend</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          placeholder="Enter a system description..."
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: 360, padding: "10px 12px", borderRadius: 8, marginRight: 12,
            background: "#222", border: "1px solid #444", color: "#ddd"
          }}
        />
        <button
          type="submit"
          disabled={loading || !description.trim()}
          style={{
            padding: "10px 16px", borderRadius: 8,
            background: loading ? "#444" : "#7c4dff",
            border: "1px solid #9c7bff", color: "#fff", cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Thinking..." : "Extract Features"}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <h3>Result:</h3>
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {result && (
          <>
            <p>
              Source:{" "}
              {result.source === "ai" ? (
                <span style={{ color: "limegreen", fontWeight: "bold" }}>AI Generated</span>
              ) : (
                <span style={{ color: "orange", fontWeight: "bold" }}>Fallback Demo</span>
              )}
            </p>

            <pre style={{
              background: "#1b1b1b", padding: 14, borderRadius: 8,
              border: "1px solid #333", overflowX: "auto"
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </>
        )}

        {!result && !error && (
          <pre style={{
            background: "#1b1b1b", padding: 14, borderRadius: 8,
            border: "1px solid #333", color: "#888"
          }}>
            No result yet
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
