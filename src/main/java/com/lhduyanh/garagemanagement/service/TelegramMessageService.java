package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.configuration.SecurityExpression;
import com.lhduyanh.garagemanagement.dto.request.TelegramMessageCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.TelegramMessageSimpleResponse;
import com.lhduyanh.garagemanagement.dto.response.UserWithAccountsResponse;
import com.lhduyanh.garagemanagement.entity.TelegramMessage;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.enums.TelegramMessageStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.TelegramMessageMapper;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.TelegramMessageRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class TelegramMessageService {

    TelegramMessageRepository telegramMessageRepository;
    UserRepository userRepository;

    TelegramMessageMapper telegramMessageMapper;
    UserMapper userMapper;
    SecurityExpression securityExpression;
    Collator vietnameseCollator;

    TelegramService telegramService;

    public List<TelegramMessageSimpleResponse> getAllTelegramMessages() {
        List<TelegramMessageSimpleResponse> response = telegramMessageRepository.findAllByStatus(null)
                .stream()
                .map(t -> {
                    TelegramMessageSimpleResponse res = telegramMessageMapper.toSimpleResponse(t);

                    res.setReceiverQuantity(telegramMessageRepository.countReceiverByTelegramMessageId(res.getId()));

                    return res;
                })
                .sorted(Comparator.comparing(TelegramMessageSimpleResponse::getCreateAt).reversed())
                .toList();

        return response;
    }

    public TelegramMessageSimpleResponse getTelegramMessageById(String id) {
        return telegramMessageRepository.findById(id).filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                .map(t -> {
                    TelegramMessageSimpleResponse response = telegramMessageMapper.toSimpleResponse(t);
                    response.setReceiverQuantity(telegramMessageRepository.countReceiverByTelegramMessageId(id));
                    return response;
                })
                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));
    }

    public List<UserWithAccountsResponse> getReceiverOfTelegramMessage(String id) {
        TelegramMessage message = telegramMessageRepository.findByIdFetchReceivers(id)
                .filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));

        List<UserWithAccountsResponse> receivers = message.getReceivers()
                            .stream()
                            .filter(r -> r.getStatus() >= UserStatus.BLOCKED.getCode())
                            .map( u-> {
                                UserWithAccountsResponse response = userMapper.toUserWithAccountsResponse(u);
                                response.setAccounts(response.getAccounts().stream()
                                        .filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                                        .collect(Collectors.toList()));
                                return response;
                            })
                            .sorted(Comparator.comparing(UserWithAccountsResponse::getName, vietnameseCollator))
                            .toList();

        return receivers;
    }

    public TelegramMessageSimpleResponse newTelegramMessage(TelegramMessageCreationRequest request) {
        String uid = getUUIDFromJwt();
        User sender = userRepository.findByIdFullInfo(uid)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (sender.getStatus() != 9999) {
            if (sender.getStatus() != UserStatus.CONFIRMED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_USER);
            }

            if (securityExpression.hasPermission(sender.getId(), List.of("SEND_TELEGRAM_MESSAGE"))) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        TelegramMessage telegramMessage = new TelegramMessage();
        telegramMessage.setTitle(request.getTitle().trim());
        telegramMessage.setMessage(request.getMessage().trim());
        telegramMessage.setSender(sender);
        telegramMessage.setCreateAt(LocalDateTime.now());
        telegramMessage.setStatus(TelegramMessageStatus.DRAFT.getCode());

        Set<User> receivers = new HashSet<>();

        if (!request.getReceivers().isEmpty()) {
            for (String id : request.getReceivers()) {
                User receiver = userRepository.findById(id).orElse(null);
                if (receiver == null || receiver.getTelegramId() == null) {
                    continue;
                }
                receivers.add(receiver);
            }
        }
        telegramMessage.setReceivers(receivers);
        TelegramMessageSimpleResponse response = telegramMessageMapper.toSimpleResponse(telegramMessageRepository.save(telegramMessage));
        response.setReceiverQuantity(telegramMessageRepository.countReceiverByTelegramMessageId(response.getId()));
        return response;
    }

    public Boolean sendMessage(String id) {
        TelegramMessage telegramMessage = telegramMessageRepository.findByIdFetchReceivers(id)
                .filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));

        if (telegramMessage.getStatus() != TelegramMessageStatus.DRAFT.getCode()) {
            throw new AppException(ErrorCode.NOT_DRAFT_MESSAGE);
        }

        Integer userQuantity = telegramMessageRepository.countReceiverByTelegramMessageId(id);
        if (userQuantity == 0) {
            throw new AppException(ErrorCode.NO_RECEIVER);
        }

        List<Long> chatIds = telegramMessage.getReceivers().stream()
                        .map(User::getTelegramId)
                        .filter(c -> !Objects.isNull(c))
                        .toList();

        String content = "<b>" + telegramMessage.getTitle() + "</b>\n\n" + telegramMessage.getMessage()
                .replaceAll("<p>", "")
                .replaceAll("</p>", "\n")
                .replaceAll("<br>", "\n")
                .trim();

        telegramService.sendNotificationToManyUsers(chatIds, content);

        telegramMessage.setStatus(TelegramMessageStatus.SENT.getCode());
        telegramMessage.setSendAt(LocalDateTime.now());
        telegramMessageRepository.save(telegramMessage);
        return true;
    }

    public TelegramMessageSimpleResponse updateReceivers(String id, List<String> listReceiver) {
        TelegramMessage telegramMessage = telegramMessageRepository.findByIdFetchReceivers(id)
                        .filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));

        if (telegramMessage.getStatus() != TelegramMessageStatus.DRAFT.getCode()) {
            throw new AppException(ErrorCode.NOT_DRAFT_MESSAGE);
        }

        Set<User> receivers = new HashSet<>();
        if (!listReceiver.isEmpty()) {
            for (String userId : listReceiver) {
                userRepository.findById(userId).filter(u -> u.getStatus() >= UserStatus.CONFIRMED.getCode())
                        .ifPresent(r -> {
                            if (r.getTelegramId() != null) {
                                receivers.add(r);
                            }
                        });
            }
        }

        telegramMessage.setReceivers(receivers);
        return telegramMessageMapper.toSimpleResponse(telegramMessageRepository.save(telegramMessage));
    }

    public TelegramMessageSimpleResponse updateMessage(String id, TelegramMessageCreationRequest request) {
        TelegramMessage telegramMessage = telegramMessageRepository.findById(id)
                .filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));

        if (telegramMessage.getStatus() != TelegramMessageStatus.DRAFT.getCode()) {
            throw new AppException(ErrorCode.NOT_DRAFT_MESSAGE);
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorCode.BLANK_TITLE);
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new AppException(ErrorCode.BLANK_CONTENT);
        }

        telegramMessage.setTitle(request.getTitle().trim());
        telegramMessage.setMessage(request.getMessage().trim());

        return telegramMessageMapper.toSimpleResponse(telegramMessageRepository.save(telegramMessage));
    }

    public Boolean deleteTelegramMessage(String id) {
        TelegramMessage message = telegramMessageRepository.findById(id)
                .filter(t -> t.getStatus() != TelegramMessageStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.TELEGRAM_MESSAGE_NOT_EXIST));

        message.setStatus(TelegramMessageStatus.DELETED.getCode());
        telegramMessageRepository.save(message);
        return true;
    }

}
