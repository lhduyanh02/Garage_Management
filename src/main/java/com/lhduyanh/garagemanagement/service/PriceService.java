package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.response.PriceResponse;
import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.entity.Service;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.PriceMapper;
import com.lhduyanh.garagemanagement.repository.OptionRepository;
import com.lhduyanh.garagemanagement.repository.PriceRepository;
import com.lhduyanh.garagemanagement.repository.ServiceRepository;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class PriceService {
    PriceRepository priceRepository;
    ServiceRepository serviceRepository;
    OptionRepository optionRepository;

    PriceMapper priceMapper;

    public PriceResponse getAllPriceByServiceId(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        Price price = priceRepository.findByService(service)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_EXIST));
        return priceMapper.toPriceResponse(price);
    }


}
