// noinspection JSValidateTypes

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { checkAvailability } from '../api/api';
import { toast } from 'react-toastify';

function RoomList({ rooms, onSelectRoom, searchParams }) {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedForBooking, setSelectedForBooking] = useState(null);
    selectedForBooking.roomNumber = undefined;
    selectedForBooking.pricePerNight = undefined;

    // Check availability for each room
    useEffect(() => {
        if (rooms.length > 0 && searchParams.checkInDate && searchParams.checkOutDate) {
            rooms.forEach(room => {
                checkRoomAvailability(room.id);
            });
        }
    }, [rooms, searchParams]);

    const checkRoomAvailability = async (roomId) => {
        setLoading(prev => ({ ...prev, [roomId]: true }));
        try {
            const isAvailable = await checkAvailability(
                roomId,
                searchParams.checkInDate,
                searchParams.checkOutDate
            );
            setAvailability(prev => ({ ...prev, [roomId]: isAvailable }));
        } catch (error) {
            console.error('Error checking availability:', error);
            setAvailability(prev => ({ ...prev, [roomId]: false }));
        } finally {
            setLoading(prev => ({ ...prev, [roomId]: false }));
        }
    };

    const handleBookNow = (room) => {
        if (!availability[room.id]) {
            toast.error('This room is no longer available for the selected dates');
            return;
        }
        onSelectRoom(room);
        setSelectedForBooking(room);
        setShowModal(true);
    };

    const confirmBooking = () => {
        if (selectedForBooking) {
            navigate(`/book/${selectedForBooking.id}`, {
                state: {
                    room: selectedForBooking,
                    searchParams: searchParams
                }
            });
        }
    };

    const getRoomImage = (roomType) => {
        const images = {
            'DELUXE': '/room-deluxe.jpg',
            'SUITE': '/room-suite.jpg',
            'STANDARD': '/room-standard.jpg',
            'SINGLE': '/room-single.jpg',
            'DOUBLE': '/room-standard.jpg'
        };
        return images[roomType] || '/room-standard.jpg';
    };

    const getRoomBadge = (roomType) => {
        const badges = {
            'DELUXE': 'warning',
            'SUITE': 'danger',
            'STANDARD': 'primary',
            'SINGLE': 'info',
            'DOUBLE': 'success'
        };
        return badges[roomType] || 'secondary';
    };

    if (rooms.length === 0) {
        return (
            <Alert variant="info">
                <h4 className="text-center">No rooms found</h4>
                <p className="text-center">
                    Try adjusting your search criteria or select a different location.
                </p>
            </Alert>
        );
    }

    return (
        <>
            <h3 className="mb-4">
                Available Rooms in {searchParams.location}
                <Badge bg="secondary" className="ms-2">{rooms.length} rooms</Badge>
            </h3>

            <Row>
                {rooms.map(room => (
                    <Col key={room.id} lg={6} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Row className="g-0">
                                <Col md={5}>
                                    <Card.Img
                                        variant="top"
                                        src={getRoomImage(room.roomType)}
                                        alt={room.roomType}
                                        className="h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </Col>
                                <Col md={7}>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <Card.Title>
                                                    {room.roomType} Room
                                                    <Badge bg={getRoomBadge(room.roomType)} className="ms-2">
                                                        {room.roomType}
                                                    </Badge>
                                                </Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">
                                                    Room {room.roomNumber} • {room.location}
                                                </Card.Subtitle>
                                            </div>
                                            <h4 className="text-primary">
                                                KSh {room.pricePerNight.toLocaleString()}
                                                <small className="text-muted d-block">per night</small>
                                            </h4>
                                        </div>

                                        <Card.Text className="small">
                                            {room.description}
                                        </Card.Text>

                                        <div className="mb-3">
                                            <strong>Amenities:</strong>
                                            <div className="mt-1">
                                                {room.hasWifi && <Badge bg="light" text="dark" className="me-1">WiFi</Badge>}
                                                {room.hasAirConditioning && <Badge bg="light" text="dark" className="me-1">AC</Badge>}
                                                {room.hasBreakfast && <Badge bg="light" text="dark" className="me-1">Breakfast</Badge>}
                                                {room.amenities && room.amenities.split(',').map((amenity, idx) => (
                                                    <Badge key={idx} bg="light" text="dark" className="me-1">
                                                        {amenity.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <Badge bg="info" className="me-2">
                                                    Max {room.maxOccupancy} guests
                                                </Badge>
                                                <div className="mt-1">
                                                    {loading[room.id] ? (
                                                        <small className="text-muted">Checking availability...</small>
                                                    ) : availability[room.id] ? (
                                                        <Badge bg="success">Available</Badge>
                                                    ) : (
                                                        <Badge bg="danger">Not Available</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleBookNow(room)}
                                                disabled={!availability[room.id] || loading[room.id]}
                                            >
                                                {loading[room.id] ? (
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                ) : null}
                                                Book Now
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedForBooking && (
                        <>
                            <p>You are about to book:</p>
                            <div className="p-3 border rounded mb-3">
                                <h5>{selectedForBooking.roomType} Room - {selectedForBooking.roomNumber}</h5>
                                <p className="mb-1"><strong>Location:</strong> {selectedForBooking.location}</p>
                                <p className="mb-1"><strong>Price per night:</strong> KSh {selectedForBooking.pricePerNight.toLocaleString()}</p>
                                <p className="mb-1"><strong>Dates:</strong> {searchParams.checkInDate} to {searchParams.checkOutDate}</p>
                                <p className="mb-0"><strong>Total Nights:</strong> {
                                    Math.round((new Date(searchParams.checkOutDate) - new Date(searchParams.checkInDate)) / (1000 * 60 * 60 * 24))
                                } nights</p>
                            </div>
                            <p className="text-muted small">
                                You will be redirected to the booking form to complete your reservation.
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmBooking}>
                        Continue to Booking
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RoomList;