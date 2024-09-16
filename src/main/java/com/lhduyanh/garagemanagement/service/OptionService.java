package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.OptionUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.OptionSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.OptionMapper;
import com.lhduyanh.garagemanagement.repository.OptionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OptionService {

    OptionRepository optionRepository;
    OptionMapper optionMapper;

    public List<OptionSimpleResponse> getAllEnableOption() {
        return optionRepository.findAllByStatus(1)
                .stream()
                .map(optionMapper::toSimpleResponse)
                .toList();
    }

    public List<OptionSimpleResponse> getAllOption() {
        return optionRepository.findAll()
                .stream()
                .map(optionMapper::toSimpleResponse)
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

    public OptionSimpleResponse getOptionById(String id) {
        return optionMapper.toSimpleResponse(
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

    public void enableOption(String id) {
        Options options = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));
        options.setStatus(1);
        optionRepository.save(options);
    }

    public void unableOption(String id) {
        Options options = optionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));
        options.setStatus(0);
        optionRepository.save(options);
    }

}
