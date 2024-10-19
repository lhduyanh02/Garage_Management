package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ServiceStatus {
    DELETED(-1),
    NOT_USE(0),
    USING(1),
    ;

    private int code;
}
