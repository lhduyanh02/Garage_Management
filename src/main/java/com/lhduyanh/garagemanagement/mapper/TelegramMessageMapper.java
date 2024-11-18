package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.TelegramMessageSimpleResponse;
import com.lhduyanh.garagemanagement.entity.TelegramMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TelegramMessageMapper {

    @Mapping(target = "receiverQuantity", ignore = true)
    TelegramMessageSimpleResponse toSimpleResponse (TelegramMessage telegramMessage);

}
