package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.configuration.VnPayConfig;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.VNPayResponse;
import com.lhduyanh.garagemanagement.entity.History;
import com.lhduyanh.garagemanagement.enums.HistoryStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.HistoryRepository;
import com.lhduyanh.garagemanagement.service.HistoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/vnpay")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class VnPayController {
    @Autowired
    VnPayConfig vnPayConfig;
    @Value("${app.domain-name}")
    @NonFinal
    String domainName;

    @Autowired
    HistoryService historyService;
    @Autowired
    HistoryRepository historyRepository;

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE'})")
    @GetMapping("/create-payment/{orderId}")
    public ApiResponse<String> newPayment(HttpServletRequest req, @PathVariable("orderId") String orderId) throws UnsupportedEncodingException {

        History history = historyRepository.findById(orderId)
                .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.HISTORY_NOT_EXISTS));

//        if (history.getStatus() != HistoryStatus.PROCEEDING.getCode()) {
//            throw new AppException(ErrorCode.NOT_PROCEEDING_HISTORY);
//        }

        if (history.getPayableAmount() == 0) {
            throw new AppException(ErrorCode.HISTORY_NO_MONEY);
        }

        String vnp_ReturnUrl = domainName + "/api/vnpay/result/"+orderId;
        String facilityName = vnPayConfig.getFacilityName();
        String orderType = "other";
        long amount = (long) (history.getPayableAmount()*100);
        String bankCode = req.getParameter("bankCode");

        String vnp_TxnRef = VnPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VnPayConfig.getIpAddress(req);

        String vnp_TmnCode = VnPayConfig.vnp_TmnCode;

        String message = "Thanh toan dich vu "+ facilityName+": " + vnp_TxnRef;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VnPayConfig.vnp_Version);
        vnp_Params.put("vnp_Command", VnPayConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", message);
        vnp_Params.put("vnp_Locale", "vn");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_OrderType", orderType);

//        String locate = req.getParameter("language");
//        if (locate != null && !locate.isEmpty()) {
//            vnp_Params.put("vnp_Locale", locate);
//        } else {
//            vnp_Params.put("vnp_Locale", "vn");
//        }
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(VnPayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VnPayConfig.vnp_PayUrl + "?" + queryUrl;
//        com.google.gson.JsonObject job = new JsonObject();
//        job.addProperty("code", "00");
//        job.addProperty("message", "success");
//        job.addProperty("data", paymentUrl);
//        Gson gson = new Gson();
//        resp.getWriter().write(gson.toJson(job));

        return ApiResponse.<String>builder()
                .code(1000)
                .message("Successfully")
                .data(paymentUrl)
                .build();
    }

    @GetMapping("/result/{orderId}")
    public void resultPayment(@PathVariable("orderId") String orderId,
                                                    @RequestParam("vnp_ResponseCode") String responseCode,
                                                    @RequestParam("vnp_Amount") String amount,
                                                    @RequestParam("vnp_OrderInfo") String info,
                                                    @RequestParam("vnp_BankCode") String bankCode,
                                                    HttpServletResponse httpResponse) throws IOException {
        History history = historyRepository.findById(orderId)
                        .filter(h -> h.getStatus() != HistoryStatus.DELETED.getCode())
                        .orElse(null);

        if (responseCode.equals("00")) {
            log.info("response code == 00");
            log.info(orderId);
            log.warn(history.getId());
            if (history != null) {
                if (history.getStatus() == HistoryStatus.PROCEEDING.getCode()) {
                    historyService.closeHistory(orderId, true);
                } else {
                    history.setStatus(HistoryStatus.PAID.getCode());
                    historyRepository.save(history);
                }
            }
        }
        if (history != null) {
            httpResponse.sendRedirect(domainName+"/payment-result#amount="+amount
                    +"&bankCode="+bankCode
                    +"&info="+info
                    +"&responseCode="+responseCode);
        } else {
            httpResponse.sendRedirect(domainName+"/payment-result");
        }
    }

}
