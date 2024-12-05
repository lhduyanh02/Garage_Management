package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class TelegramMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 38)
    String id;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    String message;

    @Column(nullable = false)
    LocalDateTime createAt;

    LocalDateTime sendAt;

    int status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    User sender;

    @ManyToMany(fetch = FetchType.LAZY)
    Set<User> receivers = new HashSet<>();

}
