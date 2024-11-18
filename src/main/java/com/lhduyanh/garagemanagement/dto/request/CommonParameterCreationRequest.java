package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommonParameterCreationRequest {

    @NotNull
    @NotBlank
    String key;

    @NotNull
    @NotBlank
    String description;

    @NotNull(message = "BLANK_VALUE")
    @NotBlank(message = "BLANK_VALUE")
    String value;

}
