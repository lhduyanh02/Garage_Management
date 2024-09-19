package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class ModelResponse {
    int id;
    String model;
    BrandSimpleResponse brand;
}
