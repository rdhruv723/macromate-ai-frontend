// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import ChatComponent from './components/ChatComponent';
import RecipeGenerator from './components/RecipeGenerator';
import AuthComponent from './components/AuthComponent';
import DashboardComponent from './components/DashboardComponent'; 

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Monitor screen layout resizing parameters
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const theme = {
    primary: "#4F46E5",
    cardBg: "#FFFFFF",
    textMain: "#1F2937",
    textMuted: "#6B7280",
    border: "#E5E7EB"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    if (token) {
      setUser({ name });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser({ name: userData.name });
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <AuthComponent onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <div className="App" style={{ minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'Inter', system-ui, sans-serif" }}>
        
        {/* --- STICKY PERSISTENT NAVIGATION HEADER BAR --- */}
        <header style={{
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
            padding: isMobile ? "12px 16px" : "16px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)"
        }}>
            {/* Left Side: Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🌱</span>
                <span style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "800", color: theme.textMain, letterSpacing: "-0.03em" }}>
                    Macro<span style={{ color: theme.primary }}>Mate AI</span>
                </span>
            </div>

            {/* Right Side: Logged User Context & Sign Out */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {!isMobile && (
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: theme.textMain }}>{user.name}</div>
                        <div style={{ fontSize: "12px", color: theme.textMuted }}>{localStorage.getItem("userEmail")}</div>
                    </div>
                )}
                
                <button 
                    onClick={handleLogout} 
                    style={{
                        padding: "6px 12px", 
                        backgroundColor: "#F3F4F6", 
                        color: "#374151",
                        border: "none", 
                        borderRadius: "8px", 
                        cursor: "pointer", 
                        fontSize: "12px",
                        fontWeight: "700"
                    }}
                >
                    Sign Out
                </button>
            </div>
        </header>

        {/* --- EXPANDED UNIFIED SWIPABLE TAB CONTROLS --- */}
        <div style={{ 
            width: "100%", 
            padding: isMobile ? "16px 16px 4px 16px" : "25px 40px 10px 40px", 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-start',
            boxSizing: "border-box",
            overflowX: "auto", // Creates slick swiping horizontal bar parameters on touch screens
            WebkitOverflowScrolling: "touch"
        }}>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: "13px", flexShrink: 0 }}
          >
            Dashboard 📊
          </button>
          <button 
            className={activeTab === 'chat' ? 'active' : ''} 
            onClick={() => setActiveTab('chat')}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: "13px", flexShrink: 0 }}
          >
            Ask AI 💬
          </button>
          <button 
            className={activeTab === 'recipe-generator' ? 'active' : ''} 
            onClick={() => setActiveTab('recipe-generator')}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: "13px", flexShrink: 0 }}
          >
            Recipes 🍳
          </button>
        </div>

        {/* --- FULL WIDTH DYNAMIC VIEWPORT RENDER --- */}
        <div style={{ width: "100%", boxSizing: "border-box", marginTop: '10px' }}>
          {activeTab === 'dashboard' && <DashboardComponent />}
          {activeTab === 'chat' && <ChatComponent />}
          {activeTab === 'recipe-generator' && <RecipeGenerator />}
        </div>
      </div>
  );
}

export default App;