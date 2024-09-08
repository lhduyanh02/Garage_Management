package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class AccountVerifyResponse {
    boolean result;
}
