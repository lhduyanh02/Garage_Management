package com.lhduyanh.garagemanagement.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotifyToManyUsersRequest {

    List<Long> userIds;

    String message;

}
