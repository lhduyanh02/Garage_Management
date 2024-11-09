package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.entity.CommonParameter;
import com.lhduyanh.garagemanagement.repository.CommonParameterRepository;
import com.lhduyanh.garagemanagement.service.AppointmentService;
import com.lhduyanh.garagemanagement.service.HistoryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Enumeration;

@RestController
@RequestMapping("/telegram")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class TelegramController {

    HistoryService historyService;
    AppointmentService appointmentService;
    CommonParameterRepository commonParameterRepository;

    @NonFinal
    @Value("${app.telegram-host}")
    String TELEGRAM_HOST;

    @GetMapping("/get-today-appointment/{chatId}")
    public String getTodayAppointment(@PathVariable Long chatId, HttpServletRequest request) {
        String communicationKey = commonParameterRepository.findByKey("TELEGRAM_COMMUNICATION_KEY").get().getValue();

        String keyHeader = request.getHeader("Communication-Key");
        log.info(communicationKey);
        log.info(keyHeader);

        if (keyHeader == null || !keyHeader.equals(communicationKey)) {
            return "This is Telegram host only request!";
        }


        // Đầu ngày hôm nay
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        // Cuối ngày hôm nay
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59, 999999999);

        return appointmentService.getAllAppointmentsByTimeRangeTelegram(startOfDay, endOfDay, chatId);

    }


}
