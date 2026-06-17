import React, { useState } from "react";

function AuthComponent({ onLoginSuccess }) {

    // Dynamic fallback structure to swap seamlessly between Render production and Localhost
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    
    // Track active focus state for interactive input styling
    const [focusedField, setFocusedField] = useState("");

    const colors = {
        primary: "#4F46E5",     // Deep Indigo Accent
        primaryHover: "#4338CA",
        background: "#F3F4F6",  // Slightly darker body tone to contrast the glass card
        cardBg: "rgba(255, 255, 255, 0.75)", // Glassmorphic translucent white
        textMain: "#1F2937",
        textMuted: "#4B5563",
        border: "rgba(229, 231, 235, 0.6)",
        borderFocus: "#4F46E5"
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Dynamically shift endpoints based on UI card active toggle state
        const endpoint = isRegistering ? "register" : "login";
        const payload = isRegistering ? { email, password, name } : { email, password };

        try {
            // FIXED: Routed to /api/auth/ instead of rewriting the meal tracker tables
            const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // Handle invalid credential matching or registration blocks
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    setError(errorData.message || "Authentication failed.");
                } else {
                    const errorText = await response.text();
                    setError(errorText || "Invalid email or password.");
                }
            } else {
                // Successful verification: Parse JWT token profile block 
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userEmail", data.email);
                onLoginSuccess(data);
            }
        } catch (err) {
            console.error("Auth error: ", err);
            setError("Server connection dropped. Please verify your backend app is active.");
        }
    };

    // Shared input styling engine handling dynamic focus micro-interactions
    const getInputStyle = (fieldName) => ({
        width: "100%",
        padding: "14px 16px",
        borderRadius: "14px",
        border: `2px solid ${focusedField === fieldName ? colors.borderFocus : "rgba(209, 213, 219, 0.5)"}`,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        outline: "none",
        fontSize: "14px",
        fontWeight: "500",
        color: colors.textMain,
        boxSizing: "border-box",
        boxShadow: focusedField === fieldName ? "0 0 0 4px rgba(79, 70, 229, 0.1)" : "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
    });

    return (
        <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            background: "radial-gradient(circle at 10% 20%, rgb(239, 246, 255) 0%, rgb(219, 234, 254) 100%)", 
            fontFamily: "'Inter', system-ui, sans-serif", 
            padding: "20px" 
        }}>
            {/* GLASSMORPHIC INTERACTIVE CARD CONTAINER */}
            <div style={{ 
                width: "100%", 
                maxWidth: "420px", 
                background: colors.cardBg, 
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                padding: "45px 40px", 
                borderRadius: "28px", 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.04), 0 10px 15px -3px rgba(0, 0, 0, 0.02)", 
                border: `1px solid ${colors.border}` 
            }}>
                
                {/* BRAND LOGO & TYPOGRAPHY SYSTEM */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ 
                        width: "54px", 
                        height: "54px", 
                        backgroundColor: "rgba(255, 255, 255, 0.8)", 
                        borderRadius: "16px", 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "26px", 
                        marginBottom: "14px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)"
                    }}>
                        🌱
                    </div>
                    <h1 style={{ margin: 0, fontSize: "30px", fontWeight: "800", color: colors.textMain, letterSpacing: "-0.04em" }}>
                        Macro<span style={{ color: colors.primary }}>Mate AI</span>
                    </h1>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: colors.textMuted, fontWeight: "500" }}>
                        {isRegistering ? "Create your smart fitness profile" : "Welcome back! Let's hit those goals."}
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: "#FEE2E2", color: "#EF4444", padding: "14px 16px", borderRadius: "14px", fontSize: "13px", fontWeight: "600", marginBottom: "22px", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Dhruv Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => setFocusedField("name")}
                                onBlur={() => setFocusedField("")}
                                required
                                style={getInputStyle("name")}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="yourname@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField("")}
                            required
                            style={getInputStyle("email")}
                        />
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField("")}
                            required
                            style={getInputStyle("password")}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            width: "100%", 
                            padding: "15px", 
                            backgroundColor: colors.primary, 
                            color: "white", 
                            border: "none", 
                            borderRadius: "14px", 
                            cursor: "pointer", 
                            fontWeight: "700", 
                            fontSize: "15px", 
                            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
                            transition: "all 0.15s ease-in-out"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.primaryHover}
                        onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary}
                    >
                        {isRegistering ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div style={{ marginTop: "28px", textAlign: "center", borderTop: "1px solid rgba(229, 231, 235, 0.5)", paddingTop: "22px" }}>
                    <button
                        onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                        style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", fontWeight: "700", fontSize: "14px", transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.target.style.color = colors.primaryHover}
                        onMouseLeave={(e) => e.target.style.color = colors.primary}
                    >
                        {isRegistering ? "Already have an account? Log in" : "New to MacroMate? Create an account"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthComponent;