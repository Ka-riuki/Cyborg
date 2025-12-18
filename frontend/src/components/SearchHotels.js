// noinspection JSValidateTypes

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { searchRooms } from '../api/api';

function SearchHotels({ cities, onSearch, setSelectedRoom }) {
    const [formData, setFormData] = useState({
        location: 'Nairobi',
        checkInDate: new Date(Date.now() + 86400000), // Tomorrow
        checkOutDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        guests: 1,
        roomType: '',
        maxPrice: 10000
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch initial rooms for Nairobi
    useEffect(() => {
        handleSearch();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxPrice' ? parseFloat(value) || '' : value
        }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        // Validation
        if (formData.checkOutDate <= formData.checkInDate) {
            toast.error('Check-out date must be after check-in date');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const searchParams = {
                location: formData.location,
                checkInDate: formData.checkInDate.toISOString().split('T')[0],
                checkOutDate: formData.checkOutDate.toISOString().split('T')[0],
                guests: formData.guests,
                roomType: formData.roomType || undefined,
                maxPrice: formData.maxPrice || undefined
            };

            const rooms = await searchRooms(searchParams);
            rooms.length = undefined;
            rooms.length = undefined;

            if (rooms.length === 0) {
                toast.info('No rooms found for your search criteria. Try different dates or location.');
            } else {
                toast.success(`Found ${rooms.length} rooms in ${formData.location}`);
            }

            onSearch(rooms, searchParams);
            setSelectedRoom(null);
        } catch (err) {
            setError(err.message || 'Failed to search rooms');
            toast.error('Failed to search rooms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roomTypes = ['', 'SINGLE', 'DOUBLE', 'DELUXE', 'SUITE'];

    return (
        <Card className="mb-4 shadow">
            <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Search Hotels in Kenya</h4>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSearch}>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                >
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Choose a Kenyan city
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Check-in Date</Form.Label>
                                <DatePicker
                                    selected={formData.checkInDate}
                                    onChange={(date) => handleDateChange(date, 'checkInDate')}
                                    className="form-control"
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Check-out Date</Form.Label>
                                <DatePicker
                                    selected={formData.checkOutDate}
                                    onChange={(date) => handleDateChange(date, 'checkOutDate')}
                                    className="form-control"
                                    minDate={formData.checkInDate}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Guests</Form.Label>
                                <Form.Select
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Room Type</Form.Label>
                                <Form.Select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleChange}
                                >
                                    {roomTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type === '' ? 'All Types' : type}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Max Price per Night (KSh)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="maxPrice"
                                    value={formData.maxPrice}
                                    onChange={handleChange}
                                    min="1000"
                                    max="50000"
                                    step="500"
                                />
                                <Form.Text className="text-muted">
                                    Set your budget: {formData.maxPrice.toLocaleString()} KSh
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={8} className="d-flex align-items-end">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                className="w-100"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Searching...
                                    </>
                                ) : (
                                    `Search Hotels in ${formData.location}`
                                )}
                            </Button>
                        </Col>
                    </Row>

                    <div className="mt-3 text-muted small">
                        <i className="fas fa-info-circle me-1"></i>
                        Popular in {formData.location}:
                        {formData.location === 'Nairobi' && ' Business hotels near CBD'}
                        {formData.location === 'Mombasa' && ' Beach resorts & coastal hotels'}
                        {formData.location === 'Nakuru' && ' Lake view lodges'}
                        {formData.location === 'Kisumu' && ' Lake Victoria waterfront hotels'}
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default SearchHotels;