package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandRequest {
    @NotBlank(message = "BLANK_NAME")
    @Size(max = 50, message = "BRAND_NAME_LENGTH")
    String brand;
}
