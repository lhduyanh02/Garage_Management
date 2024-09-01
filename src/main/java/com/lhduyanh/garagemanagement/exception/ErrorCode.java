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
    USER_NOT_EXISTED(1012, "User does not existed", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_EXISTED(1002, "Account does not existed", HttpStatus.NOT_FOUND),
    ACCOUNT_EXISTED(1002, "This email is used for another account", HttpStatus.BAD_REQUEST),
    VERIFY_FAILED(1003, "Verify failed", HttpStatus.BAD_REQUEST),
    UPDATE_ACCOUNT_FAILED(1004, "Update account failed", HttpStatus.INTERNAL_SERVER_ERROR),
    ADDRESS_NOT_EXISTED(1005, "Address does not existed", HttpStatus.NOT_FOUND),
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
    BLANK_ID(1016, "Id user must not be blank", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1017, "You do not have permission", HttpStatus.FORBIDDEN),
    BLANK_PERMISSIONKEY(1018, "Permission key must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_ROLEKEY(1019, "Role key must not be blank", HttpStatus.BAD_REQUEST),
    ROLENAME_EXISTED(1020, "Role name already existed", HttpStatus.BAD_REQUEST),
    ROLEKEY_EXISTED(1021, "Role key already existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1022, "Role does not existed", HttpStatus.NOT_FOUND),
    BLANK_FUNCTION(1023, "Function is not selected", HttpStatus.BAD_REQUEST),
    PERMISSIONKEY_EXISTED(1024, "Permission key already existed", HttpStatus.BAD_REQUEST),
    FUNCTION_NOT_EXISTED(1025, "Function does not existed", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_EXISTED(1026, "Permission does not existed", HttpStatus.NOT_FOUND),
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
