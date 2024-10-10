package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.OptionUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.OptionFullResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.enums.OptionStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.OptionMapper;
import com.lhduyanh.garagemanagement.repository.OptionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OptionService {

    OptionRepository optionRepository;
    OptionMapper optionMapper;
    PriceService priceService;

    public List<OptionSimpleResponse> getAllEnableOption() {
        return optionRepository.findAllByStatus(OptionStatus.USING.getCode())
                .stream()
                .map(optionMapper::toSimpleResponse)
                .sorted(Comparator.comparing(OptionSimpleResponse::getName))
                .toList();
    }

    public List<OptionSimpleResponse> getAllOption() {
        return optionRepository.findAll()
                .stream()
                .map(optionMapper::toSimpleResponse)
                .sorted(Comparator.comparing(OptionSimpleResponse::getName))
                .toList();
    }

    public List<OptionFullResponse> getAllOptionWithPrice() {
        return optionRepository.findAll()
                .stream()
                .map(optionMapper::toOptionFullResponse)
                .toList();
    }

    public OptionSimpleResponse newOption(OptionCreationRequest request) {
        if (optionRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.OPTION_EXISTED);
        }
        Options options = optionMapper.toOption(request);
        return optionMapper.toSimpleResponse(
                optionRepository.save(options)
        );
    }

    public OptionFullResponse getOptionById(String id) {
        return optionMapper.toOptionFullResponse(
                optionRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS))
        );
    }

    public OptionSimpleResponse updateOption(String id, OptionUpdateRequest request) {
        Options options = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_EXISTED));

        optionMapper.updateOption(options, request);
        return optionMapper.toSimpleResponse(optionRepository.save(options));
    }

    public boolean enableOption(String id) {
        Options options = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));
        options.setStatus(OptionStatus.USING.getCode());
        optionRepository.save(options);
        return true;
    }

    public boolean disableOption(String id) {
        Options options = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));
        options.setStatus(OptionStatus.NOT_USE.getCode());
        optionRepository.save(options);
        return true;
    }

    @Transactional
    public boolean deleteOption(String id) {
        Options option = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

        priceService.clearPriceByOption(option);
        optionRepository.delete(option);
        return true;
    }

}
