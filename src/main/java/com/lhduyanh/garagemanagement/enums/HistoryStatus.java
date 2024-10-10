package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum HistoryStatus {
    DELETED(-2),
    CANCELED(-1),
    PROCEEDING(0),
    DONE(1),
    ;

    private int code;
}
