-- Test data for Kenyan Hotels Booking System
-- Kenyan context: Using actual Kenyan hotels and locations

-- Insert Kenyan hotel customers
INSERT INTO customers (id, email, full_name, phone_number, national_id, created_at) VALUES
                                                                                        (1, 'james.kamau@example.com', 'James Kamau', '+254712345678', '12345678', CURRENT_TIMESTAMP),
                                                                                        (2, 'wanjiru.muthoni@example.com', 'Wanjiru Muthoni', '+254723456789', '23456789', CURRENT_TIMESTAMP),
                                                                                        (3, 'odhiambo.otieno@example.com', 'Odhiambo Otieno', '+254734567890', '34567890', CURRENT_TIMESTAMP),
                                                                                        (4, 'akinyi.akello@example.com', 'Akinyi Akello', '+254745678901', '45678901', CURRENT_TIMESTAMP);

-- Insert Kenyan hotels and lodges
INSERT INTO rooms (id, room_number, room_type, price_per_night, capacity, amenities, location, is_available, hotel_name) VALUES
                                                                                                                             (1, '101', 'DELUXE', 8500.00, 2, 'WiFi, AC, TV, Mini-bar', 'NAIROBI_CBD', true, 'Sarova Stanley Hotel'),
                                                                                                                             (2, '102', 'SUITE', 12500.00, 4, 'WiFi, AC, TV, Kitchenette, Balcony', 'NAIROBI_CBD', true, 'Sarova Stanley Hotel'),
                                                                                                                             (3, '201', 'STANDARD', 5500.00, 2, 'WiFi, TV, Fan', 'MOMBASA', true, 'Sarova Whitesands Beach Resort'),
                                                                                                                             (4, '202', 'DELUXE', 9500.00, 3, 'WiFi, AC, TV, Sea View', 'MOMBASA', true, 'Sarova Whitesands Beach Resort'),
                                                                                                                             (5, '301', 'STANDARD', 4500.00, 2, 'WiFi, Fan', 'NAKURU', true, 'Lake Nakuru Lodge'),
                                                                                                                             (6, '302', 'DELUXE', 6500.00, 2, 'WiFi, AC, TV, Lake View', 'NAKURU', true, 'Lake Nakuru Lodge'),
                                                                                                                             (7, '401', 'SUITE', 15000.00, 6, 'WiFi, AC, TV, Kitchen, Living Room', 'MAASAI_MARA', true, 'Mara Serena Safari Lodge'),
                                                                                                                             (8, '402', 'DELUXE', 11000.00, 4, 'WiFi, AC, TV, Balcony, Game View', 'MAASAI_MARA', true, 'Mara Serena Safari Lodge'),
                                                                                                                             (9, '501', 'STANDARD', 3500.00, 1, 'WiFi, Fan', 'KISUMU', true, 'Imperial Hotel Kisumu'),
                                                                                                                             (10, '502', 'DELUXE', 6000.00, 2, 'WiFi, AC, TV, Lake View', 'KISUMU', true, 'Imperial Hotel Kisumu');

-- Insert sample bookings
INSERT INTO bookings (id, booking_reference, customer_id, room_id, check_in_date, check_out_date, total_price, booking_status, created_at, email_sent) VALUES
                                                                                                                                                           (1, 'BOOK-KEN-2024-001', 1, 1, DATEADD('DAY', 7, CURRENT_DATE), DATEADD('DAY', 10, CURRENT_DATE), 25500.00, 'CONFIRMED', CURRENT_TIMESTAMP, true),
                                                                                                                                                           (2, 'BOOK-KEN-2024-002', 2, 3, DATEADD('DAY', 14, CURRENT_DATE), DATEADD('DAY', 17, CURRENT_DATE), 16500.00, 'CONFIRMED', CURRENT_TIMESTAMP, true),
                                                                                                                                                           (3, 'BOOK-KEN-2024-003', 3, 7, DATEADD('DAY', 30, CURRENT_DATE), DATEADD('DAY', 35, CURRENT_DATE), 75000.00, 'PENDING', CURRENT_TIMESTAMP, false),
                                                                                                                                                           (4, 'BOOK-KEN-2024-004', 4, 9, DATEADD('DAY', 2, CURRENT_DATE), DATEADD('DAY', 4, CURRENT_DATE), 7000.00, 'CONFIRMED', CURRENT_TIMESTAMP, true);

-- Add more test rooms for availability testing
INSERT INTO rooms (id, room_number, room_type, price_per_night, capacity, amenities, location, is_available, hotel_name) VALUES
                                                                                                                             (11, '103', 'STANDARD', 5000.00, 2, 'WiFi, TV', 'NAIROBI_CBD', true, 'Panari Hotel'),
                                                                                                                             (12, '203', 'SUITE', 18000.00, 4, 'WiFi, AC, TV, Jacuzzi', 'MOMBASA', false, 'Voyager Beach Resort'),
                                                                                                                             (13, '303', 'STANDARD', 4000.00, 2, 'WiFi, Fan', 'NAKURU', true, 'Merica Hotel');