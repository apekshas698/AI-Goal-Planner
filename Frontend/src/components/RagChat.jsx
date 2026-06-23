import { useState, useEffect, useRef } from "react";
import API from "../services/api";

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

function FileTypeBadge({ type }) {
  const colors = {
    PDF:  { bg: "#fef2f2", color: "#b91c1c" },
    DOCX: { bg: "#eff6ff", color: "#1d4ed8" },
    TXT:  { bg: "#f0fdf4", color: "#15803d" },
  };
  const c = colors[type] || colors.TXT;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "2px 8px", borderRadius: "10px",
      fontSize: "11px", fontWeight: "700",
    }}>
      {type}
    </span>
  );
}

function UploadZone({ onUpload, uploading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files[0];
    if (file) onUpload(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      style={{
        border: `2px dashed ${dragging ? "#6f42c1" : "#ddd6fe"}`,
        borderRadius: "12px",
        padding: "28px 20px",
        textAlign: "center",
        cursor: uploading ? "not-allowed" : "pointer",
        background: dragging ? "#f5f3ff" : "white",
        transition: "all 0.2s",
        marginBottom: "16px",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
        {uploading ? "⏳" : "📎"}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>
        {uploading ? "Processing document…" : "Drop a file or click to upload"}
      </div>
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        Supports PDF, DOCX, TXT — up to 20 MB
      </div>
    </div>
  );
}

function DocumentList({ docs, selectedDocId, onSelect, onDelete }) {
  if (docs.length === 0) {
    return (
      <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center", padding: "8px 0" }}>
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        onClick={() => onSelect(null)}
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "13px",
          cursor: "pointer",
          background: selectedDocId === null ? "#ede9fe" : "white",
          border: selectedDocId === null ? "1.5px solid #7c3aed" : "1px solid #e5e7eb",
          color: selectedDocId === null ? "#6f42c1" : "#555",
          fontWeight: selectedDocId === null ? "700" : "400",
          transition: "all 0.15s",
        }}
      >
        🗂 All documents
      </div>
      {docs.map((doc) => (
        <div
          key={doc.id}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            background: selectedDocId === doc.id ? "#ede9fe" : "white",
            border: selectedDocId === doc.id ? "1.5px solid #7c3aed" : "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s",
          }}
          onClick={() => onSelect(doc.id)}
        >
          <FileTypeBadge type={doc.fileType} />
          <span style={{
            flex: 1,
            color: selectedDocId === doc.id ? "#6f42c1" : "#333",
            fontWeight: selectedDocId === doc.id ? "700" : "400",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {doc.fileName}
          </span>
          <span style={{ fontSize: "11px", color: "#aaa", whiteSpace: "nowrap" }}>
            {doc.chunkCount} chunks
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#dc3545", fontSize: "14px", padding: "0 2px",
              lineHeight: 1, flexShrink: 0,
            }}
            title="Delete document"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default function RagChat() {
  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Upload a PDF, DOCX, or TXT file and I'll answer questions based on its contents. Select 'All documents' to search across everything you've uploaded.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchDocs = async () => {
    try {
      const res = await API.get("/rag/documents");
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to load docs:", err);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post("/rag/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocs();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ "${file.name}" uploaded and indexed! You can now ask me questions about it.`,
        },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Upload failed. Please try again." },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await API.delete(`/rag/documents/${docId}`);
      if (selectedDocId === docId) setSelectedDocId(null);
      await fetchDocs();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const sendQuestion = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/rag/ask", {
        question: q,
        docId: selectedDocId,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const scopeLabel = selectedDocId
    ? docs.find((d) => d.id === selectedDocId)?.fileName || "Selected doc"
    : "All documents";

  return (
    <div style={{ marginTop: "12px" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>🧠 Document Q&A (RAG)</h2>
      <p style={{ margin: "0 0 20px", color: "#888", fontSize: "13px" }}>
        Upload documents and ask AI questions based on their content — no hallucinations
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}>

        {/* LEFT: Upload + Document list */}
        <div>
          <UploadZone onUpload={handleUpload} uploading={uploading} />

          <div style={{
            background: "white",
            border: "1px solid #ede9fe",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <div style={{
              fontSize: "12px", fontWeight: "700", color: "#888",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px",
            }}>
              Your Documents
            </div>
            <DocumentList
              docs={docs}
              selectedDocId={selectedDocId}
              onSelect={setSelectedDocId}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* RIGHT: Chat interface */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ede9fe",
          borderRadius: "14px",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 4px 24px rgba(111,66,193,0.08)",
        }}>
          {/* Chat header */}
          <div style={{
            background: "linear-gradient(135deg, #6f42c1 0%, #8a5cf7 100%)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{ fontSize: "20px" }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>
                Document Q&A
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>
                Scope: {scopeLabel}
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "20px",
              padding: "3px 10px",
              fontSize: "11px",
              color: "white",
            }}>
              {docs.length} doc{docs.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            minHeight: "380px",
            maxHeight: "500px",
            overflowY: "auto",
            padding: "18px",
            background: "#faf9fe",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px",
                  alignItems: "flex-end",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", flexShrink: 0,
                  }}>
                    📄
                  </div>
                )}
                <div style={{
                  maxWidth: "75%",
                  padding: "11px 15px",
                  borderRadius: msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6f42c1, #8a5cf7)"
                    : "white",
                  color: msg.role === "user" ? "white" : "#333",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  boxShadow: msg.role === "user"
                    ? "0 2px 8px rgba(111,66,193,0.25)"
                    : "0 1px 4px rgba(0,0,0,0.07)",
                  border: msg.role === "assistant" ? "1px solid #ede9fe" : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px",
                }}>
                  📄
                </div>
                <div style={{
                  padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                  background: "white", border: "1px solid #ede9fe",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#6f42c1", opacity: 0.7,
                      animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* No docs warning */}
          {docs.length === 0 && (
            <div style={{
              padding: "10px 18px",
              background: "#fffbeb",
              borderTop: "1px solid #fde68a",
              fontSize: "12.5px",
              color: "#92400e",
            }}>
              ⚠️ Upload a document on the left to enable Q&A
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "14px 18px",
            background: "white",
            borderTop: "1px solid #ede9fe",
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                docs.length === 0
                  ? "Upload a document first…"
                  : "Ask anything about your documents…"
              }
              rows={1}
              disabled={loading || docs.length === 0}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #ddd6fe",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                lineHeight: "1.5",
                maxHeight: "100px",
                overflowY: "auto",
                transition: "border-color 0.2s",
                opacity: docs.length === 0 ? 0.5 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6f42c1")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd6fe")}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
            />
            <button
              onClick={sendQuestion}
              disabled={loading || !input.trim() || docs.length === 0}
              style={{
                width: "40px", height: "40px",
                borderRadius: "10px", border: "none",
                background: loading || !input.trim() || docs.length === 0
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #6f42c1, #8a5cf7)",
                color: loading || !input.trim() || docs.length === 0 ? "#9ca3af" : "white",
                cursor: loading || !input.trim() || docs.length === 0 ? "not-allowed" : "pointer",
                fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}