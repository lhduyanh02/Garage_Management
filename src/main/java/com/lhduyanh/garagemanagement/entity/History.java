package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = true)
    User customer;

    Long odo;

    @Column(name ="service_date", nullable = false)
    LocalDateTime serviceDate;

    String summary;

    String diagnose;

    @Column(nullable = false, name = "total_amount")
    Double totalAmount;

    @Column(nullable = false)
    Float discount;

    @Column(name = "payable_amount", nullable = false)
    Double payableAmount;

    int status;

    @OneToMany(mappedBy = "history", fetch = FetchType.LAZY)
    Set<DetailHistory> details;
}
