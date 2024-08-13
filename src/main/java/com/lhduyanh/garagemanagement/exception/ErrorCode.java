package com.lhduyanh.garagemanagement.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_EXISTED(1001, "User already existed"),
    ACCOUNT_NOT_EXISTED(1002, "Account does not existed"),
    VERIFY_FAILED(1003, "Verify failed"),
    UPDATE_ACCOUNT_FAILED(1004, "Update account failed"),
    ;

    private int code;
    private String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
