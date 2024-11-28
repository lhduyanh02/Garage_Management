package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.DetailHistoryRequest;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.enums.OptionStatus;
import com.lhduyanh.garagemanagement.enums.ServiceStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.text.MessageFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class DetailHistoryService {

    DetailHistoryRepository detailHistoryRepository;
    HistoryRepository historyRepository;
    ServiceRepository serviceRepository;
    OptionRepository optionRepository;
    PriceRepository priceRepository;
    CommonParameterRepository commonParameterRepository;

    HistoryService historyService;
    TelegramService telegramService;

    public List<DetailHistoryRequest> mergeDetails(List<DetailHistoryRequest> request) {
        // Nhóm các detail theo serviceId, optionId và discount
        Map<String, DetailHistoryRequest> mergedDetails = new HashMap<>();

        for (DetailHistoryRequest detail : request) {
            Float roundedDiscount = Math.round(detail.getDiscount() * 100) / 100.0f;
            detail.setDiscount(roundedDiscount);

            String key = detail.getServiceId() + "-" + detail.getOptionId() + "-" + detail.getDiscount();

            if (mergedDetails.containsKey(key)) {
                DetailHistoryRequest existingDetail = mergedDetails.get(key);
                existingDetail.setQuantity(existingDetail.getQuantity() + detail.getQuantity());
            } else {
                mergedDetails.put(key, detail);
            }
        }

        return new ArrayList<>(mergedDetails.values());
    }

    @Transactional
    public void newDetailHistory(History history, DetailHistoryRequest request) {
        log.info(String.valueOf(history.getDetails().size()));
        DetailHistory detailHistory = new DetailHistory();

        if (request.getDiscount() < 0 || request.getDiscount() > 100) {
            throw new AppException(ErrorCode.DISCOUNT_RANGE);
        }
        Float discount = Math.round(request.getDiscount() * 100) / 100.0f;
        request.setDiscount(discount);
        detailHistory.setDiscount(discount);

        if (request.getQuantity() < 1) {
            throw new AppException(ErrorCode.QUANTITY_RANGE);
        }
        detailHistory.setQuantity(request.getQuantity());

        if (history.getStatus() == HistoryStatus.PAID.getCode()){
            throw new AppException(ErrorCode.PAID_HISTORY);
        } else if (history.getStatus() == HistoryStatus.CANCELED.getCode()){
            throw new AppException(ErrorCode.CANCELED_HISTORY);
        }
        detailHistory.setHistory(history);

        Service service = serviceRepository.findById(request.getServiceId())
                .filter(s -> s.getStatus() != ServiceStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

        if (service.getStatus() == ServiceStatus.NOT_USE.getCode()){
            throw new AppException(ErrorCode.SERVICE_NOT_IN_USE);
        }
        detailHistory.setService(service);
        detailHistory.setServiceName(service.getName());

        Options option = optionRepository.findById(request.getOptionId())
                .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

        if (option.getStatus() == OptionStatus.NOT_USE.getCode()){
            throw new AppException(ErrorCode.OPTION_NOT_IN_USE);
        }
        detailHistory.setOption(option);
        detailHistory.setOptionName(option.getName());

        PriceId priceId = PriceId.builder().serviceId(service.getId()).optionId(option.getId()).build();
        Price priceEntity = priceRepository.findById(priceId)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_EXIST));

        Double price = priceEntity.getPrice();
        detailHistory.setPrice(price);

        Double finalPrice = (double) Math.round((price - (price * (discount / 100))) * detailHistory.getQuantity());
        detailHistory.setFinalPrice(finalPrice);

        detailHistoryRepository.save(detailHistory);
        history.getDetails().add(detailHistory);
        historyRepository.save(history);
    }

    @Transactional
    public HistoryWithDetailsResponse updateListDetailHistory(String historyId, List<DetailHistoryRequest> request) {
        if (historyId == null || historyId == "") {
            throw new AppException(ErrorCode.BLANK_HISTORY);
        }

        History history = historyRepository.findByIdFetchDetails(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        if(request == null || request.isEmpty()){
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        detailHistoryRepository.deleteAll(history.getDetails());
        history.getDetails().clear();
        historyRepository.save(history);

        List<DetailHistoryRequest> mergedDetails = mergeDetails(request);

        for (DetailHistoryRequest detail : mergedDetails) {
            newDetailHistory(history, detail);
        }

        var response = historyService.updateHistoryById(history.getId());

        String body = """
                        <b>📢 CẬP NHẬT ĐƠN DỊCH VỤ</b>

                        <u>Thông tin xe:</u>
                        <pre><code><b>Mẫu xe: </b>{0}
                        <b>BKS: </b>{1}
                        <b>Màu xe: </b>{2}</code></pre>

                        <u>Đơn dịch vụ:</u> <i>{3}</i>
                        <b>Tóm tắt vấn đề:</b>
                        {4}

                        <b>Chẩn đoán, đề xuất:</b>
                        {5}

                        <u>Cố vấn dịch vụ:</u>
                        <pre><code><b>Cố vấn: </b>{6}
                        <b>Liên hệ: </b>{7}</code></pre>

                        <u>Dịch vụ đã chọn:</u>
                        <pre><code>{8}</code></pre>

                        <i>Đã tạo lúc: {9}.</i>
                        """;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

        CarResponse carInfo = response.getCar();
        String model = carInfo.getModel().getBrand().getBrand() + " " + carInfo.getModel().getModel();
        String numPlate = carInfo.getNumPlate() + " (" + carInfo.getPlateType().getType() +")";

        UserWithAccountsResponse adv = response.getAdvisor();
        String advContact = "";
        if (adv.getPhone() != null && !adv.getPhone().isEmpty()) {
            advContact = adv.getPhone() + " ";
        }
        AccountSimpleResponse acc = adv.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).findFirst().orElse(null);
        if (acc != null) {
            advContact += acc.getEmail();
        }

        String serviceList = "";
        List<DetailHistoryResponse> details = response.getDetails();
        if (!details.isEmpty()) {
            int count = 1;
            for (DetailHistoryResponse detail : details) {
                String optionHtml = "";
                if (detail.getOptionName() != null && !detail.getOptionName().isEmpty()) {
                    optionHtml = " <i>("+detail.getOptionName()+")</i>";
                }
                serviceList += count +". "+detail.getServiceName() + optionHtml+"\n";
                count++;
            }
        } else {
            serviceList = "Trống\n";
        }

        String summary = response.getSummary();
        if (summary == null || summary.isEmpty()) {
            summary = "<i>Không có tóm tắt</i>";
        }

        String diagnose = response.getDiagnose();
        if (diagnose == null || diagnose.isEmpty()) {
            diagnose = "<i>Không có chẩn đoán</i>";
        }

        String message = MessageFormat.format(body,
                model,
                numPlate,
                carInfo.getColor(),
                response.getId(),
                summary,
                diagnose,
                adv.getName(),
                advContact,
                serviceList,
                response.getServiceDate().format(formatter)
        );

        var chatID = commonParameterRepository.findByKey("ORDER_NOTIFY").orElse(null);

        if (chatID != null) {
            try {
                telegramService.sendNotificationToAnUser(chatID.getValue(), message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo Telegram");
                e.printStackTrace();
            }
        }

        return response;
    }

    @Transactional
    public HistoryWithDetailsResponse deleteAllDetailsByHistoryId(String id) {
        History history = historyRepository.findByIdFetchDetails(id)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        detailHistoryRepository.deleteAll(history.getDetails());
        history.getDetails().clear();
        historyRepository.save(history);
        var response = historyService.updateHistoryById(id);

        String body = """   
                        <b>📢 ĐƠN BỊ XÓA DANH SÁCH DỊCH VỤ ❌</b>
                       
                        <u>Thông tin xe:</u>
                        <pre><code><b>Mẫu xe: </b>{0}
                        <b>BKS: </b>{1}
                        <b>Màu xe: </b>{2}
                        <b>Đơn dịch vụ:</b> {3}</code></pre>
                        
                        <u>Cố vấn dịch vụ:</u>
                        <pre><code><b>Cố vấn: </b>{4}
                        <b>Liên hệ: </b>{5}</code></pre>
                        
                        <b>Đơn dịch vụ này vừa được danh sách dịch vụ đã đăng ký!</b>
                        
                        <i>Đơn đã tạo lúc: {6}.</i>
                        """;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

        CarResponse carInfo = response.getCar();
        String model = carInfo.getModel().getBrand().getBrand() + " " + carInfo.getModel().getModel();
        String numPlate = carInfo.getNumPlate() + " (" + carInfo.getPlateType().getType() +")";

        UserWithAccountsResponse adv = response.getAdvisor();
        String advContact = "";
        if (adv.getPhone() != null && !adv.getPhone().isEmpty()) {
            advContact = adv.getPhone() + " ";
        }
        AccountSimpleResponse acc = adv.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).findFirst().orElse(null);
        if (acc != null) {
            advContact += acc.getEmail();
        }

        String message = MessageFormat.format(body,
                model,
                numPlate,
                carInfo.getColor(),
                response.getId(),
                adv.getName(),
                advContact,
                response.getServiceDate().format(formatter)
        );

        var chatID = commonParameterRepository.findByKey("ORDER_NOTIFY").orElse(null);

        if (chatID != null) {
            try {
                telegramService.sendNotificationToAnUser(chatID.getValue(), message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo Telegram");
                e.printStackTrace();
            }
        }

        return response;
    }

    @Transactional
    public HistoryWithDetailsResponse deleteDetailFromHistory(String historyId, String detailId) {
        History history = historyRepository.findById(historyId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()){
            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
        }

        DetailHistory selectedDetail = detailHistoryRepository.findById(detailId)
                .orElseThrow(() -> new AppException(ErrorCode.DETAIL_NOT_EXIST));

        detailHistoryRepository.delete(selectedDetail);
        history.getDetails().remove(selectedDetail);
        historyRepository.save(history);
        var response =  historyService.updateHistoryById(historyId);

        String body = """
                        <b>📢 XÓA DỊCH VỤ TRONG ĐƠN DỊCH VỤ ❗</b>

                        <u>Thông tin xe:</u>
                        <pre><code><b>Mẫu xe: </b>{0}
                        <b>BKS: </b>{1}
                        <b>Màu xe: </b>{2}</code></pre>

                        <u>Đơn dịch vụ:</u> <i>{3}</i>
                        <b>Tóm tắt vấn đề:</b>
                        {4}

                        <b>Chẩn đoán, đề xuất:</b>
                        {5}

                        <u>Cố vấn dịch vụ:</u>
                        <pre><code><b>Cố vấn: </b>{6}
                        <b>Liên hệ: </b>{7}</code></pre>

                        <u>Dịch vụ đã chọn:</u>
                        <pre><code>{8}</code></pre>

                        <i>Đã tạo lúc: {9}.</i>
                        """;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

        CarResponse carInfo = response.getCar();
        String model = carInfo.getModel().getBrand().getBrand() + " " + carInfo.getModel().getModel();
        String numPlate = carInfo.getNumPlate() + " (" + carInfo.getPlateType().getType() +")";

        UserWithAccountsResponse adv = response.getAdvisor();
        String advContact = "";
        if (adv.getPhone() != null && !adv.getPhone().isEmpty()) {
            advContact = adv.getPhone() + " ";
        }
        AccountSimpleResponse acc = adv.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).findFirst().orElse(null);
        if (acc != null) {
            advContact += acc.getEmail();
        }

        String serviceList = "";
        List<DetailHistoryResponse> details = response.getDetails();
        if (!details.isEmpty()) {
            int count = 1;
            for (DetailHistoryResponse detail : details) {
                String optionHtml = "";
                if (detail.getOptionName() != null && !detail.getOptionName().isEmpty()) {
                    optionHtml = " <i>("+detail.getOptionName()+")</i>";
                }
                serviceList += count +". "+detail.getServiceName() + optionHtml+"\n";
                count++;
            }
        } else {
            serviceList = "Trống\n";
        }

        String summary = response.getSummary();
        if (summary == null || summary.isEmpty()) {
            summary = "<i>Không có tóm tắt</i>";
        }

        String diagnose = response.getDiagnose();
        if (diagnose == null || diagnose.isEmpty()) {
            diagnose = "<i>Không có chẩn đoán</i>";
        }

        String message = MessageFormat.format(body,
                model,
                numPlate,
                carInfo.getColor(),
                response.getId(),
                summary,
                diagnose,
                adv.getName(),
                advContact,
                serviceList,
                response.getServiceDate().format(formatter)
        );

        var chatID = commonParameterRepository.findByKey("ORDER_NOTIFY").orElse(null);

        if (chatID != null) {
            try {
                telegramService.sendNotificationToAnUser(chatID.getValue(), message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo Telegram");
                e.printStackTrace();
            }
        }

        return response;
    }

}
