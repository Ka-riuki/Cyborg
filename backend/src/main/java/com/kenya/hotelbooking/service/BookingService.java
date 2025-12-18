package com.kenya.hotelbooking.service;

import com.cyborg.hotelbooking.dto.BookingRequest;
import com.cyborg.hotelbooking.entity.Booking;
import com.cyborg.hotelbooking.entity.Customer;
import com.cyborg.hotelbooking.entity.Room;
import com.cyborg.hotelbooking.repository.BookingRepository;
import com.cyborg.hotelbooking.repository.CustomerRepository;
import com.cyborg.hotelbooking.repository.RoomRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@SuppressWarnings("ALL")
@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final JavaMailSender mailSender;

    // Constructor Dependency Injection
    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          CustomerRepository customerRepository,
                          JavaMailSender mailSender) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.mailSender = mailSender;
    }

    public Booking createBooking(BookingRequest request) {
        // Validate dates
        if (request.getCheckInDate().isAfter(request.getCheckOutDate())) {
            throw new IllegalArgumentException("Check-in date must be before check-out date");
        }

        // Find room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Check if room is available for the given dates
        List<Room> availableRooms = roomRepository.findAvailableRooms(
                room.getLocation(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (availableRooms.stream().noneMatch(r -> r.getId().equals(room.getId()))) {
            throw new RuntimeException("Room is not available for the selected dates");
        }

        // Find or create customer
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setFirstName(request.getFirstName());
                    newCustomer.setLastName(request.getLastName());
                    newCustomer.setEmail(request.getEmail());
                    newCustomer.setPhoneNumber(request.getPhoneNumber());
                    return customerRepository.save(newCustomer);
                });

        // Calculate total price
        long numberOfNights = ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        BigDecimal totalPrice = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(numberOfNights));

        // Create booking
        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setCustomer(customer);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalPrice(totalPrice);

        Booking savedBooking = bookingRepository.save(booking);

        // Send confirmation email
        sendConfirmationEmail(savedBooking);

        return savedBooking;
    }

    private void sendConfirmationEmail(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(booking.getCustomer().getEmail());
        message.setSubject("Booking Confirmation - " + booking.getBookingReference());
        message.setText(
                "Karibu! Your booking has been confirmed.\n\n" +
                        "Booking Details:\n" +
                        "Reference: " + booking.getBookingReference() + "\n" +
                        "Hotel: " + booking.getRoom().getLocation() + "\n" +
                        "Room: " + booking.getRoom().getRoomNumber() + " (" + booking.getRoom().getRoomType() + ")\n" +
                        "Check-in: " + booking.getCheckInDate() + "\n" +
                        "Check-out: " + booking.getCheckOutDate() + "\n" +
                        "Total Price: KES " + booking.getTotalPrice() + "\n\n" +
                        "Thank you for choosing Kenyan Hospitality!\n" +
                        "For inquiries, call: +254 700 000 000"
        );

        try {
            mailSender.send(message);
            booking.setEmailSent(true);
            bookingRepository.save(booking);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByCustomerEmail(email);
    }

    public Booking getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getCheckInDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new RuntimeException("Cannot cancel booking less than 24 hours before check-in");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}