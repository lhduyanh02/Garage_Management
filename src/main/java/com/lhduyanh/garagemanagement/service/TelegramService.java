package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.NotifyToAnUserRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
                .doOnNext(response -> log.warn("ĐÃ GỬI THÔNG BÁO: {}", response))
                .subscribe();
    }

}
