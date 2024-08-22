package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.AccountResponse;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
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
    @Autowired
    private OtpService otpService;
    @Autowired
    private EmailSenderService emailSenderService;

    @PostMapping("/create_user_account")
    public ApiResponse<UserAccountResponse> createUserAccount(@RequestBody @Valid UserAccountCreationReq req) {
        return ApiResponse.<UserAccountResponse>builder()
                .code(200)
                .data(accountService.createUserAccount(req))
                .build();
    }

    @GetMapping
    public ApiResponse<List<AccountResponse>> getAllAccounts() {
        return ApiResponse.<List<AccountResponse>>builder()
                .code(200)
                .data(accountService.getAllAccounts())
                .build();
    }
/*
    @PostMapping("/create")
    ApiResponse<Account> createAccount(@RequestBody @Valid AccountCreationRequest request) throws MessagingException {
        ApiResponse<Account> apiResponse = new ApiResponse<>();

        emailSenderService.sendOTPEmail(request.getEmail(), request.getTen(), otpService.createOtpCode(request.getEmail()));

        apiResponse.setCode(1000);
        apiResponse.setData(accountService.createAccount(request));

        return apiResponse;
    }

    @GetMapping()
    ApiResponse<List<Account>> getAllAccounts() {
        ApiResponse<List<Account>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(1000);
        apiResponse.setData(accountService.getAllAccounts());
        return apiResponse;
    }

    @PostMapping("/verify")
    ApiResponse<String> verifyAccount(@RequestBody @Valid VerifyAccountRequest request) {
        ApiResponse<String> apiResponse = new ApiResponse<>();

        var result = otpService.VerifyOtpCode(request.getEmail(), request.getOtpCode());
        if(result){
            boolean b = accountService.updateStatusByEmail(request.getEmail(), 1);
            if(b){
                apiResponse.setCode(1000);
                apiResponse.setMessage("Successfully verified");
            }
            else {
                throw new AppException(ErrorCode.UPDATE_ACCOUNT_FAILED);
            }
        }
        else {
            throw new AppException(ErrorCode.VERIFY_FAILED);
        }

        return apiResponse;
    }

    @PostMapping("/delete")
    ApiResponse<String> deleteAccountById(@RequestBody @Valid IdAccountRequest req) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        int r = accountService.deleteAccountById(req.getId());
        if (r == 1) {
            apiResponse.setCode(1000);
            apiResponse.setData("Successfully deleted");
        }
        else if (r == -1) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_EXISTED);
        }
        return apiResponse;
    }

    @GetMapping("/{id}")
    ApiResponse<Account> getAccountById(@PathVariable String id) {
        ApiResponse<Account> apiResponse = new ApiResponse<>();
        apiResponse.setCode(1000);
        apiResponse.setData(accountService.getAccountById(id));

        return apiResponse;
    }

 */
}
