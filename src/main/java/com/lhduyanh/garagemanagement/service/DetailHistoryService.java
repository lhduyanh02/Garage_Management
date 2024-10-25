package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.DetailHistoryRequest;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.enums.OptionStatus;
import com.lhduyanh.garagemanagement.enums.ServiceStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class DetailHistoryService {

    DetailHistoryRepository detailHistoryRepository;
    HistoryRepository historyRepository;
    ServiceRepository serviceRepository;
    OptionRepository optionRepository;
    PriceRepository priceRepository;

    HistoryService historyService;

    public List<DetailHistoryRequest> mergeDetails(List<DetailHistoryRequest> request) {
        // Nhóm các detail theo serviceId, optionId và discount
        Map<String, DetailHistoryRequest> mergedDetails = new HashMap<>();

        for (DetailHistoryRequest detail : request) {
            Float roundedDiscount = Math.round(detail.getDiscount() * 100) / 100.0f;
            detail.setDiscount(roundedDiscount);

            String key = detail.getServiceId() + "-" + detail.getOptionId() + "-" + detail.getDiscount();

            if (mergedDetails.containsKey(key)) {
                DetailHistoryRequest existingDetail = mergedDetails.get(key);
                existingDetail.setQuantity(existingDetail.getQuantity() + detail.getQuantity());
            } else {
                mergedDetails.put(key, detail);
            }
        }

        return new ArrayList<>(mergedDetails.values());
    }

    @Transactional
    public void newDetailHistory(History history, DetailHistoryRequest request) {
        log.info(String.valueOf(history.getDetails().size()));
        DetailHistory detailHistory = new DetailHistory();

        if (request.getDiscount() < 0 || request.getDiscount() > 100) {
            throw new AppException(ErrorCode.DISCOUNT_RANGE);
        }
        Float discount = Math.round(request.getDiscount() * 100) / 100.0f;
        request.setDiscount(discount);
        detailHistory.setDiscount(discount);

        if (request.getQuantity() < 1) {
            throw new AppException(ErrorCode.QUANTITY_RANGE);
        }
        detailHistory.setQuantity(request.getQuantity());

        if (history.getStatus() == HistoryStatus.PAID.getCode()){
            throw new AppException(ErrorCode.PAID_HISTORY);
        } else if (history.getStatus() == HistoryStatus.CANCELED.getCode()){
            throw new AppException(ErrorCode.CANCELED_HISTORY);
        }
        detailHistory.setHistory(history);

        Service service = serviceRepository.findById(request.getServiceId())
                .filter(s -> s.getStatus() != ServiceStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        if (service.getStatus() == ServiceStatus.NOT_USE.getCode()){
            throw new AppException(ErrorCode.SERVICE_NOT_IN_USE);
        }
        detailHistory.setService(service);
        detailHistory.setServiceName(service.getName());

        Options option = optionRepository.findById(request.getOptionId())
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

        if (option.getStatus() == OptionStatus.NOT_USE.getCode()){
            throw new AppException(ErrorCode.OPTION_NOT_IN_USE);
        }
        detailHistory.setOption(option);
        detailHistory.setOptionName(option.getName());

        PriceId priceId = PriceId.builder().serviceId(service.getId()).optionId(option.getId()).build();
        Price priceEntity = priceRepository.findById(priceId)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_EXIST));

        Double price = priceEntity.getPrice();
        detailHistory.setPrice(price);

        Double finalPrice = (double) Math.round((price - (price * (discount / 100))) * detailHistory.getQuantity());
        detailHistory.setFinalPrice(finalPrice);

        detailHistoryRepository.save(detailHistory);
        history.getDetails().add(detailHistory);
        historyRepository.save(history);
    }

    @Transactional
    public HistoryWithDetailsResponse updateListDetailHistory(String historyId, List<DetailHistoryRequest> request) {
        if(request == null || request.isEmpty()){
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        if (historyId == null || historyId == "") {
            throw new AppException(ErrorCode.BLANK_HISTORY);
        }

        History history = historyRepository.findByIdFetchDetails(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        detailHistoryRepository.deleteAll(history.getDetails());
        history.getDetails().clear();
        historyRepository.save(history);

        List<DetailHistoryRequest> mergedDetails = mergeDetails(request);

        for (DetailHistoryRequest detail : mergedDetails) {
            newDetailHistory(history, detail);
        }

        return historyService.updateHistoryById(history.getId());
    }

    @Transactional
    public HistoryWithDetailsResponse deleteAllDetailsByHistoryId(String id) {
        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        detailHistoryRepository.deleteAll(history.getDetails());
        history.getDetails().clear();
        historyRepository.save(history);


        return historyService.updateHistoryById(id);
    }

    @Transactional
    public HistoryWithDetailsResponse deleteDetailFromHistory(String historyId, String detailId) {
        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        DetailHistory detail = detailHistoryRepository.findById(detailId)
                .orElseThrow(() -> new AppException(ErrorCode.DETAIL_NOT_EXIST));

        detailHistoryRepository.delete(detail);
        history.getDetails().remove(detail);
        historyRepository.save(history);

        return historyService.updateHistoryById(historyId);
    }

}
