// noinspection JSCheckFunctionSignatures,JSValidateTypes

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getCustomerBookings, cancelBooking } from '../api/api';

booking.room?.roomNumber = undefined;

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    bookingToCancel.bookingReference = undefined;

    useEffect(() => {
        // Try to get email from localStorage or prompt
        const savedEmail = localStorage.getItem('bookingEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            fetchBookings(savedEmail);
        }
    }, []);

    const fetchBookings = async (customerEmail) => {
        setLoading(true);
        try {
            const data = await getCustomerBookings(customerEmail);
            setBookings(data);
            localStorage.setItem('bookingEmail', customerEmail);
        } catch (error) {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }
        fetchBookings(email);
    };

    const handleCancelBooking = (booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
    };

    const confirmCancelBooking = async () => {
        if (!bookingToCancel) return;

        try {
            await cancelBooking(bookingToCancel.id);
            toast.success('Booking cancelled successfully');

            // Refresh bookings
            fetchBookings(email);
            setShowCancelModal(false);
            setBookingToCancel(null);
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'CONFIRMED': 'success',
            'PENDING': 'warning',
            'CANCELLED': 'danger',
            'COMPLETED': 'info'
        };
        return variants[status] || 'secondary';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading your bookings...</p>
            </div>
        );
    }

    return (
        <Card className="shadow">
            <Card.Header className="bg-dark text-white">
                <h4 className="mb-0">My Bookings</h4>
            </Card.Header>

            <Card.Body>
                {/* Search Form */}
                {!email && bookings.length === 0 && (
                    <Alert variant="info" className="mb-4">
                        <h5>Find Your Bookings</h5>
                        <p>Enter the email you used for booking to view your reservations.</p>
                    </Alert>
                )}

                <form onSubmit={handleSearch} className="mb-4">
                    <div className="input-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button variant="primary" type="submit">
                            Search Bookings
                        </Button>
                    </div>
                    <small className="text-muted">
                        Example: bookings will be sent to this email after confirmation
                    </small>
                </form>

                {/* Bookings Table */}
                {bookings.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        <h5>No bookings found</h5>
                        <p className="mb-0">
                            {email ? `No bookings found for ${email}` : 'Enter your email to search for bookings'}
                        </p>
                    </Alert>
                ) : (
                    <>
                        <Alert variant="success">
                            Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for {email}
                        </Alert>

                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                <tr>
                                    <th>Booking Ref</th>
                                    <th>Hotel & Room</th>
                                    <th>Dates</th>
                                    <th>Guests</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>
                                            <strong>{booking.bookingReference}</strong>
                                            <div className="small text-muted">
                                                {formatDate(booking.bookingDate)}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{booking.room?.location} Hotel</strong>
                                                <div className="small">
                                                    Room {booking.room?.roomNumber} ({booking.room?.roomType})
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                {formatDate(booking.checkInDate)}
                                                <div className="small">to</div>
                                                {formatDate(booking.checkOutDate)}
                                            </div>
                                        </td>
                                        <td>
                                            {booking.numberOfGuests}
                                            <div className="small">guest{booking.numberOfGuests !== 1 ? 's' : ''}</div>
                                        </td>
                                        <td>
                                            <strong>KSh {booking.totalPrice?.toLocaleString()}</strong>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                            {booking.confirmationEmailSent && (
                                                <div className="small text-muted mt-1">
                                                    ✓ Email sent
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {booking.status === 'CONFIRMED' && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            {booking.status === 'CANCELLED' && (
                                                <span className="text-muted small">Cancelled</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>

                        <div className="mt-4 p-3 border rounded bg-light">
                            <h5>Need Help?</h5>
                            <p className="mb-0">
                                Contact Kenya Hotel Booking Support:<br />
                                📞 +254 700 123 456 | ✉️ support@kenyahotel.co.ke
                            </p>
                        </div>
                    </>
                )}
            </Card.Body>

            {/* Cancel Confirmation Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {bookingToCancel && (
                        <>
                            <p>Are you sure you want to cancel this booking?</p>
                            <div className="p-3 border rounded">
                                <p className="mb-1">
                                    <strong>Reference:</strong> {bookingToCancel.bookingReference}
                                </p>
                                <p className="mb-1">
                                    <strong>Hotel:</strong> {bookingToCancel.room?.location} Hotel
                                </p>
                                <p className="mb-0">
                                    <strong>Dates:</strong> {formatDate(bookingToCancel.checkInDate)} to {formatDate(bookingToCancel.checkOutDate)}
                                </p>
                            </div>
                            <Alert variant="warning" className="mt-3">
                                <strong>Note:</strong> Cancellation is free if done at least 24 hours before check-in.
                            </Alert>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Keep Booking
                    </Button>
                    <Button variant="danger" onClick={confirmCancelBooking}>
                        Confirm Cancellation
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}

export default MyBookings;