import React, { useState } from "react";

function ChatComponent() {
    // Dynamic fallback structure to swap seamlessly between Render production and Localhost
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

    const [messages, setMessages] = useState([
        { sender: "ai", text: "Hello! I have full access to your custom caloric data models. How can I assist you with your nutrition goals today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const colors = {
        primary: "#4F46E5",
        background: "#F9FAFB",
        cardBg: "#FFFFFF",
        textMain: "#1F2937",
        textMuted: "#6B7280",
        border: "#E5E7EB",
        aiAccent: "#8B5CF6"
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentInput = input;
        const userMsg = { sender: "user", text: currentInput };
        
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        const token = localStorage.getItem("token");

        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: currentInput })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { sender: "ai", text: "System connection error. Unable to stream analytical payload from Gemini." }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: "ai", text: "Network dropped. Please check if your Spring Boot server is online." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "850px", margin: "0 auto", padding: "0 20px", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ background: colors.cardBg, borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02)", border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", height: "65vh", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "10px", height: "10px", backgroundColor: "#10B981", borderRadius: "50%", boxShadow: "0 0 12px #10B981" }}></div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: colors.textMain, letterSpacing: "-0.02em" }}>
                        MacroMate Assistant <span style={{ color: colors.aiAccent, fontSize: "11px", fontWeight: "700", background: "#F5F3FF", padding: "2px 8px", borderRadius: "6px", marginLeft: "6px" }}>Gemini Engine</span>
                    </h4>
                </div>
                <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: colors.background }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "70%", padding: "14px 18px", fontSize: "14px", lineHeight: "1.6", fontWeight: "500", backgroundColor: msg.sender === "user" ? colors.primary : colors.cardBg, color: msg.sender === "user" ? "#FFFFFF" : colors.textMain, boxShadow: msg.sender === "user" ? "0 4px 14px rgba(79, 70, 229, 0.15)" : "0 2px 4px rgba(0,0,0,0.01)", border: msg.sender === "user" ? "none" : `1px solid ${colors.border}`, borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", transition: "all 0.2s" }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <div style={{ padding: "12px 18px", backgroundColor: "rgba(229, 231, 235, 0.5)", color: colors.textMuted, borderRadius: "18px 18px 18px 4px", fontSize: "13px", fontWeight: "600" }}>
                                <span>⚡ Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSend} style={{ padding: "18px 24px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "12px", background: colors.cardBg }}>
                    <input type="text" placeholder="Ask about macro adjustments, meal ratings, or exercise plans..." value={input} onChange={e => setInput(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{ flex: 1, padding: "14px 18px", borderRadius: "14px", border: `2px solid ${isFocused ? colors.primary : "rgba(209, 213, 219, 0.5)"}`, outline: "none", fontSize: "14px", fontWeight: "500", backgroundColor: colors.background, boxShadow: isFocused ? "0 0 0 4px rgba(79, 70, 229, 0.08)" : "none", transition: "all 0.2s ease-in-out" }} />
                    <button type="submit" disabled={isLoading || !input.trim()} style={{ padding: "14px 28px", backgroundColor: !input.trim() ? "#E5E7EB" : colors.primary, color: !input.trim() ? colors.textMuted : "white", border: "none", borderRadius: "14px", cursor: !input.trim() ? "default" : "pointer", fontWeight: "700", fontSize: "14px", boxShadow: !input.trim() ? "none" : "0 4px 14px rgba(79, 70, 229, 0.2)", transition: "all 0.2s" }}>Send</button>
                </form>
            </div>
        </div>
    );
}

export default ChatComponent;