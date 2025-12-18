package com.kenya.hotelbooking.init;

import com.cyborg.hotelbooking.entity.Room;
import com.cyborg.hotelbooking.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(RoomRepository roomRepository) {
        return args -> {
            // Kenyan hotels data
            Room room1 = new Room();
            room1.setRoomNumber("101");
            room1.setRoomType("DELUXE");
            room1.setPricePerNight(new BigDecimal("12000.00"));
            room1.setLocation("Nairobi");
            room1.setDescription("Luxury room with city view");
            room1.setAmenities(Arrays.asList("WiFi", "TV", "AC", "Mini-bar", "Balcony"));
            room1.setCapacity(2);
            room1.setAvailable(true);

            Room room2 = new Room();
            room2.setRoomNumber("102");
            room2.setRoomType("STANDARD");
            room2.setPricePerNight(new BigDecimal("7500.00"));
            room2.setLocation("Mombasa");
            room2.setDescription("Beach view room");
            room2.setAmenities(Arrays.asList("WiFi", "TV", "AC", "Sea View"));
            room2.setCapacity(2);
            room2.setAvailable(true);

            Room room3 = new Room();
            room3.setRoomNumber("201");
            room3.setRoomType("SUITE");
            room3.setPricePerNight(new BigDecimal("25000.00"));
            room3.setLocation("Nairobi");
            room3.setDescription("Executive suite with living area");
            room3.setAmenities(Arrays.asList("WiFi", "TV", "AC", "Kitchen", "Jacuzzi", "Living Room"));
            room3.setCapacity(4);
            room3.setAvailable(true);

            Room room4 = new Room();
            room4.setRoomNumber("103");
            room4.setRoomType("SINGLE");
            room4.setPricePerNight(new BigDecimal("4500.00"));
            room4.setLocation("Kisumu");
            room4.setDescription("Single room with lake view");
            room4.setAmenities(Arrays.asList("WiFi", "TV", "Fan"));
            room4.setCapacity(1);
            room4.setAvailable(true);

            Room room5 = new Room();
            room5.setRoomNumber("104");
            room5.setRoomType("DOUBLE");
            room5.setPricePerNight(new BigDecimal("8500.00"));
            room5.setLocation("Nakuru");
            room5.setDescription("Double room near national park");
            room5.setAmenities(Arrays.asList("WiFi", "TV", "AC", "Park View"));
            room5.setCapacity(2);
            room5.setAvailable(true);

            roomRepository.saveAll(Arrays.asList(room1, room2, room3, room4, room5));
        };
    }
}
