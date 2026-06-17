import React, { useState, useEffect } from "react";

function DashboardComponent() {
    // Dynamic fallback structure to swap seamlessly between Render production and Localhost
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

    const targets = { calories: 2000, protein: 120, carbs: 230, fats: 65, fiber: 30 };
    const userEmail = localStorage.getItem("userEmail") || "test@gmail.com"; 

    const [viewPeriod, setViewPeriod] = useState("day");
    const [meals, setMeals] = useState({ BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] });
    const [activeMealSlot, setActiveMealSlot] = useState(null); 
    
    const [foodName, setFoodName] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fats, setFats] = useState("");
    const [fiber, setFiber] = useState("");
    
    const [aiInput, setAiInput] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 930);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 930);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getTodayDateString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const todayDate = getTodayDateString();

    const fetchLogs = async () => {
        const token = localStorage.getItem("token");
        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/tracker/logs?email=${userEmail}&date=${todayDate}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                const freshMeals = { BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] };
                data.forEach(item => {
                    if (freshMeals[item.mealSlot]) {
                        freshMeals[item.mealSlot].push(item);
                    }
                });
                setMeals(freshMeals);
            }
        } catch (err) {
            console.error("Error syncing with backend:", err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getDisplayMetrics = () => {
        let dailyTotals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
        Object.values(meals).forEach(arr => arr.forEach(item => {
            dailyTotals.calories += Number(item.calories || 0);
            dailyTotals.protein += Number(item.protein || 0);
            dailyTotals.carbs += Number(item.carbs || 0);
            dailyTotals.fats += Number(item.fats || 0);
            dailyTotals.fiber += Number(item.fiber || 0);
        }));

        if (viewPeriod === "day") return dailyTotals;
        const multiplier = viewPeriod === "week" ? 0.92 : 0.87;
        
        return {
            calories: Math.round(dailyTotals.calories * multiplier) || 0,
            protein: Math.round((dailyTotals.protein * multiplier) * 10) / 10 || 0,
            carbs: Math.round((dailyTotals.carbs * multiplier) * 10) / 10 || 0,
            fats: Math.round((dailyTotals.fats * multiplier) * 10) / 10 || 0,
            fiber: Math.round((dailyTotals.fiber * multiplier) * 10) / 10 || 0,
        };
    };

    const displayTotals = getDisplayMetrics();
    const getPercent = (current, target) => Math.min(Math.round((current / target) * 100) || 0, 100);

    const handleAiAnalyze = async () => {
        if (!aiInput.trim()) return;
        setIsAiLoading(true);
        const token = localStorage.getItem("token");
        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/ai/parse-food`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ description: aiInput })
            });
            if (response.ok) {
                const data = await response.json();
                setFoodName(data.name);
                setCalories(data.calories);
                setProtein(data.protein);
                setCarbs(data.carbs);
                setFats(data.fats);
                setFiber(data.fiber);
                setAiInput(""); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!foodName) return;

        const token = localStorage.getItem("token");
        const payload = {
            name: foodName,
            mealSlot: activeMealSlot,
            calories: Number(calories || 0),
            protein: Number(protein || 0),
            carbs: Number(carbs || 0),
            fats: Number(fats || 0),
            fiber: Number(fiber || 0),
            logDate: todayDate
        };

        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/tracker/add?email=${userEmail}&date=${todayDate}`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                fetchLogs(); 
                setFoodName(""); setCalories(""); setProtein(""); setCarbs(""); setFats(""); setFiber("");
                setActiveMealSlot(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveItem = async (mealSlot, itemId) => {
        const token = localStorage.getItem("token");
        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/tracker/remove/${itemId}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) fetchLogs(); 
        } catch (err) {
            console.error(err);
        }
    };

    const resetFormAndToggleSlot = (slot) => {
        setFoodName(""); setCalories(""); setProtein(""); setCarbs(""); setFats(""); setFiber(""); setAiInput("");
        setActiveMealSlot(activeMealSlot === slot ? null : slot);
    };

    const colors = {
        primary: "#4F46E5", success: "#10B981", ai: "#8B5CF6", danger: "#EF4444",  
        background: "#F9FAFB", cardBg: "#FFFFFF", textMain: "#1F2937", textMuted: "#6B7280", border: "#E5E7EB"
    };

    return (
        <div style={{ width: "100%", padding: isMobile ? "10px 16px" : "20px 40px", boxSizing: "border-box", backgroundColor: colors.background, color: colors.textMain }}>
            <div style={{ display: "flex", justifyContent: "center", background: "#E5E7EB", padding: "4px", borderRadius: "30px", maxWidth: "320px", margin: "0 auto 30px auto" }}>
                {["day", "week", "month"].map((period) => (
                    <button key={period} onClick={() => setViewPeriod(period)} style={{ flex: 1, padding: "8px 16px", borderRadius: "25px", border: "none", cursor: "pointer", fontWeight: "600", textTransform: "capitalize", fontSize: "13px", backgroundColor: viewPeriod === period ? colors.cardBg : "transparent", color: viewPeriod === period ? colors.textMain : colors.textMuted, boxShadow: viewPeriod === period ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>{period}</button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "35% 65%", gap: "24px", marginBottom: "35px", alignItems: "stretch" }}>
                <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, padding: "32px 24px", borderRadius: "24px", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>Energy Intake</span>
                    <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                            <circle cx="80" cy="80" r="66" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
                            <circle cx="80" cy="80" r="66" stroke={colors.primary} strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 66} strokeDashoffset={2 * Math.PI * 66 * (1 - getPercent(displayTotals.calories, targets.calories) / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }} />
                        </svg>
                        <div style={{ position: "absolute", textAlign: "center" }}>
                            <span style={{ fontSize: "28px", fontWeight: "800", color: colors.textMain, display: "block", letterSpacing: "-0.03em" }}>{displayTotals.calories}</span>
                            <span style={{ fontSize: "12px", color: colors.textMuted, fontWeight: "600" }}>/ {targets.calories} kcal</span>
                        </div>
                    </div>
                    <div style={{ marginTop: "24px", fontSize: "12px", fontWeight: "700", color: getPercent(displayTotals.calories, targets.calories) >= 100 ? colors.success : colors.textMuted, backgroundColor: "#F9FAFB", padding: "6px 16px", borderRadius: "20px", border: `1px solid ${colors.border}` }}>
                        {getPercent(displayTotals.calories, targets.calories)}% Daily Budget Met
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", background: colors.cardBg, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "24px", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.02)" }}>
                    {[
                        { label: "Protein 🍗", value: displayTotals.protein, target: targets.protein, color: "#F59E0B" },
                        { label: "Carbs 🌾", value: displayTotals.carbs, target: targets.carbs, color: "#3B82F6" },
                        { label: "Fats 🥑", value: displayTotals.fats, target: targets.fats, color: colors.success },
                        { label: "Fiber 🥦", value: displayTotals.fiber, target: targets.fiber, color: colors.ai }
                    ].map((macro) => (
                        <div key={macro.label} style={{ background: "#FAFAFA", padding: "20px", borderRadius: "16px", border: "1px solid #F3F4F6", display: "flex", flexDirection: "column", justifycontent: "space-between" }}>
                            <div style={{ display: "flex", justifycontent: "space-between", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700", color: colors.textMain }}>{macro.label.split(" ")[0]}</span>
                                <span style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "600" }}>{macro.value}g <span style={{ color: "#9CA3AF", fontWeight: "500" }}>/ {macro.target}g</span></span>
                            </div>
                            <div style={{ marginTop: "16px" }}>
                                <div style={{ width: "100%", height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${getPercent(macro.value, macro.target)}%`, height: "100%", backgroundColor: macro.color, borderRadius: "4px", transition: "width 0.4s" }}></div>
                                </div>
                                <div style={{ display: "flex", justifycontent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "700", color: macro.color }}>{getPercent(macro.value, macro.target)}%</span>
                                    <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "600" }}>{Number(Math.max(0, macro.target - macro.value)).toFixed(1).replace(".0", "")}g left</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "15px", paddingLeft: "4px", letterSpacing: "-0.01em" }}>Meals Overview</h3>
            {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((slot) => (
                <div key={slot} style={{ background: colors.cardBg, borderRadius: "16px", padding: isMobile ? "16px" : "24px", marginBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)", border: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", justifycontent: "space-between", alignItems: "center", borderBottom: meals[slot].length > 0 ? "1px solid #F3F4F6" : "none", paddingBottom: meals[slot].length > 0 ? "12px" : "0" }}>
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", textTransform: "capitalize" }}>{slot.toLowerCase()}</h4>
                        <button onClick={() => resetFormAndToggleSlot(slot)} style={{ padding: "6px 14px", backgroundColor: activeMealSlot === slot ? "#FEE2E2" : "#EEF2F6", color: activeMealSlot === slot ? colors.danger : colors.primary, border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>{activeMealSlot === slot ? "Close" : "+ Add Entry"}</button>
                    </div>

                    <div style={{ marginTop: "8px" }}>
                        {meals[slot].length === 0 ? (
                            activeMealSlot !== slot && <p style={{ fontSize: "13px", color: colors.textMuted, fontStyle: "italic", margin: "8px 0 0 0" }}>No food tracked for this slot.</p>
                        ) : (
                            meals[slot].map(item => (
                                <div key={item.id} style={{ display: "flex", justifycontent: "space-between", alignItems: "center", padding: "12px 4px", borderBottom: "1px solid #F9FAFB", fontSize: "14px" }}>
                                    <div style={{ maxWidth: "80%" }}>
                                        <span style={{ fontWeight: "600", color: colors.textMain, display: "block" }}>{item.name}</span>
                                        <div style={{ color: colors.textMuted, fontSize: "12px", marginTop: "2px" }}>
                                            <span style={{ color: colors.primary, fontWeight: "600" }}>{item.calories} kcal</span> <br style={{ display: isMobile ? "block" : "none" }}/> {!isMobile && "|"} P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveItem(slot, item.id)} style={{ background: "#FEE2E2", border: "none", color: colors.danger, cursor: "pointer", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifycontent: "center" }}>🗑️</button>
                                </div>
                            ))
                        )}
                    </div>

                    {activeMealSlot === slot && (
                        <div style={{ marginTop: "16px", padding: isMobile ? "12px" : "16px", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px", marginBottom: "16px", background: colors.cardBg, padding: "6px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                                <input type="text" placeholder="Tell AI: '2 wheat rotis'..." value={aiInput} onChange={e => setAiInput(e.target.value)} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "none", outline: "none", fontSize: "13px" }} />
                                <button type="button" onClick={handleAiAnalyze} disabled={isAiLoading} style={{ padding: "10px 16px", backgroundColor: colors.ai, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>{isAiLoading ? "Parsing..." : "✨ AI Autofill"}</button>
                            </div>

                            <form onSubmit={handleAddItem}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                                    <label style={{ gridColumn: "span 2" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Food Item Name</span>
                                        <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} required style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                    <label style={{ gridColumn: isMobile ? "span 2" : "span 1" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Calories (kcal)</span>
                                        <input type="number" value={calories} onChange={e => setCalories(e.target.value)} style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                    <label style={{ gridColumn: isMobile ? "span 2" : "span 1" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Protein (g)</span>
                                        <input type="number" step="any" value={protein} onChange={e => setProtein(e.target.value)} style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                    <label style={{ gridColumn: isMobile ? "span 2" : "span 1" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Carbs (g)</span>
                                        <input type="number" step="any" value={carbs} onChange={e => setCarbs(e.target.value)} style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                    <label style={{ gridColumn: isMobile ? "span 2" : "span 1" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Fats (g)</span>
                                        <input type="number" step="any" value={fats} onChange={e => setFats(e.target.value)} style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                    <label style={{ gridColumn: "span 2" }}>
                                        <span style={{ fontSize: "11px", color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Fiber (g)</span>
                                        <input type="number" step="any" value={fiber} onChange={e => setFiber(e.target.value)} style={{ width: "100%", padding: "8px 12px", marginTop: "4px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                                    </label>
                                </div>
                                <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: colors.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>Confirm & Log Meal</button>
                            </form>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default DashboardComponent;