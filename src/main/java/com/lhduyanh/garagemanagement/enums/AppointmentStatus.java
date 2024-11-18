package com.lhduyanh.garagemanagement.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AppointmentStatus {
    DELETED(-1),
    PENDING_CONFIRM(0),
    UPCOMING(1),
    COMPLETED(2),
    MISSED(3),
    CANCELLED(4),
    ;

    private int code;
}
