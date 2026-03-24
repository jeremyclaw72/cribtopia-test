import React, { useState, useEffect, useRef } from "react";

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";

const QUICK = {
  buyer: [
    { label: "How do I make an offer?", msg: "How do I make an offer on a property?" },
    { label: "What is earnest money?", msg: "What is earnest money and how much do I need?" },
    { label: "How does closing work?", msg: "Walk me through the closing process." },
    { label: "Rent-to-Own explained", msg: "How does Rent-to-Own work on Cribtopia?" },
  ],
  seller: [
    { label: "How do I list my home?", msg: "How do I list my home on Cribtopia?" },
    { label: "Do I need a realtor?", msg: "Do I need a real estate agent to sell?" },
    { label: "What happens after an offer?", msg: "What happens after I receive an offer?" },
    { label: "Premium listing benefits", msg: "What are the benefits of a Premium listing?" },
  ],
  general: [
    { label: "Why no agents?", msg: "Why doesn't Cribtopia use real estate agents?" },
    { label: "How does it work?", msg: "How does Cribtopia work start to finish?" },
    { label: "Is this legal?", msg: "Is it legal to sell my home without an agent?" },
    { label: "Contact support", msg: "I need to speak with a human representative." },
  ],
};

const SYSTEM_PROMPT = `You are Crib, the brilliant AI assistant for Cribtopia — the real estate platform that eliminates agents entirely.
Cribtopia handles FSBO (For Sale By Owner), Rent-to-Own, Rentals, and Vacation Rentals.
You guide buyers, renters, and sellers through every step: searching, making offers, contracts, closing, earnest money, and more.
You are warm, confident, and incredibly helpful. You know real estate law basics for all 50 states.
You always remind users that Cribtopia saves them thousands in agent commissions.
Keep answers clear, friendly, and practical. Use bullet points when helpful.`;

export default function CribtopiaChatWidget({ pageContext = "general" }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(pageContext);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm Crib 👋 — your AI real estate guide. No agents, no commissions, just answers. What can I help you with?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const history = [...messages, { role: "user", content: msg }];
    setMessages(history);
    setLoading(true);
    try {
      // Use base44 AI directly — no external function needed
      const res = await fetch("https://api.base44.com/api/apps/69bc64f21f980db65ab68b70/ai/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT + `\nUser context: ${mode} mode.` },
            ...history.slice(-10)
          ],
          model: "gpt-4o-mini",
          max_tokens: 600,
        }),
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || data?.content || "I'm having trouble connecting. Email rich.cribtopia@gmail.com for help.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Email rich.cribtopia@gmail.com or call 409-454-9038." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes crib-pulse { 0%,100%{box-shadow:0 4px 24px rgba(16,185,129,0.5)} 50%{box-shadow:0 4px 36px rgba(16,185,129,0.9)} }
        @keyframes crib-dot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .crib-btn:hover { transform: scale(1.08) !important; }
        .crib-qa:hover { background: rgba(56,189,248,0.18) !important; }
      `}</style>

      {/* FLOATING BUTTON — always visible, bottom right */}
      <div
        className="crib-btn"
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 2147483647,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0ea5e9, #10b981)",
          animation: !open ? "crib-pulse 2.5s infinite" : "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          transform: open ? "scale(0.9)" : "scale(1)",
          boxShadow: "0 8px 32px rgba(16,185,129,0.6)",
        }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <img src={LOGO} alt="Crib AI" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            {unread > 0 && (
              <div style={{
                position: "absolute", top: -3, right: -3,
                background: "#ef4444", color: "#fff", borderRadius: "50%",
                width: 22, height: 22, fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid white",
              }}>{unread}</div>
            )}
          </>
        )}
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 104,
          right: 28,
          zIndex: 2147483646,
          width: 370,
          maxWidth: "calc(100vw - 40px)",
          height: 540,
          maxHeight: "calc(100vh - 130px)",
          background: "#0b1826",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(16,185,129,0.3)",
          fontFamily: "'Inter', system-ui, sans-serif",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0a1f35, #0d2844)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(16,185,129,0.2)",
            flexShrink: 0,
          }}>
            <div style={{ position: "relative" }}>
              <img src={LOGO} alt="Crib" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#10b981", border: "2px solid #0b1826" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Crib AI</div>
              <div style={{ color: "#10b981", fontSize: 11 }}>● Online — No agents. No commissions.</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 6, padding: "10px 14px 0", flexShrink: 0 }}>
            {["buyer", "seller", "general"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "4px 12px", borderRadius: 20, border: "none",
                fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize",
                background: mode === m ? "linear-gradient(135deg,#0ea5e9,#10b981)" : "rgba(255,255,255,0.07)",
                color: mode === m ? "#fff" : "rgba(255,255,255,0.45)",
                fontFamily: "inherit",
              }}>{m === "general" ? "❓ General" : m === "buyer" ? "🏠 Buyer" : "📋 Seller"}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 7, alignItems: "flex-end" }}>
                {msg.role === "assistant" && (
                  <img src={LOGO} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 13px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
                    : "rgba(255,255,255,0.08)",
                  color: "#e8f0fe",
                  fontSize: 13,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>{msg.content}</div>
              </div>
            ))}

            {/* Quick action chips */}
            {messages.length <= 2 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {(QUICK[mode] || QUICK.general).map((qa, i) => (
                  <button key={i} className="crib-qa" onClick={() => send(qa.msg)} style={{
                    padding: "6px 12px", borderRadius: 20, fontFamily: "inherit",
                    border: "1px solid rgba(16,185,129,0.35)",
                    background: "rgba(16,185,129,0.08)",
                    color: "#10b981", fontSize: 12, cursor: "pointer",
                  }}>{qa.label}</button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                <img src={LOGO} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.08)", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "crib-dot 1s infinite", animationDelay: `${i * 0.18}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "#0a1624",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask Crib anything about buying, renting, or selling..."
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "9px 12px",
                color: "#fff",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                lineHeight: 1.4,
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, border: "none",
                background: input.trim() ? "linear-gradient(135deg, #0ea5e9, #10b981)" : "rgba(255,255,255,0.07)",
                cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#4a5568"} strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          <div style={{ textAlign: "center", padding: "5px 0 8px", fontSize: 10, color: "rgba(255,255,255,0.2)", background: "#0a1624" }}>
            Powered by Cribtopia AI · <a href="mailto:rich.cribtopia@gmail.com" style={{ color: "#38bdf8", textDecoration: "none" }}>Get Help</a>
          </div>
        </div>
      )}
    </>
  );
}
