package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true, columnDefinition = "VARCHAR(10)", length = 10)
    private String otpCode;

    @Column(nullable = true)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private int status = 0;
}