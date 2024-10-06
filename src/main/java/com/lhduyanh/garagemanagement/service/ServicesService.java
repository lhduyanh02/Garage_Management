package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.OptionPriceRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.entity.PriceId;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.OptionMapper;
import com.lhduyanh.garagemanagement.mapper.ServiceMapper;
import com.lhduyanh.garagemanagement.repository.OptionRepository;
import com.lhduyanh.garagemanagement.repository.PriceRepository;
import com.lhduyanh.garagemanagement.repository.ServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import com.lhduyanh.garagemanagement.entity.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class ServicesService {

    ServiceRepository serviceRepository;
    ServiceMapper serviceMapper;
    OptionRepository optionRepository;
    PriceRepository priceRepository;

    public ServiceResponse getServiceById(String id) {
        return serviceMapper.toServiceResponse(
                serviceRepository.findById(id).orElseThrow(
                        () -> new AppException(ErrorCode.SERVICE_NOT_EXISTS)));
    }

    public List<ServiceResponse> getAllServicesWithPrice() {
        return serviceRepository.findAll()
                .stream()
                .map(serviceMapper::toServiceResponse)
                .toList();
    }

    public List<ServiceSimpleResponse> getAllEnableServices() {
        return serviceRepository.findAllEnableService()
                .stream()
                .map(serviceMapper::toSimpleResponse)
                .toList();
    }

    public List<ServiceSimpleResponse> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(serviceMapper::toSimpleResponse)
                .toList();
    }

    @Transactional
    public ServiceResponse newService(ServiceCreationRequest request, boolean sure) {
        if (!sure) {
            Optional<Service> serv = serviceRepository.findByName(request.getName());
            if(serv.isPresent() && serv.get().getStatus() != -1) {
                throw new AppException(ErrorCode.SERVICE_NAME_EXISTED);
            }
        }

        Service service = serviceMapper.toService(request);
        service = serviceRepository.save(service);

        List<Price> prices = new ArrayList<>();
        for (OptionPriceRequest optPrice : request.getListOptionPrices()) {
            // Duyệt qua từng cặp option_id và price trong request để kiểm tra status và thêm vào list Price
            Options options = optionRepository.findById(optPrice.getOptionId())
                    .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

            Price price = new Price();
            if (options.getStatus() == 1) {
                price.setId(new PriceId(service.getId(), options.getId()));
                price.setService(service);
                price.setOptions(options);
                price.setPrice(optPrice.getPrice());
                price.setStatus(request.getStatus());
                prices.add(price);
            }
        }
        if (prices.isEmpty()) {
            throw new AppException(ErrorCode.NULL_OPTION);
        }
        else {
            priceRepository.saveAll(prices);
        }
        service.setPrices(prices);

        return serviceMapper.toServiceResponse(service);
    }

//    public ServiceResponse updateService(String id, ServiceUpdateRequest request) {
//        Service service = serviceRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));
//
//        serviceMapper.updateService(service, request);
//
//        Option option = optionRepository.findById(request.getServiceClass())
//                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_CLASS_NOT_EXISTS));
//
//        service.setOption(option);
//        return serviceMapper.toServiceResponse(serviceRepository.save(service));
//    }

    public void deleteService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        service.setStatus(-1);
        serviceRepository.save(service);
    }

    public void unableService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        service.setStatus(0);
        serviceRepository.save(service);
    }

    public void enableService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        service.setStatus(1);
        serviceRepository.save(service);
    }
}
