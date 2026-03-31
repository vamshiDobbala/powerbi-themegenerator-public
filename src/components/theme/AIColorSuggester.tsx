import { useState } from "react";

type Provider = "anthropic" | "openai" | "gemini";

const PROVIDERS: { id: Provider; label: string; short: string; placeholder: string; hint: string }[] = [
  { id: "anthropic", label: "Claude",  short: "Claude",  placeholder: "sk-ant-...", hint: "console.anthropic.com" },
  { id: "openai",    label: "ChatGPT", short: "ChatGPT", placeholder: "sk-...",     hint: "platform.openai.com/api-keys" },
  { id: "gemini",    label: "Gemini",  short: "Gemini",  placeholder: "AIza...",    hint: "aistudio.google.com/app/apikey" },
];

const SYSTEM_PROMPT = `You are a Power BI theme color expert. Suggest ONE dominant brand hex color for the described dashboard.
Respond ONLY in this JSON format: {"hex":"#RRGGBB","reason":"one sentence"}
Rules: mid-tone colors (L 35-65%). Healthcare=teal/blue. Finance=navy/dark blue. Marketing=orange/red/purple. Never near-black or near-white.`;

async function callAnthropic(key: string, prompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "x-api-key": key, 
      "anthropic-version": "2023-06-01", 
      "anthropic-dangerous-direct-browser-access": "true" 
    },
    body: JSON.stringify({ 
      model: "claude-3-5-haiku-20241022", 
      max_tokens: 150, 
      system: SYSTEM_PROMPT, 
      messages: [{ role: "user", content: prompt }] 
    }),
  });
  
  const data = await res.json();
  if (!res.ok) { 
    throw new Error(data.error?.message || `Error ${res.status}`); 
  }
  return data.content?.[0]?.text || "";
}

