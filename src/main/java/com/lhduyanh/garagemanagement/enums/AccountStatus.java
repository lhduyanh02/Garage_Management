package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AccountStatus {
    NOT_CONFIRM(0),
    CONFIRMED(1),
    BLOCKED(-1),
    ;

    private int code;
}
