// noinspection JSCheckFunctionSignatures,JSValidateTypes

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBooking } from '../api/api';

function BookingForm() {
    const location = useLocation();
    const navigate = useNavigate();


    const [room, setRoom] = useState(null);
    room.pricePerNight = undefined;
    room.roomNumber = undefined;
    room.pricePerNight = undefined;
    const [searchParams, setSearchParams] = useState({});
    const [loading, setLoading] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingReference, setBookingReference] = useState('');

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '+254',
        customerIdNumber: '',
        numberOfGuests: 1,
        specialRequests: ''
    });

    // Initialize from location state or fetch room data
    useEffect(() => {
        if (location.state?.room && location.state?.searchParams) {
            setRoom(location.state.room);
            setSearchParams(location.state.searchParams);
            setFormData(prev => ({
                ...prev,
                numberOfGuests: location.state.searchParams.guests || 1
            }));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Ensure phone starts with +254
        if (!value.startsWith('+254') && value.length > 0) {
            value = '+254' + value.replace(/^\+254/, '');
        }
        setFormData(prev => ({ ...prev, customerPhone: value }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.customerName.trim()) errors.push('Name is required');
        if (!formData.customerEmail.includes('@')) errors.push('Valid email is required');
        if (!formData.customerPhone.match(/^\+254[0-9]{9}$/)) errors.push('Valid Kenyan phone (+254XXXXXXXXX) required');
        if (!formData.customerIdNumber) errors.push('ID number is required');

        return errors;
    };

    const calculateTotalPrice = () => {
        if (!room || !searchParams.checkInDate || !searchParams.checkOutDate) return 0;

        const nights = Math.round(
            (new Date(searchParams.checkOutDate) - new Date(searchParams.checkInDate)) / (1000 * 60 * 60 * 24)
        );
        return room.pricePerNight * nights;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        if (!room) {
            toast.error('Room information is missing');
            return;
        }

        setLoading(true);

        const bookingData = {
            roomId: room.id,
            checkInDate: searchParams.checkInDate,
            checkOutDate: searchParams.checkOutDate,
            numberOfGuests: formData.numberOfGuests,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            customerIdNumber: formData.customerIdNumber,
            specialRequests: formData.specialRequests
        };

        try {
            const response = await createBooking(bookingData);
            response.bookingReference = undefined;

            toast.success('Booking confirmed! Check your email for confirmation.');
            setBookingComplete(true);
            setBookingReference(response.bookingReference || 'KBH-' + Date.now());

            // Reset form after successful booking
            setTimeout(() => {
                navigate('/my-bookings');
            }, 5000);
        } catch (error) {
            toast.error(error.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!room) {
        return (
            <Alert variant="warning" className="text-center">
                <h4>No room selected</h4>
                <p>Please go back and select a room to book.</p>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Back to Search
                </Button>
            </Alert>
        );
    }

    const totalPrice = calculateTotalPrice();

    return (
        <Card className="shadow">
            <Card.Header className="bg-success text-white">
                <h4 className="mb-0">Complete Your Booking</h4>
            </Card.Header>

            <Card.Body>
                {bookingComplete ? (
                    <Alert variant="success" className="text-center">
                        <h4>🎉 Booking Confirmed!</h4>
                        <p className="lead">Thank you for booking with Kenya Hotel Booking</p>
                        <Alert variant="light">
                            <h5>Booking Reference: <strong>{bookingReference}</strong></h5>
                            <p className="mb-0">
                                A confirmation email has been sent to {formData.customerEmail}
                            </p>
                        </Alert>
                        <p className="mt-3">
                            You will be redirected to your bookings page shortly...
                        </p>
                        <Spinner animation="border" variant="success" className="me-2" />
                        <span>Processing</span>
                    </Alert>
                ) : (
                    <>
                        {/* Booking Summary */}
                        <Card className="mb-4 border-primary">
                            <Card.Body>
                                <Row>
                                    <Col md={8}>
                                        <h5>{room.roomType} Room - {room.roomNumber}</h5>
                                        <p className="mb-1"><strong>Location:</strong> {room.location}</p>
                                        <p className="mb-1"><strong>Dates:</strong> {searchParams.checkInDate} to {searchParams.checkOutDate}</p>
                                        <p className="mb-1"><strong>Guests:</strong> {formData.numberOfGuests}</p>
                                        {formData.specialRequests && (
                                            <p className="mb-0"><strong>Special Requests:</strong> {formData.specialRequests}</p>
                                        )}
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <h4 className="text-primary">
                                            KSh {totalPrice.toLocaleString()}
                                        </h4>
                                        <p className="text-muted small">
                                            {room.pricePerNight.toLocaleString()} x {
                                            Math.round((new Date(searchParams.checkOutDate) - new Date(searchParams.checkInDate)) / (1000 * 60 * 60 * 24))
                                        } nights
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Booking Form */}
                        <Form onSubmit={handleSubmit}>
                            <h5 className="mb-3">Guest Information</h5>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Kenyan Phone Number *</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handlePhoneChange}
                                            placeholder="+254700000000"
                                            pattern="^\+254[0-9]{9}$"
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Format: +254 followed by 9 digits
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Kenyan ID Number *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="customerIdNumber"
                                            value={formData.customerIdNumber}
                                            onChange={handleChange}
                                            placeholder="Enter your ID number"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Number of Guests</Form.Label>
                                        <Form.Select
                                            name="numberOfGuests"
                                            value={formData.numberOfGuests}
                                            onChange={handleChange}
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nationality</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value="Kenyan"
                                            readOnly
                                            className="bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Special Requests</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    placeholder="Any special requirements? (e.g., dietary needs, room preferences)"
                                />
                            </Form.Group>

                            <div className="border-top pt-3 mt-3">
                                <h5>Payment Information</h5>
                                <Alert variant="info">
                                    <p className="mb-0">
                                        <strong>Payment Instructions:</strong><br />
                                        • No payment required now. Pay at the hotel upon arrival.<br />
                                        • Accepted: M-Pesa, Cash (KSh), Visa, MasterCard<br />
                                        • Check-in time: 2:00 PM | Check-out time: 11:00 AM
                                    </p>
                                </Alert>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    variant="success"
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Processing Booking...
                                        </>
                                    ) : (
                                        `Confirm Booking - KSh ${totalPrice.toLocaleString()}`
                                    )}
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate('/')}
                                >
                                    Cancel and Go Back
                                </Button>
                            </div>

                            <p className="text-muted small mt-3 text-center">
                                By completing this booking, you agree to our Terms & Conditions.
                                Your booking confirmation will be sent via email.
                            </p>
                        </Form>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default BookingForm;