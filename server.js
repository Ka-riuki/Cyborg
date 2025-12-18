const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;

// Enable CORS for React frontend
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Kenyan Hotels Data
const hotels = [
  {
    id: 1,
    name: "Sarova Stanley",
    location: "Nairobi",
    price: 12000,
    type: "Deluxe",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Restaurant"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
  },
  {
    id: 2,
    name: "Diani Reef Beach Resort",
    location: "Mombasa",
    price: 15000,
    type: "Suite",
    amenities: ["Beach Front", "All Inclusive", "Water Sports", "Bar"],
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"
  },
  {
    id: 3,
    name: "Imperial Hotel Kisumu",
    location: "Kisumu",
    price: 8000,
    type: "Standard",
    amenities: ["Lake View", "Free Breakfast", "Conference Room"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400"
  },
  {
    id: 4,
    name: "Lake Nakuru Lodge",
    location: "Nakuru",
    price: 11000,
    type: "Deluxe",
    amenities: ["Wildlife Viewing", "Game Drives", "Bonfire", "Restaurant"],
    image: "https://images.unsplash.com/photo-1564501049418-3c27787d01e8?w=400"
  },
  {
    id: 5,
    name: "Fairview Hotel",
    location: "Nairobi",
    price: 9500,
    type: "Business",
    amenities: ["City View", "Business Center", "Gym", "Bar"],
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400"
  },
  {
    id: 6,
    name: "Voyager Beach Resort",
    location: "Mombasa",
    price: 13500,
    type: "Family",
    amenities: ["Private Beach", "Kids Club", "Multiple Pools", "Spa"],
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400"
  }
];

// API Routes

// Home endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🏨 Kenyan Hotel Booking API",
    version: "1.0.0",
    endpoints: {
      hotels: "/api/hotels",
      locations: "/api/locations",
      book: "/api/book (POST)"
    }
  });
});

// Get all hotels
app.get("/api/hotels", (req, res) => {
  console.log("📡 Serving hotels data to frontend");
  res.json(hotels);
});

// Get hotels by location
app.get("/api/hotels/:location", (req, res) => {
  const location = req.params.location.toLowerCase();
  const filtered = hotels.filter(h => 
    h.location.toLowerCase() === location
  );
  res.json(filtered);
});

// Get unique locations
app.get("/api/locations", (req, res) => {
  const locations = [...new Set(hotels.map(h => h.location))];
  res.json(locations);
});

// Create booking
app.post("/api/bookings", (req, res) => {
  const { hotelId, guestName, email, checkIn, checkOut, guests } = req.body;
  
  // Find the hotel
  const hotel = hotels.find(h => h.id === hotelId);
  
  if (!hotel) {
    return res.status(404).json({
      success: false,
      message: "Hotel not found"
    });
  }
  
  // Calculate total (simple calculation: price * 3 nights example)
  const nights = 3; // This would be calculated from dates
  const total = hotel.price * nights;
  
  // Generate booking reference
  const bookingRef = `KEN-HTL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const booking = {
    reference: bookingRef,
    hotel: hotel,
    guest: {
      name: guestName,
      email: email
    },
    dates: {
      checkIn: checkIn,
      checkOut: checkOut
    },
    guests: guests,
    total: total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    message: "Asante sana for your booking! Karibu Kenya! 🇰🇪"
  };
  
  res.json({
    success: true,
    message: "Booking confirmed successfully!",
    booking: booking
  });
});

// Search hotels (optional endpoint)
app.get("/api/search", (req, res) => {
  const { location, minPrice, maxPrice, type } = req.query;
  
  let results = [...hotels];
  
  if (location) {
    results = results.filter(h => 
      h.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (minPrice) {
    results = results.filter(h => h.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    results = results.filter(h => h.price <= parseInt(maxPrice));
  }
  
  if (type) {
    results = results.filter(h => 
      h.type.toLowerCase().includes(type.toLowerCase())
    );
  }
  
  res.json(results);
});

// Start server
app.listen(PORT, () => {
  console.log("================================================");
  console.log("🏨  KENYAN HOTEL BOOKING API");
  console.log("================================================");
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("");
  console.log("📊 Available Endpoints:");
  console.log(`   📍 Home:      http://localhost:${PORT}/`);
  console.log(`   🏨 All Hotels: http://localhost:${PORT}/api/hotels`);
  console.log(`   🗺️  Locations:  http://localhost:${PORT}/api/locations`);
  console.log(`   🔍 Search:     http://localhost:${PORT}/api/search`);
  console.log(`   📅 Book:       http://localhost:${PORT}/api/bookings (POST)`);
  console.log("");
  console.log("🌐 Frontend: http://localhost:3000");
  console.log("================================================");
});
