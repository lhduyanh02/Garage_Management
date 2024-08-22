package com.lhduyanh.garagemanagement.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.net.http.HttpClient;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_MESSAGE_KEY(8888, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001, "User already existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1012, "User does not existed", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_EXISTED(1002, "Account does not existed", HttpStatus.BAD_REQUEST),
    ACCOUNT_EXISTED(1002, "This email is used for another account", HttpStatus.BAD_REQUEST),
    VERIFY_FAILED(1003, "Verify failed", HttpStatus.BAD_REQUEST),
    UPDATE_ACCOUNT_FAILED(1004, "Update account failed", HttpStatus.INTERNAL_SERVER_ERROR),
    ADDRESS_NOT_EXISTED(1005, "Address does not existed", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1006, "Email is invalid", HttpStatus.BAD_REQUEST),
    BLANK_EMAIL(1007, "Email must not be blank", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER(1008, "Phone number is invalid", HttpStatus.BAD_REQUEST),
    BLANK_PASSWORD(1009, "Password must not be blank", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1010, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    BLANK_STATUS(1011, "Status must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_NAME(1012, "Name must not be blank", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1013, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    INTROSPECT_EXCEPTION(1014, "Introspect exception", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_DECODE_ERROR(1015, "Token decode exception", HttpStatus.INTERNAL_SERVER_ERROR),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
    private int code;
    private String message;
    private final HttpStatusCode statusCode;

}
