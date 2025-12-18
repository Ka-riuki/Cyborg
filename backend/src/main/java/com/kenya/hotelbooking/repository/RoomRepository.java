package com.kenya.hotelbooking.repository;

import com.cyborg.hotelbooking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("ALL")
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByLocation(String location);

    List<Room> findByLocationAndIsAvailableTrue(String location);

    @Query("SELECT r FROM Room r WHERE r.location = :location " +
            "AND r.isAvailable = true " +
            "AND r.id NOT IN (" +
            "   SELECT b.room.id FROM Booking b " +
            "   WHERE b.status = 'CONFIRMED' " +
            "   AND (b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)" +
            ")")
    List<Room> findAvailableRooms(@Param("location") String location,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);

    List<Room> findByRoomTypeAndIsAvailableTrue(String roomType);
}