package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class PlateType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    String type;

    int status = 1;

    @OneToMany(mappedBy = "plateType")
    List<Car> cars = new ArrayList<>();
}
