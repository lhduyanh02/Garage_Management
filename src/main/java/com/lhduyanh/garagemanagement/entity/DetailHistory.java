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
public class DetailHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id", nullable = false)
    History history;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    Service service;

    @Column(name = "service_name", nullable = false)
    String serviceName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="option_id", nullable = false)
    Options option;

    @Column(name = "option_name", nullable = false)
    String optionName;

    @Column(nullable = false)
    Double price;

    @Column(nullable = false)
    Float discount;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "final_price", nullable = false)
    Double finalPrice;

}
