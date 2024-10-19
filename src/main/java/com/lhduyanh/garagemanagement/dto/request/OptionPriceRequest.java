package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OptionPriceRequest {

    @NotBlank(message = "BLANK_OPTION_ID")
    String optionId;

    @Min(value = 0, message = "NEGATIVE_PRICE")
    double price;
}
