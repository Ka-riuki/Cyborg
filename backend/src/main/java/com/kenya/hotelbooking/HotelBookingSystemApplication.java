package com.kenya.hotelbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
class HotelBookingApplication {
	public static void main(String[] args) {
		SpringApplication.run(HotelBookingApplication.class, args);
	}
}