package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.NotifyToAnUserRequest;
import com.lhduyanh.garagemanagement.dto.request.NotifyToManyUsersRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@Async
public class TelegramService {

    WebClient webClient;

    public void sendNotificationToAnUser(String id, String message) {
        Long chatId = Long.parseLong(id);
        NotifyToAnUserRequest request = new NotifyToAnUserRequest(chatId, message);

        webClient.post()
                .uri("http://localhost:8081/telegram/notify")
                .body(Mono.just(request), NotifyToAnUserRequest.class)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(unused -> log.warn("ĐÃ GỬI THÔNG BÁO"))
                .doOnError(error -> log.error("LỖI KHI GỬI THÔNG BÁO: {}", error.getMessage()))
                .subscribe();
    }

    public void sendNotificationToManyUsers(List<Long> ids, String message) {
        NotifyToManyUsersRequest request = new NotifyToManyUsersRequest(ids, message);

        webClient.post()
                .uri("http://localhost:8081/telegram/notify/many-user")
                .body(Mono.just(request), NotifyToManyUsersRequest.class)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(unused -> log.warn("ĐÃ GỬI THÔNG BÁO"))
                .doOnError(error -> log.error("LỖI KHI GỬI THÔNG BÁO: {}", error.getMessage()))
                .subscribe();
    }

}
