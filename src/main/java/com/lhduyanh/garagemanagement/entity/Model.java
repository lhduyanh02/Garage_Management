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
@NoArgsConstructor
@AllArgsConstructor
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(unique = false, nullable = false, length = 100, columnDefinition = "VARCHAR(100)")
    String model;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id", unique = false, nullable = false)
    Brand brand;

    @OneToMany(mappedBy = "model")
    List<Car> cars = new ArrayList<>();
}
