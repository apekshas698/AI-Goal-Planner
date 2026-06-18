// src/components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import API from "../services/api";

const SUGGESTED_QUESTIONS = [
  "How should I learn Spring Security?",
  "What is the best way to practice DSA?",
  "How do I crack a product-based company interview?",
  "Explain microservices vs monolith",
];

function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Mentor 👋 Ask me anything about programming, system design, career growth, or your learning goals. I'm here to help!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const historyToSend = updatedMessages.slice(1); // skip assistant greeting
      const res = await API.post("/chat", { messages: historyToSend });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text) => {
    return text.split("\n").map((line, i) => {
      const formatted = line
        .split(/(\*\*[^*]+\*\*)/)
        .map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        );
      return (
        <span key={i}>
          {formatted}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div style={{ marginTop: "30px" }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 24px",
          backgroundColor: "#6f42c1",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(111,66,193,0.3)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(111,66,193,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(111,66,193,0.3)";
        }}
      >
        <span style={{ fontSize: "20px" }}>🧠</span>
        {isOpen ? "Close AI Mentor" : "Open AI Mentor Chat"}
        <span style={{ fontSize: "13px", opacity: 0.85 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            marginTop: "16px",
            border: "1px solid #e0d7f7",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(111,66,193,0.1)",
            background: "#fff",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6f42c1 0%, #8a5cf7 100%)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🧠
            </div>
            <div>
              <div
                style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}
              >
                AI Mentor
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px" }}>
                Your personal learning assistant
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
                Online
              </span>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              height: "400px",
              overflowY: "auto",
              padding: "20px",
              background: "#faf9fe",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px",
                  alignItems: "flex-end",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    🧠
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6f42c1, #8a5cf7)"
                        : "white",
                    color: msg.role === "user" ? "white" : "#333",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 8px rgba(111,66,193,0.3)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                    border:
                      msg.role === "assistant" ? "1px solid #ede9fe" : "none",
                  }}
                >
                  {formatContent(msg.content)}
                </div>
                {msg.role === "user" && (
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  🧠
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "white",
                    border: "1px solid #ede9fe",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#6f42c1",
                        opacity: 0.7,
                        animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: "12px 20px",
                background: "#f5f3ff",
                borderTop: "1px solid #ede9fe",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "100%",
                  fontSize: "11px",
                  color: "#888",
                  marginBottom: "2px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Try asking:
              </span>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "6px 12px",
                    background: "white",
                    border: "1px solid #ddd6fe",
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: "#6f42c1",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#ede9fe")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: "16px 20px",
              background: "white",
              borderTop: "1px solid #ede9fe",
              display: "flex",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your mentor anything... (Enter to send)"
              rows={1}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #ddd6fe",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                lineHeight: "1.5",
                maxHeight: "100px",
                overflowY: "auto",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6f42c1")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd6fe")}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 100) + "px";
              }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                border: "none",
                background:
                  loading || !input.trim()
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                color: loading || !input.trim() ? "#9ca3af" : "white",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default ChatWindow;