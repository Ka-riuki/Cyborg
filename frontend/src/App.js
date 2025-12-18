import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    hotelId: null
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  // Add the missing state variables
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // API URL - Your backend
  const API_URL = "http://localhost:8080/api";

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      console.log("Fetching hotels from:", API_URL);
      const response = await axios.get(`${API_URL}/hotels`);

      setHotels(response.data);

      // Extract unique locations
      const uniqueLocations = [...new Set(response.data.map(h => h.location))];
      setLocations(uniqueLocations);

      setLoading(false);
      console.log("Successfully loaded", response.data.length, "hotels");
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to load hotels. Make sure backend is running at http://localhost:8080");
      setLoading(false);

      // Fallback data
      setHotels([
        {
          id: 1,
          name: "Sarova Stanley",
          location: "Nairobi",
          price: 12000,
          type: "Deluxe",
          amenities: ["Free WiFi", "Swimming Pool", "Spa"]
        },
        {
          id: 2,
          name: "Diani Reef",
          location: "Mombasa",
          price: 15000,
          type: "Suite",
          amenities: ["Beach Front", "All Inclusive"]
        }
      ]);
      setLocations(["Nairobi", "Mombasa"]);
    }
  };

  // Handle Book Now click
  const handleBookNow = (hotel) => {
    setSelectedHotel(hotel);
    setBookingForm({
      ...bookingForm,
      hotelId: hotel.id,
      // Set default dates
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Show loading
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/bookings`, {
        hotelId: bookingForm.hotelId,
        guestName: bookingForm.name,
        email: bookingForm.email,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests
      });

      // Show better confirmation
      setBookingSuccess({
        reference: response.data.booking.reference,
        hotelName: selectedHotel.name,
        guestName: bookingForm.name, // Added guestName here
        email: bookingForm.email,
        emailSent: response.data.emailSent,
        message: response.data.message
      });

      setShowBookingModal(false);
      setShowConfirmation(true);

      // Reset form
      setBookingForm({
        name: "",
        email: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
        hotelId: null
      });

    } catch (err) {
      alert("Booking failed. Please check your details and try again.");
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter hotels by location
  const filteredByLocation = selectedLocation === "All"
      ? hotels
      : hotels.filter(hotel => hotel.location === selectedLocation);

  // Filter by search term
  const filteredHotels = filteredByLocation.filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format price in KES
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading Kenyan Hotels...</h2>
          <p>Connecting to backend API...</p>
        </div>
    );
  }

  return (
      <div className="App">
        {/* Header */}
        <header className="header">
          <h1>🏨 Kenyan Hotel & Lodge Booking</h1>
          <div className="kenya-banner">
            <h2>🇰🇪 Karibu Kenya!</h2>
            <p>Experience authentic Kenyan hospitality</p>
          </div>
        </header>

        <main className="container">
          {/* Error Display */}
          {error && (
              <div className="error-alert">
                <h3>⚠️ Connection Error</h3>
                <p>{error}</p>
                <button onClick={fetchHotels}>Retry Connection</button>
              </div>
          )}

          {/* Search Bar */}
          <div className="search-container">
            <input
                type="text"
                placeholder="🔍 Search hotels by name, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
          </div>

          {/* Location Filter */}
          <div className="location-filter">
            <h3>Browse by Destination</h3>
            <div className="filter-buttons">
              <button
                  className={selectedLocation === "All" ? "active" : ""}
                  onClick={() => setSelectedLocation("All")}
              >
                All Locations
              </button>
              {locations.map(location => (
                  <button
                      key={location}
                      className={selectedLocation === location ? "active" : ""}
                      onClick={() => setSelectedLocation(location)}
                  >
                    {location}
                  </button>
              ))}
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="hotels-section">
            <h3>
              {selectedLocation === "All" ? "Available Hotels" : `Hotels in ${selectedLocation}`}
              <span className="count-badge">{filteredHotels.length}</span>
            </h3>

            {filteredHotels.length === 0 ? (
                <div className="no-hotels">
                  <p>No hotels found. Try a different search or location.</p>
                </div>
            ) : (
                <div className="hotels-grid">
                  {filteredHotels.map(hotel => (
                      <div key={hotel.id} className="hotel-card">
                        <div className="hotel-info">
                          <h4>{hotel.name}</h4>
                          <div className="hotel-tags">
                            <span className="location-tag">{hotel.location}</span>
                            <span className="type-tag">{hotel.type}</span>
                          </div>
                          {hotel.amenities && (
                              <p className="amenities">
                                {hotel.amenities.slice(0, 3).map((a, i) => (
                                    <span key={i}>• {a} </span>
                                ))}
                              </p>
                          )}
                          <div className="price-section">
                            <span className="price">{formatPrice(hotel.price)}</span>
                            <small className="price-note">per night</small>
                          </div>
                          <button
                              className="book-button"
                              onClick={() => handleBookNow(hotel)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Booking Modal */}
          {showBookingModal && selectedHotel && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Book {selectedHotel.name}</h3>
                    <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="hotel-summary">
                      <p><strong>Location:</strong> {selectedHotel.location}</p>
                      <p><strong>Type:</strong> {selectedHotel.type}</p>
                      <p><strong>Price:</strong> {formatPrice(selectedHotel.price)} per night</p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="booking-form">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            required
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                            placeholder="Enter your name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            required
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                            placeholder="you@example.com"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Check-in Date *</label>
                          <input
                              type="date"
                              required
                              value={bookingForm.checkIn}
                              onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Check-out Date *</label>
                          <input
                              type="date"
                              required
                              value={bookingForm.checkOut}
                              onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Number of Guests</label>
                        <select
                            value={bookingForm.guests}
                            onChange={(e) => setBookingForm({...bookingForm, guests: parseInt(e.target.value)})}
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? "Guest" : "Guests"}</option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                      </button>
                      <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setShowBookingModal(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmation && bookingSuccess && (
              <div className="confirmation-overlay">
                <div className="confirmation-modal">
                  <div className="confirmation-header">
                    <h2>✅ Booking Confirmed!</h2>
                    <button className="close-btn" onClick={() => setShowConfirmation(false)}>×</button>
                  </div>

                  <div className="confirmation-body">
                    <div className="success-icon">
                      <span style={{fontSize: '3em'}}>🎉</span>
                    </div>

                    <h3>Thank you, {bookingSuccess.guestName}!</h3>

                    <div className="confirmation-details">
                      <p><strong>Hotel:</strong> {bookingSuccess.hotelName}</p>
                      <p><strong>Booking Reference:</strong> {bookingSuccess.reference}</p>
                      <p><strong>Confirmation sent to:</strong> {bookingSuccess.email}</p>

                      {bookingSuccess.emailSent ? (
                          <div className="email-success">
                            <p>📧 Check your email for full booking details</p>
                          </div>
                      ) : (
                          <div className="email-warning">
                            <p>⚠️ Save your booking reference above</p>
                            <p>Email confirmation was not sent</p>
                          </div>
                      )}
                    </div>

                    <div className="confirmation-actions">
                      <button
                          className="print-btn"
                          onClick={() => window.print()}
                      >
                        📄 Print Confirmation
                      </button>
                      <button
                          className="new-booking-btn"
                          onClick={() => {
                            setShowConfirmation(false);
                            setBookingSuccess(null);
                          }}
                      >
                        Book Another Hotel
                      </button>
                    </div>

                    <div className="confirmation-footer">
                      <p><small>For changes, call +254 700 000 000 or email support@kenyastay.co.ke</small></p>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Footer */}
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>Kenyan Hotel Booking</h4>
                <p>Your gateway to authentic Kenyan hospitality</p>
              </div>
              <div className="footer-section">
                <p><strong>📞 Contact:</strong> +254 700 000 000</p>
                <p><strong>📧 Email:</strong> bookings@kenyanhotels.co.ke</p>
                <p className="currency-note">All prices in Kenyan Shillings (KES)</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>Backend API: http://localhost:8080 | Frontend: http://localhost:3000</p>
              <p>Loaded {hotels.length} hotels from API</p>
            </div>
          </footer>
        </main>
      </div>
  );
}

export default App;