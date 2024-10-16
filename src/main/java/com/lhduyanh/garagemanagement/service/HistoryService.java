package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.configuration.SecurityExpression;
import com.lhduyanh.garagemanagement.dto.request.HistoryCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryUserUpdate;
import com.lhduyanh.garagemanagement.dto.response.HistoryResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.entity.Car;
import com.lhduyanh.garagemanagement.entity.DetailHistory;
import com.lhduyanh.garagemanagement.entity.History;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.HistoryMapper;
import com.lhduyanh.garagemanagement.repository.CarRepository;
import com.lhduyanh.garagemanagement.repository.HistoryRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    AuthenticationService authenticationService;
    SecurityExpression securityExpression;

    HistoryRepository historyRepository;
    CarRepository carRepository;
    UserRepository userRepository;

    HistoryMapper historyMapper;

    public List<HistoryResponse> getAllHistoryByCarId(String id) {
        List<HistoryResponse> response = historyRepository.findAllHistoryByCarId(id)
                .stream()
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .map(historyMapper::toHistoryResponse)
                .toList();

        return response;
    }

    public HistoryWithDetailsResponse getHistoryById(String id) {
        HistoryWithDetailsResponse response = historyMapper.toHistoryWithDetailsResponse(historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS)));

        return response;
    }

    @Transactional
    public HistoryResponse newHistory(HistoryCreationRequest request) {
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        List<History> histories = historyRepository.findAllHistoryByCarId(request.getCarId())
                .stream()
                .filter(h -> h.getStatus() == HistoryStatus.PROCEEDING.getCode())
                .toList();

        if (!histories.isEmpty()) {
            throw new AppException(ErrorCode.CAR_IN_SERVICE);
        }

        User advisor = userRepository.findById(request.getAdvisorId())
                .filter(u -> securityExpression.hasPermission(u.getId(), List.of("SIGN_SERVICE", "UPDATE_PROGRESS", "CANCEL_SERVICE")))
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ADVISOR));

        History history = new History();

        history.setCar(car);
        history.setAdvisor(advisor);
        history.setServiceDate(LocalDateTime.now());
        history.setTotalAmount(0.0);
        history.setDiscount(0.0f);
        history.setPayableAmount(0.0);
        history.setStatus(HistoryStatus.PROCEEDING.getCode());

        return historyMapper.toHistoryResponse(historyRepository.save(history));
    }

    @Transactional
    public HistoryResponse updateCustomer(HistoryUserUpdate request) {
        History history = historyRepository.findById(request.getHistoryId())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() == HistoryStatus.PAID.getCode()) {
            throw new AppException(ErrorCode.PAID_HISTORY);
        }

        User newCustomer = userRepository.findById(request.getUserId())
                .filter(user -> user.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Car car = carRepository.findById(history.getCar().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));


        if (car.getUsers().stream().noneMatch(user -> user.getId().equals(newCustomer.getId()))) {
            if (!request.getIsConfirm()) {
                throw new AppException(ErrorCode.ASSIGN_MANAGER_WARNING);
            } else {
                Set<User> u = car.getUsers();
                if (!u.contains(newCustomer)){
                    newCustomer.getCars().add(car);
                    userRepository.save(newCustomer);
                }
            }
        }

        history.setCustomer(newCustomer);
        return historyMapper.toHistoryResponse(historyRepository.save(history));
    }

    @Transactional
    public Boolean updateHistoryById(String id) {
        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() == HistoryStatus.PAID.getCode()){
            throw new AppException(ErrorCode.PAID_HISTORY);
        } else if (history.getStatus() == HistoryStatus.CANCELED.getCode()){
            throw new AppException(ErrorCode.CANCELED_HISTORY);
        }

        Double totalAmount = 0.0;
        for (DetailHistory detail : history.getDetails()) {
            totalAmount += detail.getFinalPrice();
        }
        history.setTotalAmount(totalAmount);

        Double payableAmount = totalAmount - (totalAmount * (history.getDiscount() / 100));
        history.setPayableAmount(payableAmount);
        return historyRepository.save(history) != null;
    }
}
