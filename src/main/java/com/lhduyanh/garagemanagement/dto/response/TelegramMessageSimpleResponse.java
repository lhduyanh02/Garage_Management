package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TelegramMessageSimpleResponse {

    String id;

    String title;

    String message;

    LocalDateTime createAt;

    LocalDateTime sendAt;

    UserWithAccountsResponse sender;

    int status;

    Integer receiverQuantity;

}
