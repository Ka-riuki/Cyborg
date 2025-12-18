require('dotenv').config();
const nodemailer = require('nodemailer');
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

// Create email transporter
let transporter;

// Try to setup email - if .env not configured, use test account
async function setupEmail() {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use real email (Gmail)
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('✅ Using Gmail for emails');
    } else {
      // Create test email account (no setup needed)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Using Ethereal test email');
      console.log('   Test account:', testAccount.user);
      console.log('   Test password:', testAccount.pass);
      console.log('   View emails at: https://ethereal.email');
    }

    // Verify connection
    await transporter.verify();
    console.log('✅ Email server ready');
  } catch (error) {
    console.log('⚠️  Email setup failed:', error.message);
    console.log('   Bookings will work, but emails will not be sent');
    transporter = null;
  }
}

// Function to send booking confirmation email
async function sendBookingEmail(bookingDetails) {
  if (!transporter) {
    console.log('⚠️  Skipping email - no transporter');
    return false;
  }

  try {
    const mailOptions = {
      from: `"KenyaStay Hotels" <${process.env.EMAIL_USER || 'bookings@kenyastay.co.ke'}>`,
      to: bookingDetails.email,
      subject: `✅ Booking Confirmed: ${bookingDetails.hotelName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #006600; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🏨 KenyaStay Booking Confirmation</h1>
            <p style="margin: 10px 0 0; font-size: 18px;">🇰🇪 Karibu Kenya!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #006600; margin-top: 0;">Hello ${bookingDetails.guestName}!</h2>
            <p style="font-size: 16px; color: #333;">Thank you for booking with KenyaStay. Your reservation has been confirmed.</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #006600; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #006600; margin-top: 0;">${bookingDetails.hotelName}</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div>
                  <p style="margin: 8px 0;"><strong>📍 Location:</strong><br>${bookingDetails.location}</p>
                  <p style="margin: 8px 0;"><strong>👥 Guests:</strong><br>${bookingDetails.guests} ${bookingDetails.guests === 1 ? 'guest' : 'guests'}</p>
                </div>
                <div>
                  <p style="margin: 8px 0;"><strong>📅 Check-in:</strong><br>${bookingDetails.checkIn}</p>
                  <p style="margin: 8px 0;"><strong>📅 Check-out:</strong><br>${bookingDetails.checkOut}</p>
                </div>
              </div>
              
              <div style="background: #e6f7ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #006600;">
                <p style="margin: 5px 0;"><strong>💰 Total Amount:</strong> KES ${bookingDetails.total.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>🔖 Booking Reference:</strong> ${bookingDetails.reference}</p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                <em>Please present this reference at check-in. Keep this email for your records.</em>
              </p>
            </div>
            
            <div style="background: #e6f7ff; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #b3e0ff;">
              <h4 style="color: #004d99; margin-top: 0;">📋 What to Expect</h4>
              <ul style="color: #333;">
                <li>Check-in time: 2:00 PM</li>
                <li>Check-out time: 11:00 AM</li>
                <li>Free cancellation until 48 hours before check-in</li>
                <li>Contact hotel directly for special requests</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <h4 style="color: #333;">📞 Need Help?</h4>
              <p style="color: #666;">
                KenyaStay Customer Support<br>
                📧 support@kenyastay.co.ke<br>
                📞 +254 700 000 000<br>
                🕐 Mon-Fri: 8AM-6PM EAT
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>© ${new Date().getFullYear()} KenyaStay. All rights reserved.</p>
              <p>Thank you for choosing authentic Kenyan hospitality!</p>
            </div>
          </div>
        </div>
      `,
      text: `
KENYASTAY BOOKING CONFIRMATION
===============================

Hello ${bookingDetails.guestName}!

Your booking at ${bookingDetails.hotelName} has been confirmed.

DETAILS:
• Hotel: ${bookingDetails.hotelName}
• Location: ${bookingDetails.location}
• Check-in: ${bookingDetails.checkIn}
• Check-out: ${bookingDetails.checkOut}
• Guests: ${bookingDetails.guests}
• Total: KES ${bookingDetails.total}
• Reference: ${bookingDetails.reference}

Check-in time: 2:00 PM
Check-out time: 11:00 AM

For questions or changes:
📧 support@kenyastay.co.ke
📞 +254 700 000 000

Thank you for choosing KenyaStay!
🇰🇪 Karibu Kenya!
      `
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    console.log(`✅ Email sent to ${bookingDetails.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
}

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
      book: "/api/bookings (POST)",
      test_email: "/api/test-email (POST)"
    },
    email: transporter ? "✅ Email service active" : "⚠️ Email service not available"
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

// Create booking WITH EMAIL CONFIRMATION
app.post("/api/bookings", async (req, res) => {
  const { hotelId, guestName, email, checkIn, checkOut, guests } = req.body;

  // Find the hotel
  const hotel = hotels.find(h => h.id === hotelId);

  if (!hotel) {
    return res.status(404).json({
      success: false,
      message: "Hotel not found"
    });
  }

  // Calculate total (3 nights for demo)
  const nights = 3; // In real app: calculate days between checkIn and checkOut
  const total = hotel.price * nights;

  // Generate booking reference
  const bookingRef = `KS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

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
    guests: parseInt(guests) || 1,
    total: total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    message: "Asante sana for your booking! Karibu Kenya! 🇰🇪"
  };

  // Try to send email
  let emailSent = false;
  if (transporter) {
    const emailDetails = {
      guestName: guestName,
      email: email,
      hotelName: hotel.name,
      location: hotel.location,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      total: total,
      reference: bookingRef
    };

    emailSent = await sendBookingEmail(emailDetails);
  }

  // Log booking
  console.log(`📝 New booking: ${bookingRef} for ${guestName} at ${hotel.name}`);

  res.json({
    success: true,
    message: emailSent
        ? "Booking confirmed! Check your email for details."
        : "Booking confirmed! (Email could not be sent)",
    booking: booking,
    emailSent: emailSent
  });
});

// Search hotels
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

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      message: "Email service not configured"
    });
  }

  const { email } = req.body;
  const testEmail = email || (process.env.EMAIL_USER ? process.env.EMAIL_USER : null);

  if (!testEmail) {
    return res.status(400).json({
      success: false,
      message: "No email address provided"
    });
  }

  try {
    const emailSent = await sendBookingEmail({
      guestName: "Test User",
      email: testEmail,
      hotelName: "Test Hotel Nairobi",
      location: "Nairobi",
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      guests: 2,
      total: 36000,
      reference: "TEST-" + Date.now().toString().slice(-6)
    });

    res.json({
      success: emailSent,
      message: emailSent
          ? "Test email sent! Check your inbox."
          : "Failed to send test email"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message
    });
  }
});

// Start server
setupEmail().then(() => {
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
    console.log(`   📧 Test Email: http://localhost:${PORT}/api/test-email (POST)`);
    console.log("");
    console.log("📧 Email Status:", transporter ? "✅ Active" : "⚠️ Not configured");
    console.log("");
    console.log("🌐 Frontend: http://localhost:3000");
    console.log("================================================");
  });
});