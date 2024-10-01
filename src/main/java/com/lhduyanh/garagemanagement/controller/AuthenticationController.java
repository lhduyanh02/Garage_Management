package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.AuthenticationRequest;
import com.lhduyanh.garagemanagement.dto.request.IntrospectRequest;
import com.lhduyanh.garagemanagement.dto.request.LogoutRequest;
import com.lhduyanh.garagemanagement.dto.request.RefreshTokenRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.AuthenticationResponse;
import com.lhduyanh.garagemanagement.dto.response.IntrospectResponse;
import com.lhduyanh.garagemanagement.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request, HttpServletResponse response) {
        var result = authenticationService.authenticate(request);
        if (result.isAuthenticated()) {
            // Tạo cookie với thuộc tính HttpOnly
            Cookie cookie = new Cookie("authToken", result.getToken());
            cookie.setHttpOnly(false); // Cookie không thể bị truy cập từ JavaScript
            cookie.setSecure(false); // Cookie chỉ được gửi qua kết nối HTTPS
            cookie.setPath("/"); // Cookie có hiệu lực cho tất cả các đường dẫn
            cookie.setMaxAge(7 * 24 * 60 * 60);

            // Thêm cookie vào phản hồi
            response.addCookie(cookie);
            response.setHeader("Authorization", "Bearer " + result.getToken());
        }
        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest logoutRequest) throws ParseException, JOSEException {
        authenticationService.logout(logoutRequest);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

//    @CrossOrigin(origins = "http://127.0.0.1:5500")
    @PostMapping("/refreshToken")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody RefreshTokenRequest request, HttpServletResponse response)
            throws ParseException, JOSEException {

        var result = authenticationService.refreshToken(request);

        // Xóa cookie cũ (nếu có) trước khi thêm cookie mới
        Cookie oldCookie = new Cookie("authToken", "");
        oldCookie.setHttpOnly(false);
        oldCookie.setSecure(false);
        oldCookie.setPath("/");
        oldCookie.setMaxAge(0); // Đặt thời gian sống của cookie thành 0 để xóa nó
        response.addCookie(oldCookie);

        // Tạo cookie với thuộc tính HttpOnly
        Cookie cookie = new Cookie("authToken", result.getToken());
        cookie.setHttpOnly(false); // Cookie không thể bị truy cập từ JavaScript
        cookie.setSecure(false); // Cookie chỉ được gửi qua kết nối HTTPS
        cookie.setPath("/"); // Cookie có hiệu lực cho tất cả các đường dẫn
        cookie.setMaxAge(7 * 24 * 60 * 60);

        // Thêm cookie vào phản hồi
        response.addCookie(cookie);
        response.setHeader("Authorization", "Bearer " + result.getToken());

        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

}
