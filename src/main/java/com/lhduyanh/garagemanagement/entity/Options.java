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
public class Options {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(length = 100, nullable = false, updatable = false)
    String name;

    @Column(nullable = false)
    int status;

    @OneToMany(mappedBy = "options", fetch = FetchType.EAGER)
    List<Price> prices = new ArrayList<>();
}
