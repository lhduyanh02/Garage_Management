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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

//    @CrossOrigin(origins = "http://127.0.0.1:5500")
    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
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
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody RefreshTokenRequest request)
            throws ParseException, JOSEException {

        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

}
