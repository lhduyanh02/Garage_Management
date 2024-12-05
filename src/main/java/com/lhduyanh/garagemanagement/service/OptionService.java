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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class OptionService {

    OptionRepository optionRepository;
    OptionMapper optionMapper;
    PriceService priceService;
    private final Collator vietnameseCollator;

    public List<OptionSimpleResponse> getAllEnableOption() {
        return optionRepository.findAllByStatus(OptionStatus.USING.getCode())
                .stream()
                .map(optionMapper::toSimpleResponse)
                .sorted(Comparator.comparing(OptionSimpleResponse::getName, vietnameseCollator))
                .toList();
    }

    public List<OptionSimpleResponse> getAllOption() {
        return optionRepository.findAll()
                .stream()
                .map(optionMapper::toSimpleResponse)
                .sorted(Comparator.comparing(OptionSimpleResponse::getName, vietnameseCollator))
                .toList();
    }

    public List<OptionFullResponse> getAllOptionWithPrice() {
        return optionRepository.findAll().stream()
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                .map(optionMapper::toOptionFullResponse)
                .sorted(Comparator.comparing(OptionFullResponse::getName, vietnameseCollator))
                .toList();
    }

    public OptionSimpleResponse newOption(OptionCreationRequest request) {
        List<Options> options = optionRepository.findAllByName(request.getName())
                .stream()
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                .toList();
        if (options.size() > 0) {
            throw new AppException(ErrorCode.OPTION_EXISTED);
        }

        Options option = optionMapper.toOption(request);
        return optionMapper.toSimpleResponse(
                optionRepository.save(option)
        );
    }

    public OptionFullResponse getOptionById(String id) {
        return optionMapper.toOptionFullResponse(
                optionRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS))
        );
    }

    public OptionSimpleResponse updateOption(String id, OptionUpdateRequest request) {
        Options option = optionRepository.findById(id)
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_EXISTED));

        List<Options> options = optionRepository.findAllByName(request.getName())
                .stream()
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode() && o.getId().equals(id))
                .toList();
        if (options.size() > 0) {
            throw new AppException(ErrorCode.OPTION_EXISTED);
        }

        optionMapper.updateOption(option, request);
        Options response = optionRepository.save(option);
        log.info(response.getName());
        return optionMapper.toSimpleResponse(response);
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
        option.setStatus(OptionStatus.DELETED.getCode());
        optionRepository.save(option);
        return true;
    }

}
