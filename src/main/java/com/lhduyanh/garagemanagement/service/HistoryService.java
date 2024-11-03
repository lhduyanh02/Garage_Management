package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.configuration.SecurityExpression;
import com.lhduyanh.garagemanagement.dto.request.HistoryCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryInfoUpdateRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryUserUpdate;
import com.lhduyanh.garagemanagement.dto.response.HistoryResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.CarStatus;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.HistoryMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    SecurityExpression securityExpression;

    HistoryRepository historyRepository;
    CarRepository carRepository;
    UserRepository userRepository;
    PriceRepository priceRepository;
    CommonParameterRepository commonParameterRepository;

    HistoryMapper historyMapper;

    public List<HistoryResponse> getAllHistoryByCarId(String id) {
        List<HistoryResponse> response = historyRepository.findAllHistoryByCarId(id)
                .stream()
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .map(historyMapper::toHistoryResponse)
                .toList();

        return response;
    }

    public List<HistoryResponse> customerGetAllHistoryByCarId(String id) {
        String uid = getUUIDFromJwt();

        List<Car> cars = carRepository.findAllByManager(uid);
        boolean hasCar = cars.stream().anyMatch(c -> c.getId().equals(id));

        if (!hasCar) {
            throw new AppException(ErrorCode.USER_NOT_MANAGE_CAR);
        }

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

    public HistoryWithDetailsResponse customerGetHistoryById(String id) {
        String uid = getUUIDFromJwt();

        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        String carID = history.getCar().getId();

        List<Car> cars = carRepository.findAllByManager(uid);

        boolean hasCar = cars.stream().anyMatch(c -> c.getId().equals(carID));

        if (!hasCar) {
            throw new AppException(ErrorCode.USER_NOT_MANAGE_CAR);
        }

        HistoryWithDetailsResponse response = historyMapper.toHistoryWithDetailsResponse(history);

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

        CommonParameter tax = commonParameterRepository.findByKey("TAX")
                .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));

        History history = new History();

        history.setCar(car);
        history.setAdvisor(advisor);
        history.setServiceDate(LocalDateTime.now());
        history.setTotalAmount(0.0);
        history.setDiscount(0.0f);
        history.setTax(Float.parseFloat(tax.getValue()));
        history.setPayableAmount(0.0);
        history.setStatus(HistoryStatus.PROCEEDING.getCode());

        return historyMapper.toHistoryResponse(historyRepository.save(history));
    }

    @Transactional
    public HistoryResponse updateCustomer(HistoryUserUpdate request) {
        History history = historyRepository.findById(request.getHistoryId())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() == HistoryStatus.PAID.getCode() ||
                history.getStatus() == HistoryStatus.CANCELED.getCode()) {
            throw new AppException(history.getStatus() == HistoryStatus.PAID.getCode() ?
                    ErrorCode.PAID_HISTORY : ErrorCode.CANCELED_HISTORY);
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
    public HistoryWithDetailsResponse updateHistoryById(String id) {
        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() == HistoryStatus.PAID.getCode()){
            throw new AppException(ErrorCode.PAID_HISTORY);
        } else if (history.getStatus() == HistoryStatus.CANCELED.getCode()){
            throw new AppException(ErrorCode.CANCELED_HISTORY);
        }

        Double totalAmount = 0.0;
        Set<DetailHistory> updatedDetails = new HashSet<>();
        for (DetailHistory detail : history.getDetails()) {
            try {
                detail.setServiceName(detail.getService().getName());
                detail.setOptionName(detail.getOption().getName());

                if (detail.getQuantity() < 1) throw new AppException(ErrorCode.QUANTITY_RANGE);

                PriceId priceId = PriceId.builder()
                        .serviceId(detail.getService().getId())
                        .optionId(detail.getOption().getId())
                        .build();
                Price priceEntity = priceRepository.findById(priceId)
                        .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_EXIST));

                Double price = priceEntity.getPrice();
                detail.setPrice(price);
                Double finalPrice = (double) Math.round((price - (price * (detail.getDiscount() / 100))) * detail.getQuantity());
                detail.setFinalPrice(finalPrice);

                updatedDetails.add(detail);
                totalAmount += detail.getFinalPrice();
            } catch (AppException e) {
                log.warn("SKIP 1 PRICE" +detail.getServiceName() +" - "+ detail.getOptionName());
                continue;
            }
        }
        history.setDetails(updatedDetails);
        history.setTotalAmount(totalAmount);

        Double payableAmount = totalAmount + (totalAmount * (history.getTax() / 100)) - (totalAmount * (history.getDiscount() / 100));
        history.setPayableAmount(payableAmount);
        historyRepository.save(history);
        return historyMapper.toHistoryWithDetailsResponse(history);
    }

    @Transactional
    public HistoryWithDetailsResponse updateHistoryInfo(String historyId, HistoryInfoUpdateRequest request) {
        if (historyId == null || historyId == "") {
            throw new AppException(ErrorCode.BLANK_HISTORY);
        }
        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (request.getDiscount() == null) {
            request.setDiscount(0.0f);
        }

        Float roundedDiscount = Math.round(request.getDiscount() * 100) / 100.0f;

        if (request.getTax() == null) {
            CommonParameter tax = commonParameterRepository.findByKey("TAX")
                    .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));
            request.setTax(Float.parseFloat(tax.getValue()));
        }

        history.setSummary(request.getSummary().trim());
        history.setDiagnose(request.getDiagnose().trim());
        history.setDiscount(roundedDiscount);
        history.setTax(request.getTax());
        history.setOdo(request.getOdo());
        historyRepository.save(history);
        return updateHistoryById(history.getId());
    }

    @Transactional
    public HistoryWithDetailsResponse closeHistory(String id, boolean isPaid) {
        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()) {
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        updateHistoryById(history.getId());
        history.setStatus(isPaid ? HistoryStatus.PAID.getCode() : HistoryStatus.CANCELED.getCode());
        historyRepository.save(history);
        return historyMapper.toHistoryWithDetailsResponse(history);
    }
}
