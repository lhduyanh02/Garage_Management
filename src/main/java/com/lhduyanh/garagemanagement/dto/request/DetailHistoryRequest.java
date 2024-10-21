package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.validator.constraints.Range;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DetailHistoryRequest {

    @NotBlank(message = "BLANK_SERVICE")
    String serviceId;

    @NotBlank(message = "BLANK_OPTION")
    String optionId;

    @Range(min = 0, max = 100, message = "DISCOUNT_RANGE")
    Float discount;

    @Min(value = 1, message = "QUANTITY_RANGE")
    Integer quantity;

}
