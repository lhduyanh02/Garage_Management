package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = false, nullable = false, length = 100, columnDefinition = "VARCHAR(100)")
    private String model;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", unique = false, nullable = false)
    private Brand brand;
}
