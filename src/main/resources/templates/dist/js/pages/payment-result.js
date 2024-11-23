import * as utils from "/dist/js/utils.js";
import { VNPayErrorCode, getVNPayMessageByCode } from '/dist/js/services/VnPayCode.js';

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

let amount;
let bankCode;
let info;
let responseCode;

$(document).ready(function () {
    amount = utils.getHashParam("amount").substring(0, utils.getHashParam("amount").length - 2);
    bankCode = utils.getHashParam("bankCode");
    info = utils.getHashParam("info");
    responseCode = utils.getHashParam("responseCode");
    amount = Number(amount);    

    if (responseCode == null || amount == null) {
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: "Không thể lấy thông tin đơn dịch vụ",
        });
        return;
    }

    if (responseCode == "00") {
        
        let detail = getVNPayMessageByCode(responseCode);

        $('#overall-status').html(`<i class="fas fa-regular fa-circle-check text-success"></i> Thanh toán thành công!`);
        $('#text-status').html(`OK`);
        $('#text-status').addClass('text-success');
        $('#detail-message').text(detail);

        let infoHtml = "";
        infoHtml += `<b>Số tiền:</b> ${utils.formatVNDCurrency(amount)}<br><b>Mã ngân hàng:</b> ${bankCode}<br><b>Nội dung:</b><br><i>${info}</i>`;
        $('#info').html(infoHtml);
    } 
    else if (responseCode == "07") {
        let detail = getVNPayMessageByCode(responseCode);

        $('#overall-status').html(`<i class="fas fa-exclamation-triangle text-warning"></i> Thanh toán thành công!`);
        $('#text-status').html(`OK`);
        $('#text-status').addClass('text-warning');
        $("#detail-message").text(detail);

        let infoHtml = "";
        infoHtml += `<b>Số tiền:</b> ${utils.formatVNDCurrency(amount)}<br><b>Mã ngân hàng:</b> ${bankCode}<br><b>Nội dung:</b><br><i>${info}</i>`;
        $('#info').html(infoHtml);
    } 
    else {
        let detail = getVNPayMessageByCode(responseCode);

        $('#overall-status').html(`<i class="fas fa-regular fa-circle-xmark text-danger"></i> Thanh toán không thành công!`);
        $('#text-status').html(`Err! `);
        $('#text-status').addClass('text-danger');
        $("#detail-message").text(detail);

        let infoHtml = "";
        infoHtml += `<b>Số tiền:</b> ${utils.formatVNDCurrency(amount)}<br><b>Mã ngân hàng:</b> ${bankCode}<br><b>Nội dung:</b><br><i>${info}</i>`;
        $('#info').html(infoHtml);
    }

});