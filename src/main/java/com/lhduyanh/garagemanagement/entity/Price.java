package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "price", indexes = {
        @Index(name = "idx_service_option", columnList = "service_id, option_id")
})
public class Price {
    @EmbeddedId
    PriceId id;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id", nullable = false)
    Service service;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("optionId")
    @JoinColumn(name = "option_id", nullable = false)
    Options options;

    double price;

    @Column(nullable = false)
    int status;

}
