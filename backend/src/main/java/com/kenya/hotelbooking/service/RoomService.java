package com.kenya.hotelbooking.service;

import com.cyborg.hotelbooking.entity.Room;
import com.cyborg.hotelbooking.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("ALL")
@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;

    // Dependency Injection through constructor (Exam Concept: Dependency Injection)
    // Spring automatically injects the RoomRepository dependency
    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
    }

    public List<Room> getAvailableRooms(String location, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn != null && checkOut != null) {
            if (checkIn.isAfter(checkOut)) {
                throw new IllegalArgumentException("Check-in date must be before check-out date");
            }
            return roomRepository.findAvailableRooms(location, checkIn, checkOut);
        }
        return roomRepository.findByLocationAndIsAvailableTrue(location);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}