import React, { useState } from "react";

function TestApp() {
    const [clickCount, setClickCount] = useState(0);
    const [hotels] = useState([
        { id: 1, name: "Test Hotel", location: "Nairobi", price: 12000 }
    ]);

    const handleClick = () => {
        console.log("Button clicked!");
        setClickCount(prev => prev + 1);
        alert(`Clicked ${clickCount + 1} times!`);
    };

    const handleBook = (hotelName) => {
        console.log("Booking:", hotelName);
        alert(`Booking ${hotelName}`);
    };

    console.log("TestApp rendering...");

    return (
        <div style={{ padding: "20px" }}>
            <h1>🏨 Test Hotel App</h1>
            <p>If buttons work, you'll see alerts and console messages</p>

            <button
                onClick={handleClick}
                style={{
                    padding: "10px 20px",
                    background: "#006600",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    margin: "10px"
                }}
            >
                Test Click ({clickCount})
            </button>

            <div style={{ marginTop: "20px" }}>
                {hotels.map(hotel => (
                    <div key={hotel.id} style={{ marginBottom: "10px" }}>
                        <h3>{hotel.name}</h3>
                        <button onClick={() => handleBook(hotel.name)}>
                            Book {hotel.name}
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "30px", padding: "10px", background: "#f0f0f0" }}>
                <h4>Debug Info:</h4>
                <p>Open Console (F12) to see messages</p>
                <p>Click count: {clickCount}</p>
            </div>
        </div>
    );
}

export default TestApp;