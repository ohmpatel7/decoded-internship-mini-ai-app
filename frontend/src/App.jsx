import { useMemo, useState } from "react";
import "./App.css";

// helper: copy to clipboard
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="secondary"
      onClick={() => {
        navigator.clipboard.writeText(text || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? "Copied!" : "Copy JSON"}
    </button>
  );
}

export default function App() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("pretty");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Failed to fetch from backend" });
    } finally {
      setLoading(false);
    }
  };

  const parsed = useMemo(() => {
    if (!result) return null;
    return {
      appName: result.appName || "",
      entities: Array.isArray(result.entities) ? result.entities : [],
      roles: Array.isArray(result.roles) ? result.roles : [],
      features: Array.isArray(result.features) ? result.features : [],
      source: result.source || (result.note ? "fallback" : "ai"),
    };
  }, [result]);

  return (
    <div className="wrapper">
      <header className="header">
        <div className="title">Mini AI App – Frontend</div>
        <div className="subtle">
          Describe an app in plain English ↦ the AI returns{" "}
          <b>Entities</b>, <b>Roles</b>, and <b>Features</b>.
        </div>
      </header>

      <div className="grid">
        <section className="card">
          <form onSubmit={handleSubmit} className="formRow">
            <input
              className="input"
              type="text"
              placeholder="I want an app where students submit homework and teachers grade it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button className="btn" disabled={loading} type="submit">
              {loading ? "Extracting..." : "Extract Features"}
            </button>
          </form>

          <div className="tagRow">
            <span className="tag">OpenAI GPT-4o-mini</span>
            <span className="tag">Strict JSON</span>
            <span className="tag">Node + Express API</span>
            <span className="tag">Vite + React</span>
          </div>

          <h3 className="sectionTitle">Result:</h3>

          {parsed?.source && (
            <p>
              Source:{" "}
              {parsed.source === "ai" ? (
                <span className="source">AI Generated</span>
              ) : (
                <span className="warning">Fallback Demo</span>
              )}
            </p>
          )}

          {result && (
            <div className="controls">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setView(view === "pretty" ? "json" : "pretty")
                }
              >
                View: {view === "pretty" ? "Pretty" : "JSON"}
              </button>
              <CopyButton text={JSON.stringify(result, null, 2)} />
            </div>
          )}

          {view === "json" ? (
            <div className="jsonWrap">
              <pre>
                {result ? JSON.stringify(result, null, 2) : "No result yet"}
              </pre>
            </div>
          ) : (
            <div className="jsonWrap">
              {!result && <pre>No result yet</pre>}
              {parsed && (
                <>
                  {parsed.appName && (
                    <>
                      <div className="small">App Name</div>
                      <div style={{ fontSize: 18, marginBottom: 12 }}>
                        <strong>{parsed.appName}</strong>
                      </div>
                    </>
                  )}

                  <div className="small">Entities</div>
                  <div className="pillGroup">
                    {parsed.entities.length ? (
                      parsed.entities.map((e, i) => (
                        <div key={`ent-${i}`} className="pill">{e}</div>
                      ))
                    ) : (
                      <span className="subtle">– None –</span>
                    )}
                  </div>

                  <div className="small">Roles</div>
                  <div className="pillGroup">
                    {parsed.roles.length ? (
                      parsed.roles.map((r, i) => (
                        <div key={`role-${i}`} className="pill">{r}</div>
                      ))
                    ) : (
                      <span className="subtle">– None –</span>
                    )}
                  </div>

                  <div className="small">Features</div>
                  <div className="pillGroup">
                    {parsed.features.length ? (
                      parsed.features.map((f, i) => (
                        <div key={`feat-${i}`} className="pill">{f}</div>
                      ))
                    ) : (
                      <span className="subtle">– None –</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <aside className="card info">
          <h3>How It Works</h3>
          <p>
            The React frontend sends your description to a Node/Express backend,
            which calls OpenAI <code>gpt-4o-mini</code> with a <b>strict JSON</b> response format.
            If the API is down, we return a <b>fallback</b> so the UI keeps working.
          </p>
          <div className="sep"></div>
          <h3>Why It’s Useful</h3>
          <p className="small">
            • Turn ideas into a structured spec in seconds. <br />
            • Easy to plug into tools like Jira/Trello. <br />
            • Reliable demo via fallback mode.
          </p>
          <div className="sep"></div>
          <h3>What’s Next</h3>
          <p className="small">
            Export results, save history, add user accounts & collaboration.
          </p>
        </aside>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} Mini AI App • React, Node & OpenAI
      </footer>
    </div>
  );
}