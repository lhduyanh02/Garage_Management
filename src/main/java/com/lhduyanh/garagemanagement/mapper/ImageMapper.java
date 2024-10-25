package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.ImageResponse;
import com.lhduyanh.garagemanagement.entity.PostServiceImage;
import com.lhduyanh.garagemanagement.entity.PreServiceImage;
import org.mapstruct.Mapper;

import java.awt.*;

@Mapper(componentModel = "spring")
public interface ImageMapper {

    ImageResponse toImageResponse(PreServiceImage image);

    ImageResponse toImageResponse(PostServiceImage image);

}
