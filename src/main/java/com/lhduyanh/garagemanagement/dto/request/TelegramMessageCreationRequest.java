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
public class TelegramMessageCreationRequest {

    @NotNull(message = "BLANK_TITLE")
    @NotBlank(message = "BLANK_TITLE")
    String title;

    @NotNull(message = "BLANK_CONTENT")
    @NotBlank(message = "BLANK_CONTENT")
    String message;

    List<String> receivers;

}
