package com.lhduyanh.garagemanagement.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_MESSAGE_KEY(8888, "Invalid message key", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(1001, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1002, "You do not have permission", HttpStatus.FORBIDDEN),
    INTROSPECT_EXCEPTION(1003, "Introspect exception", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_DECODE_ERROR(1004, "Token decode exception", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_TOKEN(1005, "Invalid token", HttpStatus.BAD_REQUEST),

    EMAIL_SENDING_ERROR(1006, "Email sending error, try again manually", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_REGENERATE_OTP(1007, "Can't regenerate otp", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_EXISTED(1008, "User already existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1009, "User does not exist", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_EXISTED(1010, "Account does not exist", HttpStatus.NOT_FOUND),
    ACCOUNT_EXISTED(1011, "This email is used for another account", HttpStatus.BAD_REQUEST),
    UPDATE_ACCOUNT_FAILED(1012, "Update account failed", HttpStatus.INTERNAL_SERVER_ERROR),
    VERIFY_FAILED(1013, "Verify failed", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1014, "Email is invalid", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER(1015, "Phone number is invalid", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1016, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),

    BLANK_ID(1017, "Id must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_NAME(1018, "Name must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_STATUS(1019, "Status must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_EMAIL(1020, "Email must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_PASSWORD(1021, "Password must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_OPTION(1022, "Option must not be blank", HttpStatus.BAD_REQUEST),

    ADDRESS_NOT_EXISTED(1023, "Address does not exist", HttpStatus.NOT_FOUND),

    BLANK_PERMISSIONKEY(1024, "Permission key must not be blank", HttpStatus.BAD_REQUEST),
    PERMISSIONKEY_EXISTED(1025, "Permission key already existed", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_EXISTED(1026, "Permission does not exist", HttpStatus.NOT_FOUND),

    BLANK_ROLEKEY(1027, "Role key must not be blank", HttpStatus.BAD_REQUEST),
    ROLENAME_EXISTED(1028, "Role name already existed", HttpStatus.BAD_REQUEST),
    ROLEKEY_EXISTED(1029, "Role key already existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1030, "Role does not exist", HttpStatus.NOT_FOUND),

    BLANK_FUNCTION(1031, "Function is not selected", HttpStatus.BAD_REQUEST),
    FUNCTION_NOT_EXISTED(1032, "Function does not exist", HttpStatus.NOT_FOUND),

    BRAND_NAME_LENGTH(1033, "Car brand name up to {max} characters", HttpStatus.BAD_REQUEST),
    BRAND_NAME_EXISTED(1034, "Car brand name already existed", HttpStatus.BAD_REQUEST),
    BRAND_NOT_EXISTS(1035, "Car brand does not exist", HttpStatus.NOT_FOUND),

    MODEL_NAME_LENGTH(1036, "Car model name up to {max} characters", HttpStatus.BAD_REQUEST),
    MODEL_NAME_EXISTED(1037, "Car model name already existed", HttpStatus.BAD_REQUEST),
    MODEL_NOT_EXISTS(1038, "Car model does not exist", HttpStatus.NOT_FOUND),

    PLATE_TYPE_SIZE(1039, "Plate type up to {max} characters", HttpStatus.BAD_REQUEST),
    PLATE_TYPE_EXISTED(1040, "Plate type already existed", HttpStatus.BAD_REQUEST),
    PLATE_TYPE_NOT_EXISTS(1041, "Plate type does not exist", HttpStatus.NOT_FOUND),

    NULL_PRICE_SERVICE(1042, "Price must not be null", HttpStatus.BAD_REQUEST),
    SERVICE_NOT_EXISTS(1043, "Service does not exist", HttpStatus.NOT_FOUND),
    SERVICE_NAME_EXISTED(1044, "Service name already existed", HttpStatus.OK),

    OPTION_NOT_EXISTS(1045, "Option does not exist", HttpStatus.NOT_FOUND),
    OPTION_EXISTED(1046, "Option name already existed", HttpStatus.BAD_REQUEST),
    OPTION_NAME_LENGTH(1047, "Option name up to {max} characters", HttpStatus.BAD_REQUEST),
    BLANK_OPTION_ID(1048, "Option id must not be blank", HttpStatus.BAD_REQUEST),
    NEGATIVE_PRICE(1049, "Price must not be negative", HttpStatus.BAD_REQUEST),
    NULL_OPTION(1050, "Option must not be null", HttpStatus.BAD_REQUEST),

    BLANK_NUM_PLATE(1051, "Num plate must not be blank", HttpStatus.BAD_REQUEST),
    NUM_PLATE_LENGTH(1052, "Num plate up to {max} characters", HttpStatus.BAD_REQUEST),
    BLANK_PLATE_TYPE(1053, "Plate type must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_MODEL(1054, "Car model must not be blank", HttpStatus.BAD_REQUEST),
    CAR_COLOR_LENGTH(1055, "Car color up to {max} characters", HttpStatus.BAD_REQUEST),
    CAR_DETAIL_LENGTH(1056, "Car detail up to {max} characters", HttpStatus.BAD_REQUEST),
    CAR_NOT_EXISTS(1057, "Car does not exist", HttpStatus.NOT_FOUND),
    CAR_EXISTED(1058, "This num plate & plate type already existed", HttpStatus.BAD_REQUEST),
    BLANK_BRAND(1059, "Brand must not be blank", HttpStatus.BAD_REQUEST),

    OTP_SEND_TIMER(1060, "Minimum time to send OTP to the same email is 1 minute", HttpStatus.BAD_REQUEST),
    DELETE_ACTIVATED_USER(1061, "Can not delete activated user", HttpStatus.BAD_REQUEST),

    PHONE_NUMBER_LENGTH(1062, "Phone number up to {max} characters", HttpStatus.BAD_REQUEST),
    DISABLE_ACTIVE_USER_ONLY(1063, "Disable active user only", HttpStatus.BAD_REQUEST),
    CAN_NOT_DISABLE_ADMIN(1064, "Can not disable admin account", HttpStatus.BAD_REQUEST),
    BLANK_USER(1065, "User can not be blank", HttpStatus.BAD_REQUEST),
    CAN_NOT_EDIT_ADMIN(1066, "You have no permission to edit admin account", HttpStatus.FORBIDDEN),
    DISABLE_ACCOUNT_WARNING(1067, "This action will disable all accounts link to this user", HttpStatus.OK),
    NO_CHANGE_UPDATE(1068, "No change update", HttpStatus.OK),
    PRICE_NOT_EXIST(1069, "Price does not exist", HttpStatus.NOT_FOUND),
    BLANK_CAR(1070, "Car can not be blank", HttpStatus.BAD_REQUEST),
    DISABLED_USER(1071, "This user was disabled", HttpStatus.BAD_REQUEST),
    DISABLED_CAR(1072, "This car was disabled", HttpStatus.BAD_REQUEST),
    ILLEGAL_NUM_PLATE(1073, "Illegal num plate", HttpStatus.BAD_REQUEST),
    INVALID_SEARCH_CRITERIA(1074, "The search requires at least one criterion", HttpStatus.BAD_REQUEST),
    NO_CARS_FOUND(1075, "No cars founded", HttpStatus.OK),
    INVALID_ADVISOR(1076, "Advisor is invalid", HttpStatus.BAD_REQUEST),

    CAR_IN_SERVICE(1077, "This vehicle is currently undergoing service", HttpStatus.BAD_REQUEST),
    HISTORY_NOT_EXISTS(1078, "History does not exist", HttpStatus.NOT_FOUND),
    BLANK_HISTORY(1079, "History can not be blank, please choose one", HttpStatus.BAD_REQUEST),
    PAID_HISTORY(1080, "This invoice has already been paid, can not be modified", HttpStatus.BAD_REQUEST),
    ASSIGN_MANAGER_WARNING(1081, "This action will automatically assign this user as the manager of the selected car", HttpStatus.OK),
    BLANK_SERVICE(1082, "Service must not be blank", HttpStatus.BAD_REQUEST),
    DISCOUNT_RANGE(1083, "Discount must be between 0% and 100%", HttpStatus.BAD_REQUEST),
    QUANTITY_RANGE(1084, "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    CANCELED_HISTORY(1085, "This invoice has already been canceled, can not be modified", HttpStatus.BAD_REQUEST),
    SERVICE_NOT_IN_USE(1086, "This service is not in use", HttpStatus.BAD_REQUEST),
    OPTION_NOT_IN_USE(1087, "This option is not in use", HttpStatus.BAD_REQUEST),
    UPDATE_HISTORY_ERROR(1088, "Error in updating history", HttpStatus.INTERNAL_SERVER_ERROR),

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
