package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum PlateTypeStatus {
    DELETED(-1),
    NOT_USE(0),
    USING(1),
    ;

    private int code;
}
