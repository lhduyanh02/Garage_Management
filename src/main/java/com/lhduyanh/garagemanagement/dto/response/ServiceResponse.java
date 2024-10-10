package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceResponse {

    String id;
    String name;
    String description;
    int status;

    List<OptionPriceResponse> optionPrices;

}
