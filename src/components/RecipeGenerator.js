import React, { useState } from "react";
import ReactMarkdown from "react-markdown"; 

function RecipeGenerator() {
    // Dynamic fallback structure to swap seamlessly between Render production and Localhost
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

    const [ingredients, setIngredients] = useState("");
    const [recipe, setRecipe] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!ingredients.trim()) return;

        setIsLoading(true);
        setRecipe("");
        const token = localStorage.getItem("token");

        try {
            // UPDATED: Replaced localhost with the dynamic API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/ai/recipe`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ingredients })
            });

            if (response.ok) {
                const recipeText = await response.text();
                setRecipe(recipeText);
            } else {
                setRecipe("Failed to formulate culinary instructions. Please recheck your parameters.");
            }
        } catch (err) {
            console.error(err);
            setRecipe("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "850px", margin: "20px auto", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px", fontFamily: "system-ui, sans-serif", padding: "0 10px" }}>
            <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "20px", border: "1px solid #F3F4F6", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", height: "fit-content" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "700" }}>AI Recipe Studio 🍳</h4>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6B7280", lineHeight: "1.4" }}>Enter the ingredients you have available, and the AI will generate a structured meal complete with a macro breakdown.</p>
                <form onSubmit={handleGenerate}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", marginBottom: "6px" }}>Available Ingredients</label>
                    <textarea placeholder="e.g., milk, oats, and honey..." value={ingredients} onChange={e => setIngredients(e.target.value)} rows={4} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #E5E7EB", outline: "none", fontSize: "13px", resize: "none", boxSizing: "border-box", marginBottom: "16px", lineHeight: "1.5" }} />
                    <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "12px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)" }}>{isLoading ? "Generating plan..." : "Create Recipe ✨"}</button>
                </form>
            </div>

            <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "20px", border: "1px solid #F3F4F6", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", minHeight: "450px", display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", borderBottom: "1px solid #F3F4F6", paddingBottom: "12px", color: "#1F2937" }}>Output Blueprint</h4>
                {isLoading && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#6B7280", fontSize: "14px" }}>
                        <div style={{ fontSize: "28px", marginBottom: "10px" }}>⏳</div>
                        <span>Calculating ratios and formulation steps...</span>
                    </div>
                )}
                {!isLoading && !recipe && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "0 20px" }}>Your AI-generated cooking instructions and nutritional matrices will render right here.</div>
                )}
                {!isLoading && recipe && (
                    <div className="recipe-markdown-content" style={{ flex: 1, fontSize: "14px", color: "#374151", lineHeight: "1.6", background: "#F9FAFB", padding: "5px 25px", borderRadius: "12px", border: "1px solid #E5E7EB", overflowY: "auto", maxHeight: "550px", textAlign: "left" }}>
                        <ReactMarkdown>{recipe}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipeGenerator;