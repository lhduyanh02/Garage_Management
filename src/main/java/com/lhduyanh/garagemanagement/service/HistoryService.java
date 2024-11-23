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
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

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

    public Long getHistoryQuantity() {
        return historyRepository.getHistoryQuantity();
    }

    public List<HistoryResponse> getAllHistoryByCarId(String id) {
        List<HistoryResponse> response = historyRepository.findAllHistoryByCarId(id)
                .stream()
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .map(historyMapper::toHistoryResponse)
                .sorted(Comparator.comparing(HistoryResponse::getServiceDate).reversed())
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

    public List<HistoryResponse> getAllHistoryByTimeRange(LocalDateTime start, LocalDateTime end, Integer status) {
        return historyRepository.getAllHistoryByTimeRange(start, end, status)
                .stream()
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .map(historyMapper::toHistoryResponse)
                .sorted(Comparator.comparing(HistoryResponse::getServiceDate).reversed())
                .toList();
    }

    // Bieu do 7 ngay gan nhat
    public Map<LocalDate, Double> getDailyRevenue(LocalDateTime start, LocalDateTime end) {
        // Lấy giờ bắt đầu của ngày start và giờ kết thúc của ngày end
        LocalDateTime startOfDay = start.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = end.toLocalDate().atTime(LocalTime.MAX);

        // Gọi repository để lấy dữ liệu
        List<Object[]> rawData = historyRepository.findDailyRevenue(startOfDay, endOfDay);

        // Chuyển dữ liệu từ database sang Map
        Map<LocalDate, Double> revenueMap = rawData.stream()
                .collect(Collectors.toMap(
                        row -> ((java.sql.Date) row[0]).toLocalDate(), // Chuyển ngày từ Object
                        row -> row[1] != null ? (Double) row[1] : 0.0 // Tổng doanh thu
                ));

        // Tạo danh sách ngày từ start đến end
        Map<LocalDate, Double> result = new LinkedHashMap<>();
        LocalDate current = startOfDay.toLocalDate();
        LocalDate last = endOfDay.toLocalDate();

        while (!current.isAfter(last)) {
            result.put(current, revenueMap.getOrDefault(current, 0.0));
            current = current.plusDays(1);
        }

        return result;
    }

    public List<HistoryResponse> getAllProceedingHistory() {
        List<HistoryResponse> response = historyRepository.getAllHistoryByStatus(HistoryStatus.PROCEEDING.getCode())
                .stream()
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .map(historyMapper::toHistoryResponse)
                .sorted(Comparator.comparing(HistoryResponse::getServiceDate).reversed())
                .toList();

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
                .filter(u -> securityExpression.hasPermission(u.getId(), List.of("SIGN_SERVICE", "CANCEL_SERVICE")))
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

    public Boolean deleteHistory(String id) {
        History history = historyRepository.findById(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PAID.getCode() &&
            history.getStatus() != HistoryStatus.CANCELED.getCode()) {
            throw new AppException(ErrorCode.HISTORY_CANNOT_DELETE);
        }

        history.setStatus(HistoryStatus.DELETED.getCode());
        historyRepository.save(history);
        return true;
    }
}
