package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class ImageUploadRequest {

    @Size(max = 255, message = "IMAGE_TITLE_LENGTH")
    String title;

    @NotNull(message = "NULL_IMAGE")
    byte[] image;

}
