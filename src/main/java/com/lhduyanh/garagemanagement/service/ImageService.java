package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.ImageUploadRequest;
import com.lhduyanh.garagemanagement.dto.response.ImageResponse;
import com.lhduyanh.garagemanagement.dto.response.ImageStatisticsResponse;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
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

    public ImageStatisticsResponse getImageStatisticsByTimeRange(LocalDateTime start, LocalDateTime end, boolean isPreService) {
        Object[] result;
        if (isPreService) {
            result = preImgRepository.getImageStatisticsByDateRange(start, end);
        }
        else {
            result = postImgRepository.getImageStatisticsByDateRange(start, end);
        }

        Object[] row = (Object[]) result[0]; // lấy dòng dữ liệu đầu tiên
        long totalImages = Optional.ofNullable(row[0])
                .filter(Number.class::isInstance)
                .map(Number.class::cast)
                .map(Number::longValue)
                .orElse(0L);
        double totalBlobSizeMB = Optional.ofNullable(row[1])
                .filter(Number.class::isInstance)
                .map(Number.class::cast)
                .map(Number::doubleValue)
                .orElse(0.0);


        return new ImageStatisticsResponse(totalImages, totalBlobSizeMB);
    }

    @Transactional
    @Modifying
    public Boolean clearImageByTimeRange(LocalDateTime start, LocalDateTime end, boolean isPreService) {
        if (isPreService) {
            log.info(start.toString() + " " + end.toString());
            preImgRepository.deleteAllByUploadTimeBetween(start, end);
        } else {
            postImgRepository.deleteAllByUploadTimeBetween(start, end);
        }
        return true;
    }

}
