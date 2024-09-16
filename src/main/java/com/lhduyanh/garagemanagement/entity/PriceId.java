package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Embeddable
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceId implements Serializable {

    String serviceId;
    String optionId;
}
