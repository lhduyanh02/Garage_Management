package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceUpdateRequest {

    @NotBlank(message = "BLANK_NAME")
    String name;
    String description;
    int status;

    @NotNull(message = "NULL_OPTION")
    List<OptionPriceRequest> listOptionPrices;
}
