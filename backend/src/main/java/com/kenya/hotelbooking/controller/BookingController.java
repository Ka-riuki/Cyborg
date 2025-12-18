package com.kenya.hotelbooking.controller;

import com.cyborg.hotelbooking.dto.BookingRequest;
import com.cyborg.hotelbooking.entity.Booking;
import com.cyborg.hotelbooking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Booking Management", description = "APIs for managing hotel bookings")
public class BookingController {

    private final BookingService bookingService;

// --Commented out by Inspection START (12/17/2025 7:45 AM):
//    public BookingController(BookingService bookingService) {
//        this.bookingService = bookingService;
//    }
// --Commented out by Inspection STOP (12/17/2025 7:45 AM)

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get bookings by email")
    public ResponseEntity<List<Booking>> getBookingsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Get booking by reference")
    public ResponseEntity<Booking> getBookingByReference(@PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }
}
