package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Entity
public class Functions {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 38)
    String id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    int status = 1;

    @OneToMany(mappedBy = "function")
    List<Permissions> permissions = new ArrayList<>();
}
