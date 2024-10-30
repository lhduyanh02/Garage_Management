package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.*;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.service.AccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AccountController {

    AccountService accountService;

    @GetMapping("/{id}")
    public ApiResponse<AccountFullResponse> getAccountById(@PathVariable String id) {
        return ApiResponse.<AccountFullResponse>builder()
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

    @PostMapping("/new-account")
    public ApiResponse<AccountResponse> createAccount(@RequestBody @Valid AccountCreationRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .code(1000)
                .data(accountService.newAccount(request, false))
                .build();
    }

    @PostMapping("/new-account/confirm")
    public ApiResponse<AccountResponse> confirmCreateAccount(@RequestBody @Valid AccountCreationRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .code(1000)
                .data(accountService.newAccount(request, true))
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

    @PutMapping("/{id}")
    public ApiResponse<AccountResponse> updateAccount(@PathVariable String id,
                                                      @RequestBody @Valid AccountUpdateRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .code(1000)
                .data(accountService.updateAccount(id, request, false))
                .build();
    }

    @PutMapping("/confirm/{id}")
    public ApiResponse<AccountResponse> confirmUpdateAccount(@PathVariable String id,
                                                      @RequestBody @Valid AccountUpdateRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .code(1000)
                .data(accountService.updateAccount(id, request, true))
                .build();
    }

    @PutMapping(("/reset-password/{id}"))
    public ApiResponse<Boolean> resetPassword(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(accountService.resetPasswordById(id))
                .build();
    }

    @DeleteMapping("/hard/{id}")
    public ApiResponse<Boolean> hardDeleteAccount(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(accountService.hardDeleteAccount(id))
                .build();
    }

}
