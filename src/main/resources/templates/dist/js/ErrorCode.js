const ErrorCode = {
    UNCATEGORIZED_EXCEPTION: { code: 9999, message: "Lỗi không xác định", statusCode: 500 },
    INVALID_MESSAGE_KEY: { code: 8888, message: "MESSAGE_KEY không xác định", statusCode: 400 },
    UNAUTHENTICATED: { code: 1001, message: "Không thể xác thực, vui lòng đăng nhập lại", statusCode: 401 },
    UNAUTHORIZED: { code: 1002, message: "Bạn không có phân quyền", statusCode: 403 },
    INTROSPECT_EXCEPTION: { code: 1003, message: "Lỗi introspect", statusCode: 500 },
    TOKEN_DECODE_ERROR: { code: 1004, message: "Lỗi giải mã token", statusCode: 500 },
    INVALID_TOKEN: { code: 1005, message: "Token không hợp lệ", statusCode: 400 },
    EMAIL_SENDING_ERROR: { code: 1006, message: "Lỗi gửi email, vui lòng thử lại", statusCode: 500 },
    CANNOT_REGENERATE_OTP: { code: 1007, message: "Không thể tạo lại OTP", statusCode: 500 },
    USER_EXISTED: { code: 1008, message: "Người dùng này đã tồn tại", statusCode: 400 },
    USER_NOT_EXISTED: { code: 1009, message: "Người dùng này không tồn tại", statusCode: 404 },
    ACCOUNT_NOT_EXISTED: { code: 1010, message: "Tài khoản này không tồn tại", statusCode: 404 },
    ACCOUNT_EXISTED: { code: 1011, message: "Email này đã được sử dụng cho một tài khoản khác", statusCode: 400 },
    UPDATE_ACCOUNT_FAILED: { code: 1012, message: "Cập nhật tài khoản không thành công", statusCode: 500 },
    VERIFY_FAILED: { code: 1013, message: "Xác minh không thành công", statusCode: 400 },
    INVALID_EMAIL: { code: 1014, message: "Email không hợp lệ", statusCode: 400 },
    INVALID_PHONE_NUMBER: { code: 1015, message: "Số điện thoại không hợp lệ", statusCode: 400 },
    INVALID_PASSWORD: { code: 1016, message: "Mật khẩu phải có ít nhất 8 ký tự", statusCode: 400 },
    BLANK_ID: { code: 1017, message: "ID không được để trống", statusCode: 400 },
    BLANK_NAME: { code: 1018, message: "Tên không được để trống", statusCode: 400 },
    BLANK_STATUS: { code: 1019, message: "Trạng thái không được để trống", statusCode: 400 },
    BLANK_EMAIL: { code: 1020, message: "Email không được để trống", statusCode: 400 },
    BLANK_PASSWORD: { code: 1021, message: "Mật khẩu không được để trống", statusCode: 400 },
    BLANK_OPTION: { code: 1022, message: "Option (tùy chọn) không được để trống", statusCode: 400 },
    ADDRESS_NOT_EXISTED: { code: 1023, message: "Địa chỉ không tồn tại", statusCode: 404 },
    BLANK_PERMISSIONKEY: { code: 1024, message: "PERMISSION_KEY không được để trống", statusCode: 400 },
    PERMISSIONKEY_EXISTED: { code: 1025, message: "PERMISSION_KEY đã tồn tại", statusCode: 400 },
    PERMISSION_NOT_EXISTED: { code: 1026, message: "Phân quyền không tồn tại", statusCode: 404 },
    BLANK_ROLEKEY: { code: 1027, message: "ROLE_KEY không được để trống", statusCode: 400 },
    ROLENAME_EXISTED: { code: 1028, message: "Tên vai trò đã tồn tại", statusCode: 400 },
    ROLEKEY_EXISTED: { code: 1029, message: "ROLE_KEY đã tồn tại", statusCode: 400 },
    ROLE_NOT_EXISTED: { code: 1030, message: "Vai trò không tồn tại", statusCode: 404 },
    BLANK_FUNCTION: { code: 1031, message: "Chức năng chưa được chọn", statusCode: 400 },
    FUNCTION_NOT_EXISTED: { code: 1032, message: "Chức năng không tồn tại", statusCode: 404 },
    BRAND_NAME_LENGTH: { code: 1033, message: "Tên thương hiệu xe tối đa 50 ký tự", statusCode: 400 },
    BRAND_NAME_EXISTED: { code: 1034, message: "Tên thương hiệu xe đã tồn tại", statusCode: 400 },
    BRAND_NOT_EXISTS: { code: 1035, message: "Thương hiệu xe không tồn tại", statusCode: 404 },
    MODEL_NAME_LENGTH: { code: 1036, message: "Tên mẫu xe tối đa 100 ký tự", statusCode: 400 },
    MODEL_NAME_EXISTED: { code: 1037, message: "Tên mẫu xe đã tồn tại", statusCode: 400 },
    MODEL_NOT_EXISTS: { code: 1038, message: "Mẫu xe không tồn tại", statusCode: 404 },
    PLATE_TYPE_SIZE: { code: 1039, message: "Loại biển số tối đa 150 ký tự", statusCode: 400 },
    PLATE_TYPE_EXISTED: { code: 1040, message: "Loại biển số đã tồn tại", statusCode: 400 },
    PLATE_TYPE_NOT_EXISTS: { code: 1041, message: "Loại biển số không tồn tại", statusCode: 404 },
    NULL_PRICE_SERVICE: { code: 1042, message: "Giá không được để trống", statusCode: 400 },
    SERVICE_NOT_EXISTS: { code: 1043, message: "Dịch vụ không tồn tại", statusCode: 404 },
    SERVICE_NAME_EXISTED: { code: 1044, message: "Tên dịch vụ đã tồn tại", statusCode: 200 },
    OPTION_NOT_EXISTS: { code: 1045, message: "Tùy chọn không tồn tại", statusCode: 404 },
    OPTION_EXISTED: { code: 1046, message: "Tên tùy chọn đã tồn tại", statusCode: 400 },
    OPTION_NAME_LENGTH: { code: 1047, message: "Tên tùy chọn tối đa 100 ký tự", statusCode: 400 },
    BLANK_OPTION_ID: { code: 1048, message: "ID tùy chọn không được để trống", statusCode: 400 },
    NEGATIVE_PRICE: { code: 1049, message: "Giá không được âm", statusCode: 400 },
    NULL_OPTION: { code: 1050, message: "Option (tùy chọn) chưa được thiết lập", statusCode: 400 },
    BLANK_NUM_PLATE: { code: 1051, message: "Biển số không được để trống", statusCode: 400 },
    NUM_PLATE_LENGTH: { code: 1052, message: "Biển số tối đa 50 ký tự", statusCode: 400 },
    BLANK_PLATE_TYPE: { code: 1053, message: "Loại biển số không được để trống", statusCode: 400 },
    BLANK_MODEL: { code: 1054, message: "Mẫu xe không được để trống", statusCode: 400 },
    CAR_COLOR_LENGTH: { code: 1055, message: "Màu xe tối đa 200 ký tự", statusCode: 400 },
    CAR_DETAIL_LENGTH: { code: 1056, message: "Mô tả chi tiết xe tối đa 1000 ký tự", statusCode: 400 },
    CAR_NOT_EXISTS: { code: 1057, message: "Xe không tồn tại", statusCode: 404 },
    CAR_EXISTED: { code: 1058, message: "Xe mang biển số & loại biển số này đã tồn tại", statusCode: 400 },
    BLANK_BRAND: { code: 1059, message: "Thương hiệu xe không được để trống", statusCode: 400 },
    OTP_SEND_TIMER: { code: 1060, message: "Thời gian tối thiểu gửi OTP tới cùng email là 1 phút", statusCode: 400 },
    DELETE_ACTIVATED_USER: {code: 1061, message: "Không thể xóa người dùng đang hoạt động", httpStatus: 400},
    PHONE_NUMBER_LENGTH: {code: 1062, message: "Phone number up to 50 characters", httpStatus: 400},
    DISABLE_ACTIVE_USER_ONLY: {code: 1063, message: "Không thể vô hiệu hóa người dùng này", httpStatus: 400},
    CAN_NOT_DISABLE_ADMIN: {code: 1064, message: "Không thể khóa tài khoản quản trị hệ thống", httpStatus: 400},
    BLANK_USER: { code: 1065, message: "Hồ sơ không được để trống", status: 400 },
    CAN_NOT_EDIT_ADMIN: { code: 1066, message: "Bạn không có quyền chỉnh sửa tài khoản quản trị viên này", status: 403 },
    DISABLE_ACCOUNT_WARNING: { code: 1067, message: "Hành động này sẽ vô hiệu hóa tất cả tài khoản khác liên kết với hồ sơ này", status: 200},
    NO_CHANGE_UPDATE: { code: 1068, message: "Không có thay đổi để cập nhật", status: 200 },
    PRICE_NOT_EXIST: { code: 1069, message: "Không tìm thấy giá cho tùy chọn này", status: 404 },
};

export default ErrorCode;