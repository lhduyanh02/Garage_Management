package com.lhduyanh.garagemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class GarageManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(GarageManagementApplication.class, args);
    }

}
