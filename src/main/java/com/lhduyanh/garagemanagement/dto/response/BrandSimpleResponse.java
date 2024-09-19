package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class BrandSimpleResponse {
    int id;
    String brand;
}
