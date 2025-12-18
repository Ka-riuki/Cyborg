-- MySQL Production Database Setup
-- Run this script in MySQL to set up the production database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_db;

-- Create users table (if implementing authentication)
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
    );

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night >= 0),
    location VARCHAR(100) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    capacity INT DEFAULT 1 CHECK (capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_room_type (room_type),
    INDEX idx_availability (is_available),
    INDEX idx_price (price_per_night)
    );

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
                                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                         first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    id_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_name (last_name, first_name)
    );

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        room_id BIGINT NOT NULL,
                                        customer_id BIGINT NOT NULL,
                                        check_in_date DATE NOT NULL,
                                        check_out_date DATE NOT NULL,
                                        total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    booking_reference VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING') DEFAULT 'CONFIRMED',
    special_requests TEXT,
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_status (status),
    INDEX idx_dates (check_in_date, check_out_date),
    INDEX idx_customer (customer_id),
    INDEX idx_room (room_id),
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
    );

-- Create room_amenities table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS room_amenities (
                                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                              room_id BIGINT NOT NULL,
                                              amenity VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY uk_room_amenity (room_id, amenity),
    INDEX idx_amenity (amenity)
    );

-- Create payments table (optional extension)
CREATE TABLE IF NOT EXISTS payments (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        booking_id BIGINT NOT NULL,
                                        amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_booking (booking_id)
    );

-- Create audit_log table (optional for tracking changes)
CREATE TABLE IF NOT EXISTS audit_log (
                                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                         table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at)
    );

-- Insert sample data
INSERT INTO rooms (room_number, room_type, price_per_night, location, description, capacity, is_available) VALUES
                                                                                                               ('NAI-101', 'DELUXE', 12000.00, 'Nairobi', 'Luxury room with panoramic city view', 2, TRUE),
                                                                                                               ('NAI-102', 'STANDARD', 7500.00, 'Nairobi', 'Comfortable room with all basic amenities', 2, TRUE),
                                                                                                               ('NAI-201', 'SUITE', 25000.00, 'Nairobi', 'Executive suite with separate living area', 4, TRUE),
                                                                                                               ('MOM-101', 'DELUXE', 15000.00, 'Mombasa', 'Beachfront room with ocean view', 2, TRUE),
                                                                                                               ('MOM-102', 'FAMILY', 18000.00, 'Mombasa', 'Spacious room for families', 4, TRUE),
                                                                                                               ('KIS-101', 'STANDARD', 6000.00, 'Kisumu', 'Lakeside room with beautiful sunset views', 2, TRUE),
                                                                                                               ('NAK-101', 'EXECUTIVE', 20000.00, 'Nakuru', 'Premium room near Lake Nakuru National Park', 2, TRUE);

-- Insert amenities for rooms
INSERT INTO room_amenities (room_id, amenity) VALUES
                                                  (1, 'WiFi'), (1, 'TV'), (1, 'Air Conditioning'), (1, 'Mini Bar'), (1, 'Balcony'),
                                                  (2, 'WiFi'), (2, 'TV'), (2, 'Fan'),
                                                  (3, 'WiFi'), (3, 'TV'), (3, 'Air Conditioning'), (3, 'Kitchenette'), (3, 'Jacuzzi'),
                                                  (4, 'WiFi'), (4, 'TV'), (4, 'Air Conditioning'), (4, 'Sea View'), (4, 'Balcony'),
                                                  (5, 'WiFi'), (5, 'TV'), (5, 'Air Conditioning'), (5, 'Connecting Rooms'),
                                                  (6, 'WiFi'), (6, 'TV'), (6, 'Fan'), (6, 'Lake View'),
                                                  (7, 'WiFi'), (7, 'TV'), (7, 'Air Conditioning'), (7, 'Mini Bar'), (7, 'Park View');

-- Insert sample customer
INSERT INTO customers (first_name, last_name, email, phone_number, id_number, city) VALUES
                                                                                        ('John', 'Kamau', 'john.kamau@example.com', '+254712345678', '12345678', 'Nairobi'),
                                                                                        ('Mary', 'Wanjiku', 'mary.wanjiku@example.com', '+254723456789', '23456789', 'Mombasa');

-- Insert sample booking
INSERT INTO bookings (room_id, customer_id, check_in_date, check_out_date, total_price, booking_reference, status, email_sent) VALUES
    (1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 36000.00, 'KEN-HTL-20231215-1234', 'CONFIRMED', TRUE);

-- Create views for reporting
CREATE VIEW available_rooms_view AS
SELECT
    r.*,
    GROUP_CONCAT(ra.amenity ORDER BY ra.amenity SEPARATOR ', ') as amenities_list
FROM rooms r
         LEFT JOIN room_amenities ra ON r.id = ra.room_id
WHERE r.is_available = TRUE
GROUP BY r.id;

CREATE VIEW booking_details_view AS
SELECT
    b.*,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    c.email as customer_email,
    c.phone_number as customer_phone,
    r.room_number,
    r.room_type,
    r.location,
    r.price_per_night
FROM bookings b
         JOIN customers c ON b.customer_id = c.id
         JOIN rooms r ON b.room_id = r.id;

-- Create stored procedure for checking availability
DELIMITER //
CREATE PROCEDURE CheckRoomAvailability(
    IN p_location VARCHAR(100),
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_room_type VARCHAR(50)
)
BEGIN
SELECT
    r.*,
    GROUP_CONCAT(ra.amenity ORDER BY ra.amenity SEPARATOR ', ') as amenities
FROM rooms r
         LEFT JOIN room_amenities ra ON r.id = ra.room_id
WHERE r.location = p_location
  AND r.is_available = TRUE
  AND (p_room_type IS NULL OR r.room_type = p_room_type)
  AND r.id NOT IN (
    SELECT b.room_id
    FROM bookings b
    WHERE b.status = 'CONFIRMED'
      AND b.check_in_date < p_check_out
      AND b.check_out_date > p_check_in
)
GROUP BY r.id;
END //
DELIMITER ;

-- Create trigger for updating room availability
DELIMITER //
CREATE TRIGGER UpdateRoomAvailabilityAfterBooking
    AFTER INSERT ON bookings
    FOR EACH ROW
BEGIN
    UPDATE rooms
    SET is_available = FALSE
    WHERE id = NEW.room_id;
END //
DELIMITER ;

-- Create trigger for updating room availability after cancellation
DELIMITER //
CREATE TRIGGER UpdateRoomAvailabilityAfterCancellation
    AFTER UPDATE ON bookings
    FOR EACH ROW
BEGIN
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
    UPDATE rooms
    SET is_available = TRUE
    WHERE id = NEW.room_id;
END IF;
END //
DELIMITER ;

-- Create user for application with limited privileges
CREATE USER IF NOT EXISTS 'hotel_app'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_db.* TO 'hotel_app'@'localhost';
FLUSH PRIVILEGES;