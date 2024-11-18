package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.TelegramMessageCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.TelegramMessageSimpleResponse;
import com.lhduyanh.garagemanagement.dto.response.UserWithAccountsResponse;
import com.lhduyanh.garagemanagement.service.TelegramMessageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/telegram-message")
public class TelegramMessageController {

    TelegramMessageService telegramMessageService;

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_TELEGRAM_MESSAGE', 'SEND_TELEGRAM_MESSAGE'})")
    @GetMapping
    public ApiResponse<List<TelegramMessageSimpleResponse>> getAllTelegramMessage() {
        return ApiResponse.<List<TelegramMessageSimpleResponse>>builder()
                .code(1000)
                .data(telegramMessageService.getAllTelegramMessages())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_TELEGRAM_MESSAGE', 'SEND_TELEGRAM_MESSAGE'})")
    @GetMapping("/get-message/{id}")
    public ApiResponse<TelegramMessageSimpleResponse> getTelegramMessageById(@PathVariable String id) {
        return ApiResponse.<TelegramMessageSimpleResponse>builder()
                .code(1000)
                .data(telegramMessageService.getTelegramMessageById(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_TELEGRAM_MESSAGE', 'SEND_TELEGRAM_MESSAGE'})")
    @GetMapping("/receivers/{id}")
    public ApiResponse<List<UserWithAccountsResponse>> getReceiverOfTelegramMessage(@PathVariable String id) {
        return ApiResponse.<List<UserWithAccountsResponse>>builder()
                .code(1000)
                .data(telegramMessageService.getReceiverOfTelegramMessage(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SEND_TELEGRAM_MESSAGE'})")
    @PostMapping("/new-draft")
    public ApiResponse<TelegramMessageSimpleResponse> createNewDraft(@RequestBody @Valid TelegramMessageCreationRequest request) {
        return ApiResponse.<TelegramMessageSimpleResponse>builder()
                .code(1000)
                .data(telegramMessageService.newTelegramMessage(request))
                .build();
    }

    @PostMapping("/send-message/{id}")
    public ApiResponse<Boolean> sendTelegramMessage(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(telegramMessageService.sendMessage(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SEND_TELEGRAM_MESSAGE'})")
    @PutMapping("/update-receivers/{id}")
    public ApiResponse<TelegramMessageSimpleResponse> updateReceivers(@PathVariable String id, @RequestBody List<String> listReceiver) {
        return ApiResponse.<TelegramMessageSimpleResponse>builder()
                .code(1000)
                .data(telegramMessageService.updateReceivers(id, listReceiver))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SEND_TELEGRAM_MESSAGE'})")
    @PutMapping("/update-message/{id}")
    public ApiResponse<TelegramMessageSimpleResponse> updateMessage(@PathVariable String id, @RequestBody @Valid TelegramMessageCreationRequest request) {
        return ApiResponse.<TelegramMessageSimpleResponse>builder()
                .code(1000)
                .data(telegramMessageService.updateMessage(id, request))
                .build();
    }

    @DeleteMapping("/delete-message/{id}")
    public ApiResponse<Boolean> deleteMessage(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(telegramMessageService.deleteTelegramMessage(id))
                .build();
    }

}
