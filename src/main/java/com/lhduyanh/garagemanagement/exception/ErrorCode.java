package com.lhduyanh.garagemanagement.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_MESSAGE_KEY(8888, "Invalid message key", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(1015, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1020, "You do not have permission", HttpStatus.FORBIDDEN),
    INTROSPECT_EXCEPTION(1016, "Introspect exception", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_DECODE_ERROR(1017, "Token decode exception", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_TOKEN(1018, "Invalid token", HttpStatus.BAD_REQUEST),

    EMAIL_SENDING_ERROR(1030, "Email sending error, try again manually", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_REGENERATE_OTP(1031, "Can't regenerate otp", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_EXISTED(1001, "User already existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User does not exist", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_EXISTED(1003, "Account does not exist", HttpStatus.NOT_FOUND),
    ACCOUNT_EXISTED(1004, "This email is used for another account", HttpStatus.BAD_REQUEST),
    UPDATE_ACCOUNT_FAILED(1006, "Update account failed", HttpStatus.INTERNAL_SERVER_ERROR),
    VERIFY_FAILED(1005, "Verify failed", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1008, "Email is invalid", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER(1010, "Phone number is invalid", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1012, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),

    BLANK_ID(1019, "Id user must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_NAME(1014, "Name must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_STATUS(1013, "Status must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_EMAIL(1009, "Email must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_PASSWORD(1011, "Password must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_OPTION(1041, "Option must not be blank", HttpStatus.BAD_REQUEST),

    ADDRESS_NOT_EXISTED(1007, "Address does not exist", HttpStatus.NOT_FOUND),

    BLANK_PERMISSIONKEY(1021, "Permission key must not be blank", HttpStatus.BAD_REQUEST),
    PERMISSIONKEY_EXISTED(1027, "Permission key already existed", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_EXISTED(1029, "Permission does not exist", HttpStatus.NOT_FOUND),

    BLANK_ROLEKEY(1022, "Role key must not be blank", HttpStatus.BAD_REQUEST),
    ROLENAME_EXISTED(1023, "Role name already existed", HttpStatus.BAD_REQUEST),
    ROLEKEY_EXISTED(1024, "Role key already existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1025, "Role does not exist", HttpStatus.NOT_FOUND),

    BLANK_FUNCTION(1026, "Function is not selected", HttpStatus.BAD_REQUEST),
    FUNCTION_NOT_EXISTED(1028, "Function does not exist", HttpStatus.NOT_FOUND),

    BRAND_NAME_LENGTH(1032, "Car brand name up to {max} characters", HttpStatus.BAD_REQUEST),
    BRAND_NAME_EXISTED(1033, "Car brand name already existed", HttpStatus.BAD_REQUEST),
    BRAND_NOT_EXISTS(1034, "Car brand does not exist", HttpStatus.NOT_FOUND),

    MODEL_NAME_LENGTH(1032, "Car model name up to {max} characters", HttpStatus.BAD_REQUEST),
    MODEL_NAME_EXISTED(1033, "Car model name already existed", HttpStatus.BAD_REQUEST),
    MODEL_NOT_EXISTS(1034, "Car model does not exist", HttpStatus.NOT_FOUND),

    PLATE_TYPE_SIZE(1032, "Plate type up to {max} characters", HttpStatus.BAD_REQUEST),
    PLATE_TYPE_EXISTED(1033, "Plate type already existed", HttpStatus.BAD_REQUEST),
    PLATE_TYPE_NOT_EXISTS(1034, "Plate type does not exist", HttpStatus.NOT_FOUND),

    NULL_PRICE_SERVICE(1035, "Price must not be null", HttpStatus.BAD_REQUEST),
    SERVICE_NOT_EXISTS(1036, "Service does not exist", HttpStatus.NOT_FOUND),
    SERVICE_NAME_EXISTED(1037, "Service name already existed", HttpStatus.OK),

    OPTION_NOT_EXISTS(1038, "Option does not exist", HttpStatus.NOT_FOUND),
    OPTION_EXISTED(1039, "Option name already existed", HttpStatus.BAD_REQUEST),
    OPTION_NAME_LENGTH(1040, "Option name up to {max} characters", HttpStatus.BAD_REQUEST),
    BLANK_OPTION_ID(1041, "Option id must not be blank", HttpStatus.BAD_REQUEST),
    NEGATIVE_PRICE(1042, "Price must not be negative", HttpStatus.BAD_REQUEST),
    NULL_OPTION(1043, "Option must not be null", HttpStatus.BAD_REQUEST),

    BLANK_NUM_PLATE(1044, "Num plate must not be blank", HttpStatus.BAD_REQUEST),
    NUM_PLATE_LENGTH(1045, "Num plate up to {max} characters", HttpStatus.BAD_REQUEST),
    BLANK_PLATE_TYPE(1046, "Plate type must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_MODEL(1047, "Car model must not be blank", HttpStatus.BAD_REQUEST),
    CAR_COLOR_LENGTH(1048, "Car color up to {max} characters", HttpStatus.BAD_REQUEST),
    CAR_DETAIL_LENGTH(1049, "Car detail up to {max} characters", HttpStatus.BAD_REQUEST),
    CAR_NOT_EXISTS(1050, "Car does not exist", HttpStatus.NOT_FOUND),
    CAR_EXISTED(1051, "This num plate & plate type already existed", HttpStatus.BAD_REQUEST),
    BLANK_BRAND(1052, "Brand must not be blank", HttpStatus.BAD_REQUEST),
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
