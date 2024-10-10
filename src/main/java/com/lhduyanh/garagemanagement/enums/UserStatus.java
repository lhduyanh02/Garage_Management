package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Getter
@NoArgsConstructor
public enum UserStatus {
    DELETED(-2),
    NOT_CONFIRM(0),
    CONFIRMED(1),
    BLOCKED(-1),
    ;

    private int code;
}
