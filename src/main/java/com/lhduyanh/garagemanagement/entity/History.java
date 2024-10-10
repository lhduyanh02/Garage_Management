package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "car_id", nullable = false)
    Car car;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "advisor_id", nullable = false)
    User advisor;

    @Column(nullable = false)
    long odo;

    @Column(name ="service_date", nullable = false)
    LocalDateTime serviceDate;

    String summary;

    String diagnose;

    @Column(nullable = false, name = "total_amount")
    double totalAmount;

    @Column(nullable = false)
    float discount;

    @Column(name = "payable_amount", nullable = false)
    double payableAmount;

    int status;
}
