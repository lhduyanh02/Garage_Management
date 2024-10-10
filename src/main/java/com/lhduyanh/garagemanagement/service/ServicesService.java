package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.OptionPriceRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.entity.PriceId;
import com.lhduyanh.garagemanagement.enums.OptionStatus;
import com.lhduyanh.garagemanagement.enums.ServiceStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
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
import java.util.Comparator;
import java.util.List;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class ServicesService {

    ServiceRepository serviceRepository;
    ServiceMapper serviceMapper;
    OptionRepository optionRepository;
    PriceRepository priceRepository;

    PriceService priceService;

    public ServiceResponse getServiceById(String id) {
        return serviceMapper.toServiceResponse(
                serviceRepository.findById(id).orElseThrow(
                        () -> new AppException(ErrorCode.SERVICE_NOT_EXISTS)));
    }

    public List<ServiceResponse> getAllServicesWithPrice() {
        return serviceRepository.findAll()
                .stream()
                .map(serviceMapper::toServiceResponse)
                .sorted(Comparator.comparing(ServiceResponse::getName).reversed())
                .toList();
    }

    public List<ServiceSimpleResponse> getAllEnableServices() {
        return serviceRepository.findAllEnableService()
                .stream()
                .map(serviceMapper::toSimpleResponse)
                .sorted(Comparator.comparing(ServiceSimpleResponse::getName))
                .toList();
    }

    public List<ServiceSimpleResponse> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(serviceMapper::toSimpleResponse)
                .sorted(Comparator.comparing(ServiceSimpleResponse::getName))
                .toList();
    }

    @Transactional
    public ServiceResponse newService(ServiceCreationRequest request, boolean sure) {
        request.setName(request.getName().trim());
        request.setDescription(request.getDescription().trim());

        if (!sure) {
            List<Service> services = serviceRepository.findByName(request.getName());
            services.forEach(serv -> {
                if(request.getName().equalsIgnoreCase(serv.getName())
                        && serv.getStatus() != ServiceStatus.DELETED.getCode())
                {
                    throw new AppException(ErrorCode.SERVICE_NAME_EXISTED);
                }
            });
        }

        Service service = serviceMapper.toService(request);
        service = serviceRepository.save(service);

        List<Price> prices = new ArrayList<>();
        for (OptionPriceRequest optPrice : request.getListOptionPrices()) {
            // Duyệt qua từng cặp option_id và price trong request để kiểm tra status và thêm vào list Price
            Options options = optionRepository.findById(optPrice.getOptionId())
                    .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

            Price price = new Price();
            if (options.getStatus() == OptionStatus.USING.getCode()) {
                price.setId(new PriceId(service.getId(), options.getId()));
                price.setService(service);
                price.setOptions(options);
                price.setPrice(optPrice.getPrice());
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

    @Transactional
    public ServiceResponse updateService(String id, ServiceUpdateRequest request, boolean sure) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        request.setName(request.getName().trim());
        request.setDescription(request.getDescription().trim());

        if (!sure) {
            List<Service> services = serviceRepository.findByName(request.getName());
            services.forEach(serv -> {
                if(request.getName().equalsIgnoreCase(serv.getName())
                        && serv.getStatus() != ServiceStatus.DELETED.getCode()
                        && !serv.getId().equals(service.getId()))
                {
                    throw new AppException(ErrorCode.SERVICE_NAME_EXISTED);
                }
            });
        }

        serviceMapper.updateService(service, request);
        serviceRepository.save(service);

        if (request.getListOptionPrices().size() < 1){
            throw new AppException(ErrorCode.NULL_OPTION);
        } else {
            priceService.clearPriceByService(service);
        }

        List<Price> prices = new ArrayList<>();
        for (OptionPriceRequest optPrice : request.getListOptionPrices()) {
            // Duyệt qua từng cặp option_id và price trong request để kiểm tra status và thêm vào list Price
            Options options = optionRepository.findById(optPrice.getOptionId())
                    .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

            Price price = new Price();
            if (options.getStatus() == OptionStatus.USING.getCode()) {
                price.setId(new PriceId(service.getId(), options.getId()));
                price.setService(service);
                price.setOptions(options);
                price.setPrice(optPrice.getPrice());
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

    public void deleteService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        List<Price> prices = priceRepository.findAllByService(service);

        if(!prices.isEmpty()){
//            priceRepository.deleteAll(prices);

            service.setStatus(ServiceStatus.DELETED.getCode());
            serviceRepository.save(service);
            return;
        }

        priceRepository.deleteAll(service.getPrices());
        serviceRepository.deleteById(id);
    }

    public boolean disableService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        service.setStatus(ServiceStatus.NOT_USE.getCode());
        serviceRepository.save(service);
        return true;
    }

    public boolean enableService(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        service.setStatus(ServiceStatus.USING.getCode());
        serviceRepository.save(service);
        return true;
    }
}
