package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Getter
public enum FunctionStatus {
    DELETED(-1),
    NOT_USE(0),
    USING(1),
    ;

    private int code;
}
