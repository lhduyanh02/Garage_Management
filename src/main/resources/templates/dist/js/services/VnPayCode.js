const VNPayErrorCode = {
    SUCCESS: { code: "00", message: "Giao dịch thành công." },
    SUSPICIOUS: { code: "07", message: "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)." },
    NOT_REGISTERED: { code: "09", message: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng." },
    AUTH_FAILED: { code: "10", message: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần." },
    TIMEOUT: { code: "11", message: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch." },
    ACCOUNT_LOCKED: { code: "12", message: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa." },
    WRONG_OTP: { code: "13", message: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch." },
    CANCELLED: { code: "24", message: "Giao dịch không thành công do: Khách hàng hủy giao dịch." },
    INSUFFICIENT_FUNDS: { code: "51", message: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch." },
    LIMIT_EXCEEDED: { code: "65", message: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày." },
    MAINTENANCE: { code: "75", message: "Ngân hàng thanh toán đang bảo trì." },
    WRONG_PASSWORD_LIMIT: { code: "79", message: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch." },
    OTHER: { code: "99", message: "Lỗi giao dịch không xác định." },
};

// Hàm lấy thông báo từ mã lỗi
function getVNPayMessageByCode(code) {
    // Duyệt qua các giá trị của enum để tìm mã lỗi
    for (const key in VNPayErrorCode) {
        if (VNPayErrorCode[key].code === code) {
            return VNPayErrorCode[key].message;
        }
    }
    // Trả về thông báo mặc định nếu không tìm thấy mã lỗi
    return "Mã lỗi không xác định.";
}

// Xuất các hàm và enum để sử dụng trong file khác
export { VNPayErrorCode, getVNPayMessageByCode };