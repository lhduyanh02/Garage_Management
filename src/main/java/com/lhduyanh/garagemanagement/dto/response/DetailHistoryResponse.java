package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DetailHistoryResponse {

    String id;
    ServiceSimpleResponse service;
    String serviceName;
    OptionSimpleResponse option;
    String optionName;
    Double price;
    Float discount;
    Integer quantity;
    Double finalPrice;

}
