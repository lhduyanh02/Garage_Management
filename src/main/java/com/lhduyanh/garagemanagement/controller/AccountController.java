package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.AccountVerifyRequest;
import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.request.UserRegisterRequest;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.service.AccountService;
import com.lhduyanh.garagemanagement.service.EmailSenderService;
import com.lhduyanh.garagemanagement.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {   // for design account controller api
    @Autowired
    private AccountService accountService;

    @GetMapping("/{id}")
    public ApiResponse<AccountResponse> getAccountById(@PathVariable String id) {
        return ApiResponse.<AccountResponse>builder()
                .code(1000)
                .data(accountService.getAccountById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<AccountResponse>> getAllEnableAccounts() {
        return ApiResponse.<List<AccountResponse>>builder()
                .code(1000)
                .data(accountService.getAllEnableAccounts())
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<AccountResponse>> getAllAccounts() {
        return ApiResponse.<List<AccountResponse>>builder()
                .code(1000)
                .data(accountService.getAllAccounts())
                .build();
    }

    @PostMapping("/create-user-account")
    public ApiResponse<UserAccountResponse> createUserAccount(@RequestBody @Valid UserAccountCreationReq req) {
        return ApiResponse.<UserAccountResponse>builder()
                .code(1000)
                .data(accountService.createUserAccount(req))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserRegisterResponse> accountRegister(@RequestBody @Valid UserRegisterRequest request) {
        var result = accountService.accountRegister(request);
        return ApiResponse.<UserRegisterResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PostMapping("/verify-account")
    public ApiResponse<AccountVerifyResponse> verifyAccount(@RequestBody @Valid AccountVerifyRequest request) {
        var result = accountService.accountVerify(request);
        return ApiResponse.<AccountVerifyResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PostMapping("/regenerate-otp")
    public ApiResponse<AccountVerifyResponse> regenerateOtpCode(@RequestParam("email") String request) {
        accountService.regenerateOtpCode(request);
        return ApiResponse.<AccountVerifyResponse>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> disableAccount(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(accountService.disableAccount(id))
                .build();
    }

    @PutMapping("/active/{id}")
    public ApiResponse<Boolean> enableAccount(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(accountService.enableAccount(id))
                .build();
    }

}
