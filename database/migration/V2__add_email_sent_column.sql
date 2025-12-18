-- Migration to add email tracking for Kenyan hotel booking confirmations
-- This supports the "Send confirmation email" requirement

ALTER TABLE bookings
    ADD COLUMN email_sent BOOLEAN DEFAULT false,
ADD COLUMN email_sent_at TIMESTAMP NULL,
ADD COLUMN email_status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING';

-- Add comment explaining the business requirement (Kenyan context)
-- COMMENT ON COLUMN bookings.email_sent IS 'Tracks if confirmation email was sent to customer (Kenyan legal requirement for hotel bookings)';

-- Create index for email processing
CREATE INDEX idx_bookings_email_status ON bookings(email_status, created_at);

-- Update existing bookings to mark emails as sent (for data consistency)
UPDATE bookings SET email_sent = true, email_status = 'SENT' WHERE booking_status = 'CONFIRMED';