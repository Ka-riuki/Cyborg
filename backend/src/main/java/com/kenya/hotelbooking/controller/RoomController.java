package com.kenya.hotelbooking.controller;

import com.cyborg.hotelbooking.dto.RoomSearchRequest;
import com.cyborg.hotelbooking.entity.Room;
import com.cyborg.hotelbooking.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("ALL")
@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Room Management", description = "APIs for managing hotel rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/available")
    @Operation(summary = "Get available rooms")
    public ResponseEntity<List<Room>> getAvailableRooms(
            @RequestParam String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<Room> availableRooms = roomService.getAvailableRooms(location, checkIn, checkOut);
        return ResponseEntity.ok(availableRooms);
    }

    @PostMapping("/search")
    @Operation(summary = "Search rooms with filters")
    public ResponseEntity<List<Room>> searchRooms(@Valid @RequestBody RoomSearchRequest request) {
        // Implementation with filters
        List<Room> rooms = roomService.getAvailableRooms(
                request.getLocation(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        // Apply additional filters
        if (request.getRoomType() != null) {
            rooms = rooms.stream()
                    .filter(room -> room.getRoomType().equalsIgnoreCase(request.getRoomType()))
                    .toList();
        }

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    @Operation(summary = "Get all rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }
}