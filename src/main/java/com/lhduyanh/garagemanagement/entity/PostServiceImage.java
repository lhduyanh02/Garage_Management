package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostServiceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 38)
    String id;

    String title;

    LocalDateTime uploadTime;

    @JoinColumn(name = "history_id", nullable = false)
    String historyId;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    byte[] image;

}
