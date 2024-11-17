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
    MODEL_NAME_EXISTED(1037, "Model name of this brand already existed", HttpStatus.BAD_REQUEST),
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
    CAN_NOT_EDIT_ADMIN(1066, "Supervisor account cannot be edit", HttpStatus.FORBIDDEN),
    DISABLE_ACCOUNT_WARNING(1067, "This action will disable all other accounts link to this user", HttpStatus.OK),
    NO_CHANGE_UPDATE(1068, "No change update", HttpStatus.OK),
    PRICE_NOT_EXIST(1069, "Price does not exist", HttpStatus.NOT_FOUND),
    BLANK_CAR(1070, "Car can not be blank", HttpStatus.BAD_REQUEST),
    DISABLED_USER(1071, "This user was disabled", HttpStatus.BAD_REQUEST),
    DISABLED_CAR(1072, "This car was disabled", HttpStatus.BAD_REQUEST),
    ILLEGAL_NUM_PLATE(1073, "Illegal num plate", HttpStatus.BAD_REQUEST),
    INVALID_SEARCH_CRITERIA(1074, "The search requires at least one criterion", HttpStatus.BAD_REQUEST),
    NO_CARS_FOUND(1075, "No cars found", HttpStatus.OK),
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
    DETAIL_LIST_EMPTY(1089, "Request must have at least 1 service", HttpStatus.BAD_REQUEST),
    TEXT_LENGTH(1090, "Maximum text length is 65000 characters", HttpStatus.BAD_REQUEST),
    EMPTY_IMAGE_LIST(1091, "Image list must not be empty", HttpStatus.BAD_REQUEST),
    NULL_IMAGE(1092, "Image can not be null", HttpStatus.BAD_REQUEST),
    MAX_SIZE_IMAGE_LIST(1093, "Maximum image quantity allowed is {max_image_list_size}", HttpStatus.BAD_REQUEST),
    DELETE_IMAGE_INVALID_HISTORY(1094, "Only images from ongoing service orders can be deleted", HttpStatus.BAD_REQUEST),
    NOT_PROCEEDING_HISTORY(1095, "This action can only be performed on ongoing service orders", HttpStatus.BAD_REQUEST),

    BLANK_KEY(1096, "Key must not be blank", HttpStatus.BAD_REQUEST),
    DESCRIPTION_LENGTH(1097, "Maximum description length is 65000 characters", HttpStatus.BAD_REQUEST),
    BLANK_VALUE(1098, "Value must not be blank", HttpStatus.BAD_REQUEST),
    PARAMETER_NOT_EXIST(1099, "Parameter does not exist", HttpStatus.BAD_REQUEST),
    DETAIL_NOT_EXIST(1100, "This detail does not exist", HttpStatus.BAD_REQUEST),
    EMPTY_PERMISSION_LIST(1101, "Permission list must not be empty", HttpStatus.BAD_REQUEST),
    ROLE_CAN_NOT_EDIT(1102, "This role can not be edit", HttpStatus.BAD_REQUEST),
    BLANK_CUSTOMER(1103, "Customer must not be blank", HttpStatus.BAD_REQUEST),
    HAVE_PENDING_APPOINTMENT(1104, "This customer has a pending appointment, can not create a new one", HttpStatus.BAD_REQUEST),
    HAVE_UPCOMING_APPOINTMENT(1105, "This customer has an upcoming appointment, can not create a new one", HttpStatus.BAD_REQUEST),
    BLOCKED_USER(1106, "This user has been blocked", HttpStatus.BAD_REQUEST),
    BLANK_APPOINTMENT_TIME(1107, "Time of appointment must not be blank", HttpStatus.BAD_REQUEST),
    MINIMUM_SCHEDULE_TIME(1108, "The minimum booking time for an appointment is 10 minutes from now", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_EXIST(1109, "This appointment does not exist", HttpStatus.BAD_REQUEST),
    PAST_APPOINTMENT(1110, "This appointment has already passed and cannot be modified", HttpStatus.BAD_REQUEST),
    CONFIRMED_APPOINTMENT(1111, "This appointment has been confirmed, and cannot be modified", HttpStatus.BAD_REQUEST),

    USER_NOT_MANAGE_CAR(1112, "User not manage this car", HttpStatus.BAD_REQUEST),
    INVALID_STATUS(1113, "Invalid status", HttpStatus.BAD_REQUEST),
    INVALID_TIME(1114, "Invalid time of appointment, the time must be in future", HttpStatus.BAD_REQUEST),
    INVALID_TIME_FORMAT(1115, "Invalid time format", HttpStatus.BAD_REQUEST),
    CLOSING_TIME_APPOINTMENT(1116, "Your selected time is in closing time", HttpStatus.BAD_REQUEST),

    USER_NOT_CUSTOMER(1117, "This user does not have role customer", HttpStatus.BAD_REQUEST),
    NOT_YOUR_APPOINTMENT(1118, "This appointment is not your, you can not update it", HttpStatus.BAD_REQUEST),

    ACTIVE_ACCOUNT(1119, "The account is currently active and cannot perform this action", HttpStatus.BAD_REQUEST),
    EMPTY_ROLE_USER(1120, "Role list of this user is empty", HttpStatus.BAD_REQUEST),
    EMPTY_PERMISSION_USER(1121, "Permission list of this user is empty", HttpStatus.BAD_REQUEST),
    INACTIVE_ACCOUNT(1122, "This account is not currently active", HttpStatus.BAD_REQUEST),
    INCORRECT_PASSWORD(1123, "Incorrect password", HttpStatus.BAD_REQUEST),
    NOT_YOUR_ACCOUNT(1124, "This is not your account, you cannot edit it", HttpStatus.BAD_REQUEST),
    BLOCKED_ACCOUNT(1125, "This account has been blocked", HttpStatus.BAD_REQUEST),
    BLANK_OTP(1126, "OTP can not be blank", HttpStatus.BAD_REQUEST),
    INCORRECT_OTP(1127, "Incorrect OTP", HttpStatus.BAD_REQUEST),
    TELEGRAM_ID_EXISTED(1128, "This telegram ID has been used by another user", HttpStatus.BAD_REQUEST),
    BLANK_TITLE(1129, "Title of message must not be blank", HttpStatus.BAD_REQUEST),
    BLANK_CONTENT(1130, "Content of message must not be blank", HttpStatus.BAD_REQUEST),
    TELEGRAM_MESSAGE_NOT_EXIST(1131, "This telegram message does not exist", HttpStatus.BAD_REQUEST),
    NOT_DRAFT_MESSAGE(1132, "This message is not draft, cannot be edited", HttpStatus.BAD_REQUEST),
    NO_RECEIVER(1133, "This message has no receiver", HttpStatus.BAD_REQUEST),

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
