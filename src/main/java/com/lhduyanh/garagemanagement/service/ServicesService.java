package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.OptionPriceRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.OptionMapper;
import com.lhduyanh.garagemanagement.mapper.ServiceMapper;
import com.lhduyanh.garagemanagement.repository.OptionRepository;
import com.lhduyanh.garagemanagement.repository.ServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import com.lhduyanh.garagemanagement.entity.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ServicesService {

    ServiceRepository serviceRepository;
    ServiceMapper serviceMapper;
    OptionRepository optionRepository;
    OptionMapper optionMapper;

    public ServiceSimpleResponse getServiceById(String id) {
        return serviceMapper.toSimpleResponse(
                serviceRepository.findById(id).orElseThrow(
                        () -> new AppException(ErrorCode.SERVICE_NOT_EXISTS)));
    }

//    public List<ServiceFullResponse> getAllEnableServices() {
//        return optionRepository.findAllEnableServiceWithClass()
//                .stream()
//                .map(optionMapper::toServiceFullResponse)
//                .toList();
//    }

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

    public ServiceResponse newService(ServiceCreationRequest request, boolean sure) {
        if (!sure) {
            Optional<Service> serv = serviceRepository.findByName(request.getName());
            if(serv.isPresent() && serv.get().getStatus() != -1) {
                throw new AppException(ErrorCode.SERVICE_NAME_EXISTED);
            }
        }

        Service service = serviceMapper.toService(request);
        List<Price> prices = new ArrayList<>();

        for (OptionPriceRequest optPrice : request.getListOptionPrices()) {
            // Duyệt qua từng cặp option_id và price trong request để kiểm tra status và thêm vào list Price
            Options options = optionRepository.findById(optPrice.getOptionId())
                    .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

            Price price = new Price();
            if (options.getStatus() == 1) {
                price.setService(service);
                price.setOptions(options);
                price.setPrice(optPrice.getPrice());
                prices.add(price);
            }
        }
        if (prices.isEmpty()) {
            throw new AppException(ErrorCode.NULL_OPTION);
        }
        service.setPrices(prices);

        return serviceMapper.toServiceResponse(serviceRepository.save(service));
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
