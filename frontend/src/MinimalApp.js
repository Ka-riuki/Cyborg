import React from "react";

function MinimalApp() {
    // Direct function, no hooks
    const testAlert = () => {
        alert("✅ Button is working!");
        console.log("Button clicked - alert shown");
    };

    return (
        <div style={{
            padding: "40px",
            textAlign: "center",
            fontFamily: "Arial, sans-serif"
        }}>
            <h1 style={{ color: "#006600" }}>🏨 Kenyan Hotels - Minimal Test</h1>

            <div style={{
                backgroundColor: "#e6f7ff",
                padding: "20px",
                borderRadius: "10px",
                margin: "20px 0"
            }}>
                <h3>🇰🇪 Test Buttons</h3>
                <p>Click any button below. You should see an alert.</p>
            </div>

            {/* Test Button 1 - Inline function */}
            <button
                onClick={() => {
                    alert("Inline function works!");
                    console.log("Inline button clicked");
                }}
                style={buttonStyle}
            >
                Test Button 1 (Inline)
            </button>

            {/* Test Button 2 - External function */}
            <button
                onClick={testAlert}
                style={buttonStyle}
            >
                Test Button 2 (Function)
            </button>

            {/* Test Button 3 - With preventDefault */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    alert("Button with preventDefault works!");
                }}
                style={buttonStyle}
            >
                Test Button 3 (preventDefault)
            </button>

            <div style={{
                marginTop: "40px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "1px solid #dee2e6"
            }}>
                <h4>Debug Panel</h4>
                <p>Open Console (F12) to see logs</p>
                <p>All buttons should trigger alerts</p>
                <button
                    onClick={() => console.log("Console log test")}
                    style={{...buttonStyle, backgroundColor: "#6c757d"}}
                >
                    Test Console Log
                </button>
            </div>
        </div>
    );
}

const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#006600",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    margin: "10px",
    minWidth: "200px"
};

export default MinimalApp;