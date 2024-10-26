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
public class PreServiceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String title;

    LocalDateTime uploadTime;

    @JoinColumn(name = "history_id", nullable = false)
    String historyId;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    byte[] image;

}