async function callOpenAI(key: string, prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ 
      model: "gpt-4o-mini", 
      max_tokens: 150, 
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }] 
    }),
  });
  
  const data = await res.json();
  if (!res.ok) { 
    throw new Error(data.error?.message || `Error ${res.status}`); 
  }
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(key: string, prompt: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }], 
      generationConfig: { maxOutputTokens: 150 } 
    }),
  });
  
  const data = await res.json();
  if (!res.ok) { 
    throw new Error(data.error?.message || `Error ${res.status}`); 
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

const EXAMPLES = ["Healthcare", "Finance", "Marketing", "Executive"];
const EXAMPLE_FULL: Record<string, string> = {
  Healthcare: "Healthcare dashboard, clean and trustworthy",
  Finance: "Finance report, corporate and conservative",
  Marketing: "Marketing analytics, bold and energetic",
  Executive: "Executive reporting, dark and professional",
};

interface Props { onColorSuggested: (hex: string) => void; accent0: string; }

export const AIColorSuggester = ({ onColorSuggested, accent0 }: Props) => {
  const getKey = (p: string) => localStorage.getItem(`ai_key_${p}`) || "";
  const getSavedProvider = () => (localStorage.getItem("ai_provider") as Provider) || "anthropic";

  const [provider, setProvider] = useState<Provider>(getSavedProvider);
  const [apiKey, setApiKey]     = useState(() => getKey(getSavedProvider()));
  const [showKey, setShowKey]   = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [prompt, setPrompt]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<{ hex: string; reason: string } | null>(null);

  const hasKey = !!getKey(provider);

  const switchProvider = (p: Provider) => {
    setProvider(p);
    setApiKey(getKey(p));
    setError(""); setResult(null);
    localStorage.setItem("ai_provider", p);
  };

  const saveKey = (val: string) => {
    setApiKey(val);
    if (val.trim()) localStorage.setItem(`ai_key_${provider}`, val.trim());
    else localStorage.removeItem(`ai_key_${provider}`);
  };

  const suggest = async () => {
    const key = getKey(provider);
    if (!key) { setError("Add your API key first — click ⚙"); return; }
    if (!prompt.trim()) { setError("Describe your dashboard."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      let raw = "";
      if (provider === "anthropic") raw = await callAnthropic(key, prompt);
      else if (provider === "openai") raw = await callOpenAI(key, prompt);
      else raw = await callGemini(key, prompt);
      
      // Robust JSON extraction: Find the first { and last }
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Unexpected response format. Try again.");
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.hex || !/^#[0-9A-Fa-f]{6}$/.test(parsed.hex)) {
        throw new Error("Invalid color code received. Try again.");
      }
      setResult({ hex: parsed.hex.toUpperCase(), reason: parsed.reason || "AI Suggested Color" });
    } catch (e: any) {
      console.error("AI Suggestion failed:", e);
      setError(e.message?.includes("JSON") ? "Unexpected response. Try again." : (e.message || "Something went wrong."));
    } finally { setLoading(false); }
  };

  const apply = () => { if (result) { onColorSuggested(result.hex); setResult(null); setPrompt(""); } };
  const current = PROVIDERS.find(p => p.id === provider)!;

  return (
    <div className="panel-card">

      {/* ── Compact header row ── */}
      <div className="panel-title" style={{ justifyContent: "space-between", marginBottom: showConfig ? 10 : 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>✨</span>
          <span>AI Color Suggester</span>
          {/* Active provider pill */}
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: `${accent0}18`, color: accent0, fontWeight: 700, border: `1px solid ${accent0}44` }}>
            {current.short}
          </span>
          {hasKey && <span style={{ fontSize: 9, color: "#1AAB40" }}>●</span>}
        </div>
        <button onClick={() => setShowConfig(s => !s)} style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 6px", borderRadius: 6 }}>
          {showConfig ? "Done" : "⚙"}
        </button>
      </div>

      {/* ── Config panel — collapsible, compact ── */}
      {showConfig && (
        <div style={{ marginBottom: 12, padding: "10px 12px", background: "hsl(var(--muted))", borderRadius: 8, border: "0.5px solid hsl(var(--border))" }}>

          {/* Horizontal provider tabs */}
          <div className="section-label">PROVIDER</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => switchProvider(p.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: provider === p.id ? 700 : 500, border: provider === p.id ? `1.5px solid ${accent0}` : "1px solid hsl(var(--border))", background: provider === p.id ? `${accent0}18` : "hsl(var(--card))", color: provider === p.id ? accent0 : "hsl(var(--muted-foreground))", transition: "all 0.15s", position: "relative" }}>
                {p.short}
                {getKey(p.id) && <span style={{ position: "absolute", top: 2, right: 3, width: 5, height: 5, borderRadius: "50%", background: "#1AAB40" }} />}
              </button>
            ))}
          </div>

          {/* API key input */}
          <div className="section-label">API KEY</div>
          <div style={{ display: "flex", gap: 5 }}>
            <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => saveKey(e.target.value)} placeholder={current.placeholder} style={{ flex: 1, background: "hsl(var(--card))", border: "1px solid hsl(var(--input))", borderRadius: 7, padding: "7px 9px", fontSize: 11, fontFamily: "var(--font-mono,monospace)", color: "hsl(var(--card-foreground))", outline: "none" }} />
            <button onClick={() => setShowKey(s => !s)} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--input))", borderRadius: 7, padding: "0 9px", fontSize: 10, cursor: "pointer", color: "hsl(var(--muted-foreground))", fontFamily: "inherit" }}>{showKey ? "Hide" : "Show"}</button>
          </div>
          <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", marginTop: 4 }}>{current.hint}</div>
        </div>
      )}

      {/* ── Prompt input ── */}
      <div style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); suggest(); } }}
          placeholder="Describe your dashboard... (e.g. healthcare, finance)"
          rows={2}
          style={{ flex: 1, background: "hsl(var(--background))", border: "1px solid hsl(var(--input))", borderRadius: 8, padding: "8px 10px", fontSize: 11, fontFamily: "inherit", color: "hsl(var(--card-foreground))", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" }}
        />
        <button onClick={suggest} disabled={loading || !prompt.trim()} title="Suggest color" style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: loading || !prompt.trim() ? "hsl(var(--muted))" : accent0, color: loading || !prompt.trim() ? "hsl(var(--muted-foreground))" : "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: loading ? "wait" : "pointer", transition: "all 0.2s", whiteSpace: "nowrap", alignSelf: "stretch", boxShadow: (!loading && prompt.trim()) ? `0 2px 10px ${accent0}44` : "none" }}>
          {loading ? "..." : "✨"}
        </button>
      </div>

      {/* ── Example chips — compact single row ── */}
      <div style={{ display: "flex", gap: 4, marginTop: 6, marginBottom: result || error ? 8 : 0 }}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => { setPrompt(EXAMPLE_FULL[ex]); setError(""); }} style={{ flex: 1, fontSize: 9, padding: "3px 4px", borderRadius: 6, background: prompt === EXAMPLE_FULL[ex] ? `${accent0}18` : "hsl(var(--muted))", border: prompt === EXAMPLE_FULL[ex] ? `1px solid ${accent0}44` : "0.5px solid hsl(var(--border))", color: prompt === EXAMPLE_FULL[ex] ? accent0 : "hsl(var(--muted-foreground))", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>{ex}</button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: "7px 10px", borderRadius: 7, fontSize: 11, background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", border: "0.5px solid hsl(var(--destructive) / 0.3)" }}>⚠ {error}</div>
      )}

      {/* ── Result — compact ── */}
      {result && (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "hsl(var(--card))", border: `1.5px solid ${result.hex}55`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: result.hex, flexShrink: 0, boxShadow: `0 2px 8px ${result.hex}66` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "var(--font-mono,monospace)", color: "hsl(var(--card-foreground))" }}>{result.hex}</div>
            <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={result.reason}>{result.reason}</div>
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            <button onClick={apply} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: result.hex, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Apply →</button>
            <button onClick={() => { setResult(null); suggest(); }} style={{ padding: "6px 8px", borderRadius: 7, background: "hsl(var(--muted))", border: "0.5px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontFamily: "inherit", fontSize: 10, cursor: "pointer" }}>↺</button>
          </div>
        </div>
      )}

    </div>
  );
};
