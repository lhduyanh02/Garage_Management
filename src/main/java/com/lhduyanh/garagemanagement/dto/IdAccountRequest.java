package com.lhduyanh.garagemanagement.dto;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IdAccountRequest {
    @NotNull
    @NotBlank
    private String id;
}
