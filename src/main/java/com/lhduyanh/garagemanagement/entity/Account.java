package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true, columnDefinition = "VARCHAR(10)", length = 10)
    private String otpCode;

    @Column(nullable = true)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private int status = 0;
}