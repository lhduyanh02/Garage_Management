package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserWithAccountsResponse {
    String id;
    String name;
    String phone;
    int gender;
    int status;
    AddressResponse address;
    Set<RoleSimpleResponse> roles;
    List<AccountSimpleResponse> accounts;
}
