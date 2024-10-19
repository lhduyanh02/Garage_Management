package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.DetailHistoryCreation;
import com.lhduyanh.garagemanagement.dto.response.DetailHistoryResponse;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.enums.OptionStatus;
import com.lhduyanh.garagemanagement.enums.ServiceStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.DetailHistoryMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

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

    DetailHistoryMapper detailHistoryMapper;
    private final HistoryService historyService;

    @Transactional
    public DetailHistoryResponse newDetailHistory(DetailHistoryCreation request) {
        DetailHistory detailHistory = new DetailHistory();

        if (request.getDiscount() < 0 || request.getDiscount() > 100) {
            throw new AppException(ErrorCode.DISCOUNT_RANGE);
        }
        Float discount = (float) Math.round(request.getDiscount());
        request.setDiscount(discount);
        detailHistory.setDiscount(discount);

        if (request.getQuantity() < 1) {
            throw new AppException(ErrorCode.QUANTITY_RANGE);
        }
        detailHistory.setQuantity(request.getQuantity());

        History history = historyRepository.findByIdFetchDetails(request.getHistoryId())
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() == HistoryStatus.PAID.getCode()){
            throw new AppException(ErrorCode.PAID_HISTORY);
        } else if (history.getStatus() == HistoryStatus.CANCELED.getCode()){
            throw new AppException(ErrorCode.CANCELED_HISTORY);
        }
        detailHistory.setHistory(history);

//         Kiểm tra trùng lặp service-option-discount -> gộp chung lại
        for (DetailHistory d : history.getDetails()) {
            if (d.getService().getId().equals(request.getServiceId()) &&
                d.getOption().getId().equals(request.getOptionId()) &&
                Objects.equals(d.getDiscount(), request.getDiscount()))
            {
                log.info("TRÙNG LẶP OPTION " + d.getServiceName() +" - "+ d.getOptionName());
                detailHistory = d;
                detailHistory.setQuantity(request.getQuantity() + d.getQuantity());
                break;
            }
        }

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

        var response = detailHistoryRepository.save(detailHistory);
        history.getDetails().add(response);
        historyRepository.save(history);

        if (!historyService.updateHistoryById(history.getId())) {
            throw new AppException(ErrorCode.UPDATE_HISTORY_ERROR);
        }

        return detailHistoryMapper.toResponse(response);
    }

}
