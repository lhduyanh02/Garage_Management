package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TelegramMessageStatus {
    DRAFT(0),
    SENT(1),
    DELETED(-1),
    ;

    private int code;
}
