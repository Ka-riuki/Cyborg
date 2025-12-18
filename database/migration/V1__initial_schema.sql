-- Initial database schema for Kenyan Hotels Booking System
-- Using Kenyan context in naming and data types

CREATE TABLE IF NOT EXISTS customers (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    national_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS rooms (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     room_number VARCHAR(10) NOT NULL,
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE') NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    amenities TEXT,
    location ENUM('NAIROBI_CBD', 'MOMBASA', 'NAKURU', 'MAASAI_MARA', 'KISUMU', 'ELDORET', 'THIKA') NOT NULL,
    is_available BOOLEAN DEFAULT true,
    hotel_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS bookings (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,

    -- Business logic constraints
    CONSTRAINT chk_dates CHECK (check_in_date < check_out_date),
    CONSTRAINT chk_positive_price CHECK (total_price > 0)
    );

-- Indexes for performance optimization (Kenyan hotels context: frequent searches by location and dates)
CREATE INDEX idx_rooms_location ON rooms(location);
CREATE INDEX idx_rooms_availability ON rooms(location, is_available);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Insert initial Kenyan hotel data
INSERT INTO rooms (room_number, room_type, price_per_night, capacity, amenities, location, is_available, hotel_name) VALUES
                                                                                                                         ('101', 'DELUXE', 8500.00, 2, 'WiFi, AC, TV, Mini-bar', 'NAIROBI_CBD', true, 'Sarova Stanley Hotel'),
                                                                                                                         ('102', 'SUITE', 12500.00, 4, 'WiFi, AC, TV, Kitchenette, Balcony', 'NAIROBI_CBD', true, 'Sarova Stanley Hotel'),
                                                                                                                         ('201', 'STANDARD', 5500.00, 2, 'WiFi, TV, Fan', 'MOMBASA', true, 'Sarova Whitesands Beach Resort'),
                                                                                                                         ('301', 'STANDARD', 4500.00, 2, 'WiFi, Fan', 'NAKURU', true, 'Lake Nakuru Lodge');