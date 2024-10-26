package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.ImageUploadRequest;
import com.lhduyanh.garagemanagement.dto.response.ImageResponse;
import com.lhduyanh.garagemanagement.entity.History;
import com.lhduyanh.garagemanagement.entity.PostServiceImage;
import com.lhduyanh.garagemanagement.entity.PreServiceImage;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.ImageMapper;
import com.lhduyanh.garagemanagement.repository.HistoryRepository;
import com.lhduyanh.garagemanagement.repository.PostServiceImageRepository;
import com.lhduyanh.garagemanagement.repository.PreServiceImageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ImageService {

    PreServiceImageRepository preImgRepository;
    PostServiceImageRepository postImgRepository;
    HistoryRepository historyRepository;

    CommonParameterService commonParameterService;

    ImageMapper imageMapper;

    public List<ImageResponse> getServiceImageByHistoryId(String id, boolean isPreService) {
        if (isPreService) {
            return preImgRepository.findAllByHistoryId(id)
                    .stream()
                    .map(imageMapper::toImageResponse)
                    .toList();
        } else {
            return postImgRepository.findAllByHistoryId(id)
                    .stream()
                    .map(imageMapper::toImageResponse)
                    .toList();
        }
    }

    public List<ImageResponse> addMoreServiceImage (String historyId, List<ImageUploadRequest> request, boolean isPreService) {
        if (request == null || request.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_IMAGE_LIST);
        }

        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        Integer numberImage = Integer.valueOf(commonParameterService
                .getCommonParameterByKey("NUMBER_OF_SERVICE_IMAGE").getValue());

        if (isPreService) {
            List<PreServiceImage> images = preImgRepository.findAllByHistoryId(historyId);

            if ((images.size() + request.size()) > numberImage) {
                throw new AppException(ErrorCode.MAX_SIZE_IMAGE_LIST);
            }

            for (ImageUploadRequest image : request) {
                if (image.getImage() == null) {
                    continue;
                }
                PreServiceImage img = new PreServiceImage();
                img.setTitle(image.getTitle());
                img.setHistoryId(history.getId());
                img.setUploadTime(LocalDateTime.now());
                img.setImage(image.getImage());
                preImgRepository.save(img);
            }
            return getServiceImageByHistoryId(historyId, true);
        }
        else {
            List<PostServiceImage> images = postImgRepository.findAllByHistoryId(historyId);

            if ((images.size() + request.size()) > numberImage) {
                throw new AppException(ErrorCode.MAX_SIZE_IMAGE_LIST);
            }

            for (ImageUploadRequest image : request) {
                if (image.getImage() == null) {
                    continue;
                }
                PostServiceImage img = new  PostServiceImage();
                img.setTitle(image.getTitle());
                img.setHistoryId(history.getId());
                img.setUploadTime(LocalDateTime.now());
                img.setImage(image.getImage());
                postImgRepository.save(img);
            }
            return getServiceImageByHistoryId(historyId, false);
        }
    }

    public List<ImageResponse> updateServiceImageList(String historyId, List<ImageUploadRequest> request, boolean isPreService) {
        if (request == null || request.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_IMAGE_LIST);
        }

        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        Integer numberImage = Integer.valueOf(commonParameterService
                .getCommonParameterByKey("NUMBER_OF_SERVICE_IMAGE").getValue());

        if (request.size() == 0) {
            throw new AppException(ErrorCode.EMPTY_IMAGE_LIST);
        } else if (request.size() > numberImage) { // replace by common parameter
            throw new AppException(ErrorCode.MAX_SIZE_IMAGE_LIST);
        }

        if(isPreService){
            List<PreServiceImage> deleteImg = preImgRepository.findAllByHistoryId(history.getId());
            List<PreServiceImage> images = new ArrayList<>();

            for (ImageUploadRequest image : request) {
                if (image.getImage() == null) {
                    continue;
                }
                PreServiceImage img = new PreServiceImage();
                img.setTitle(image.getTitle());
                img.setHistoryId(history.getId());
                img.setUploadTime(LocalDateTime.now());
                img.setImage(image.getImage());
                images.add(preImgRepository.save(img));
            }
            if (history.getStatus() == HistoryStatus.PROCEEDING.getCode()) {
                preImgRepository.deleteAll(deleteImg);
            }
            return images.stream().map(imageMapper::toImageResponse).toList();
        }
        else {
            List<PostServiceImage> deleteImg = postImgRepository.findAllByHistoryId(history.getId());
            List<PostServiceImage> images = new ArrayList<>();

            for (ImageUploadRequest image : request) {
                if (image.getImage() == null) {
                    continue;
                }
                PostServiceImage img = new PostServiceImage();
                img.setTitle(image.getTitle());
                img.setHistoryId(history.getId());
                img.setUploadTime(LocalDateTime.now());
                img.setImage(image.getImage());
                images.add(postImgRepository.save(img));
            }
            if (history.getStatus() == HistoryStatus.PROCEEDING.getCode()) {
                postImgRepository.deleteAll(deleteImg);
            }
            return images.stream().map(imageMapper::toImageResponse).toList();
        }
    }

    public Boolean deleteAllImagesByHistoryId(String historyId, boolean isPreService) {
        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()) {
            throw new AppException(ErrorCode.DELETE_IMAGE_INVALID_HISTORY);
        }

        if (isPreService){
            List<PreServiceImage> images = preImgRepository.findAllByHistoryId(historyId);
            preImgRepository.deleteAll(images);

        } else {
            List<PostServiceImage> images = postImgRepository.findAllByHistoryId(historyId);
            postImgRepository.deleteAll(images);
        }

        return true;
    }

}
