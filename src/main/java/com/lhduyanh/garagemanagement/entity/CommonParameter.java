package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommonParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 38)
    String id;

    @Column(name = "param_key", unique = true, nullable = false)
    String key;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    String value;

}
