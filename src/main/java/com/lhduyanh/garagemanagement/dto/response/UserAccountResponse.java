package com.lhduyanh.garagemanagement.dto.response;

import com.lhduyanh.garagemanagement.entity.Address;
import jakarta.persistence.FieldResult;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountResponse {

    String email;
    String name;
    String phone;
    int gender;
    Address address;
    int status;

}
