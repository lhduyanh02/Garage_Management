package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false, length = 50)
    String numPlate;

    @Column(nullable = true, length = 200)
    String color;

    @Column(nullable = true, length = 1000)
    String carDetail;

    @Column(nullable = false)
    LocalDateTime createAt;

    @Column(nullable = false)
    int status;

    @ManyToOne
    @JoinColumn(nullable = false, name = "plate_type")
    PlateType plateType;

    @ManyToOne
    @JoinColumn(nullable = false, name = "model")
    Model model;
}