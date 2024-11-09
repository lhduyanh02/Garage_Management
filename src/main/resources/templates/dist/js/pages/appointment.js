import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_APPOINTMENT');

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

// Clear modal
function clear_modal() {
    if ($(".modal-dialog").hasClass("modal-lg")) {
        $(".modal-dialog").removeClass("modal-lg");
    }

    if ($(".modal-dialog").hasClass("modal-xl")) {
        $(".modal-dialog").removeClass("modal-xl");
    }
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

const dateRangePicker = $('#reservationtime');
const TIMELINE = $('#timeline');
var serviceOptionList = [];
var customerList = [];

var OPENING_TIME;
var CLOSING_TIME;


$(document).ready(function () {
    moment.updateLocale('vi', {
        week: { dow: 1 } // dow: 1 đặt Thứ Hai là ngày đầu tuần
    });

    let hashStart = utils.getHashParam('start');
    let hashEnd = utils.getHashParam('end');
    let filter = utils.getHashParam('filter');

    if (!hashStart || !hashEnd) {
        utils.setHashParam('start', null);
        utils.setHashParam('end', null);
    }

    if (filter) {
        $('#search-type-select').val(filter).change();
    }

    $("#search-type-select").select2({
        allowClear: false,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true,
    });

    // Khởi tạo daterangepicker
    dateRangePicker.daterangepicker({
        timePicker: true,
        timePicker24Hour: true,   // Sử dụng định dạng 24 giờ
        timePickerIncrement: 10,
        autoUpdateInput: false,   // Không tự động cập nhật input cho đến khi nhấn "Chọn"
        // maxSpan: {
        //     days: 31  // Giới hạn không quá 31 ngày
        // },
        locale: {
            format: 'HH:mm, DD/MM/YYYY',     // Định dạng ngày giờ tiếng Việt
            separator: ' đến ',              // Dấu phân cách giữa hai ngày
            applyLabel: 'Chọn',              // Nhãn nút "Chọn"
            cancelLabel: 'Hủy',              // Nhãn nút "Hủy"
            fromLabel: 'Từ',
            toLabel: 'Đến',
            customRangeLabel: 'Tùy chọn',
            weekLabel: 'Tuần',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: [
                'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ],
            firstDay: 1  // Bắt đầu tuần từ Thứ 2
        }
    });

    // Truy xuất instance daterangepicker
    const picker = dateRangePicker.data('daterangepicker');

    // Đặt giá trị mặc định ban đầu cho startOfDay và endOfDay
    let startOfDay = moment().startOf('day');  // 0h hôm nay
    let endOfDay = moment().endOf('day');      // 23:59 hôm nay

    // Kiểm tra nếu cả hashStart và hashEnd đều khác null
    if (hashStart && hashEnd) {
        startOfDay = moment(hashStart);
        endOfDay = moment(hashEnd);
    }

    picker.setStartDate(startOfDay);
    picker.setEndDate(endOfDay);

    // Cập nhật input với range mặc định ngay khi khởi tạo
    dateRangePicker.val(
        startOfDay.format('HH:mm, DD/MM/YYYY') +
        ' đến ' +
        endOfDay.format('HH:mm, DD/MM/YYYY')
    );

    // Sự kiện khi nhấn "Chọn"
    dateRangePicker.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(
            picker.startDate.format('HH:mm, DD/MM/YYYY') +
            ' đến ' +
            picker.endDate.format('HH:mm, DD/MM/YYYY')
        );
    });

    // Sự kiện khi nhấn "Hủy" hoặc click ra ngoài
    dateRangePicker.on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });
    
    $.ajax({
        type: "GET",
        url: "/api/services/enable-with-price",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data) {
                serviceOptionList = res.data;
            }
        },
        error: function (xhr, status, error) {
            console.error(utils.getXHRInfo(xhr));
        },
    });
    
    $.ajax({
        type: "GET",
        url: "/api/users/customers",
        headers: utils.defaultHeaders(),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000) {
                customerList = res.data;
            } else {
                console.warn("Cannot get customer list");
                console.error(res);
            }
        },
        error: function(xhr, status, error) {
            console.warn("Cannot get customer list");
            console.error(xhr);
        }
    });

    $.ajax({
        type: "POST",
        url: "/api/common-param/list-param",
        headers: utils.noAuthHeaders(),
        data: JSON.stringify([
                "OPENING_TIME",
                "CLOSING_TIME",
            ]
        ),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data) {
                let data = res.data;
                OPENING_TIME = moment(data[0].value, "HH:mm");
                CLOSING_TIME = moment(data[1].value, "HH:mm");
                
                if (!OPENING_TIME.isValid() || !CLOSING_TIME.isValid()) {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi tham số",
                        text: OPENING_TIME.isValid() ? "Giờ đóng cửa không hợp lệ, vui lòng liên hệ quản trị viên" : "Giờ mở cửa không hợp lệ, vui lòng liên hệ quản trị viên",
                    });
                    return;
                }
            }
            else {
                console.error(res);
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr.responseJSON);
        }
    });
});

$('#card-submit-btn').click( async function () { 
    loadListAppointment();
});

async function loadListAppointment() {
    let urlPart = "";
    if($('#search-type-select').val() === "booking-time") {
        urlPart = "/by-time";
    } else if ($('#search-type-select').val() === "create-time") {
        urlPart = "/by-create-time";
    } else {
        Swal.fire({
            title: "Chọn tiêu chí", 
            html: "Vui lòng chọn một tiêu chí tìm kiếm",
            icon: "warning",
            timer: 2000,
            showCancelButton: false,
        });
        return;
    }

    let startDate, endDate;

    try {
        // Lấy giá trị ngày giờ từ picker và kiểm tra định dạng ISO
        startDate = dateRangePicker.data('daterangepicker').startDate.format('YYYY-MM-DDTHH:mm:ss');
        endDate = dateRangePicker.data('daterangepicker').endDate.format('YYYY-MM-DDTHH:mm:ss');

        // Chuyển sang Date để kiểm tra tính hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Nếu ngày không hợp lệ, báo lỗi bằng Swal
        if (isNaN(start) || isNaN(end)) {
            return Swal.fire({
                icon: 'error',
                title: 'Lỗi định dạng',
                html: 'Ngày giờ không hợp lệ. Vui lòng kiểm tra lại!',
                timer: 3000,
                showCancelButton: false
            });
        }

        // Nếu start > end, hoán đổi hai ngày
        if (start > end) {
            [startDate, endDate] = [endDate, startDate];  // Hoán đổi
        }
    } catch (error) {
        // Báo lỗi nếu có ngoại lệ trong quá trình xử lý
        Swal.fire({
            icon: 'error',
            title: 'Lỗi không xác định',
            html: 'Có lỗi xảy ra trong quá trình xử lý thời gian đã chọn!',
            timer: 3000,
            showCancelButton: false
        });
    }

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/appointment"+ urlPart +`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Đã xảy ra lỗi", 
            html: utils.getXHRInfo(error).message,
            icon: "error",
            timer: 3000,
            showCancelButton: false,
        });
        return;
    }

    if (!res) return;

    if (res.code == 1000) {
        utils.setHashParam('start', startDate);
        utils.setHashParam('end', endDate);
        utils.setHashParam('filter', $('#search-type-select').val())

        if ($('#search-type-select').val() === "booking-time"){
            TIMELINE.html("");
            // Nhóm lịch hẹn theo ngày
            const groupedAppointments = {};

            res.data.forEach(appointment => {
                const appointmentDate = new Date(appointment.time);
                const dateString = `${appointmentDate.getDate().toString().padStart(2, '0')}/${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`;

                // Nếu ngày chưa tồn tại trong groupedAppointments, khởi tạo mảng
                if (!groupedAppointments[dateString]) {
                    groupedAppointments[dateString] = [];
                }

                // Thêm lịch hẹn vào mảng của ngày tương ứng
                groupedAppointments[dateString].push(appointment);
            });

            // Sắp xếp theo thứ tự ngày mới nhất
            const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));

            // Log ra kết quả
            sortedDates.forEach(date => {

                // Sắp xếp các cuộc hẹn trong cùng một ngày theo thời gian mới nhất
                groupedAppointments[date].sort((a, b) => new Date(b.time) - new Date(a.time));

                TIMELINE.append(`
                    <div class="time-label">
                        <span class="bg-info">${date}</span>
                    </div>
                `);

                groupedAppointments[date].forEach(appointment => {
                    const time = utils.getTimeAsJSON(appointment.time);
                    const createAt = utils.getTimeAsJSON(appointment.createAt);
                    let nameHtml = "";
                    let phoneHtml = "";
                    let emailHtml = "";
                    let detailsHtml = "";
                    let contactHtml = "";
                    
                    nameHtml = "<b>Họ tên: </b>" + appointment.customer.name +"<br>";

                    if (appointment.customer.phone) {
                        phoneHtml = `<b>SĐT: </b><a id="facility-phone" href="tel:${appointment.customer.phone}" class="text-dark hover-underline">${appointment.customer.phone}</a><br>`
                    }

                    if (appointment.customer.accounts.length> 0) {
                        emailHtml = `<b>Email: </b><a id="facility-email" href="mailto:${appointment.customer.accounts[0].email}" class="text-dark hover-underline">${appointment.customer.accounts[0].email}</a><br>`
                    }

                    appointment.details.forEach((val, idx) => {
                        let html = "";
                        html += `<b>- ${val.serviceName}</b> ${val.optionName ? `(${val.optionName})` : ""}<br>`
                        detailsHtml += html;
                    })

                    let footerHtml = "";
                    let statusHtml = "";

                    if (appointment.status == 0) { // Chưa gọi xác nhận
                        footerHtml = `
                            <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                            <button class="btn btn-primary btn-sm appointment-confirm-btn mr-1" data-id=${appointment.id}>Xác nhận</button>
                            <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                        `;
                        statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chờ xác nhận</span>`
                        if (new Date(appointment.time) < new Date()) { // Quá giờ
                            statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chưa xác nhận, đã quá giờ</span>`
                        }
                    } else if (appointment.status == 1) { // Đã gọi xác nhận
                        footerHtml = `
                            <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                            <button class="btn btn-success btn-sm appointment-complete-btn mr-1" data-id=${appointment.id}>Đã hoàn thành</button>
                            <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                        `;
                        statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận</span>`
                        if (new Date(appointment.time) < new Date()) { // Đã qua giờ hẹn
                            footerHtml += `<button class="btn btn-outline-danger btn-sm appointment-missed-btn" data-id=${appointment.id}>Đã bỏ lỡ</button>`;
                            statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận, đã quá giờ</span>`
                        }
                    } else if (appointment.status == 2) { // Đã thi công hoàn tất
                        statusHtml = `<span class="mx-1 badge badge-success"><i class="fa-solid fa-check-double"></i>&nbsp;Đã hoàn tất</span>` // fa-regular fa-square-check
                    } else if (appointment.status == 3) { // Đã bỏ lỡ
                        statusHtml = `<span class="mx-1 badge badge-secondary"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;Đã bỏ lỡ</span>`
                    } else {
                        statusHtml = `<span class="mx-1 badge badge-dark"><i class="fa-solid fa-xmark"></i>&nbsp;Đã hủy hẹn</span>`
                    }

                    if (appointment.contact && appointment.contact != "") {
                        contactHtml = appointment.contact
                    } else {
                        contactHtml = "<i>Không có</i>"
                    }

                    let iconHtml = "";
                    if (appointment.status == 0) {
                        iconHtml = "fa-solid fa-stopwatch bg-warning";
                    } else if (appointment.status == 1) {
                        iconHtml =  "fa-solid fa-check bg-info";
                    } else if (appointment.status == 2) {
                        iconHtml =  "fa-solid fa-check-double bg-success";
                    } else if (appointment.status == 3) {
                        iconHtml =  "fa-solid fa-circle-exclamation bg-secondary";
                    } else {
                        iconHtml =  "fa-solid fa-xmark bg-dark";
                    }

                    let advisorName = "";
                    let advisorPhone = "";
                    let advisorEmail = "";
                    if (appointment.advisor) {
                        advisorName = `<b>Họ tên: </b>${appointment.advisor.name}<br>`;
                        
                        advisorEmail = `<b>Email: </b><a href="tel:${appointment.advisor.accounts[0].email}" class="text-dark hover-underline">${appointment.advisor.accounts[0].email}</a><br>`
                        
                        advisorPhone = advisorPhone ? `<b>SĐT: </b><a href="tel:${appointment.advisor.phone}" class="text-dark hover-underline">${appointment.advisor.phone}</a><br>` : "";
                    } else {
                        advisorName = '<span class="font-italic">Chưa xử lý</span>';
                    }

                    let html = `
                        <div>
                            <i class="fas ${iconHtml}"></i>
                            <div class="timeline-item">
                                <span class="time font-weight-bold"><i class="fas fa-clock"></i> ${time.hour}:${time.min}</span>
                                <h3 class="timeline-header">Lịch hẹn của <b>${appointment.customer.name}</b> ${statusHtml}</h3>

                                <div class="timeline-body">
                                    <div class="row"> 
                                        <div class="col-12 col-md-6 border-right-md px-3"> 
                                            <b style="text-decoration: underline">Thông tin khách hàng:</b><br>
                                            <div class="px-3">
                                                ${nameHtml}
                                                ${phoneHtml}
                                                ${emailHtml}
                                            </div>

                                            <br>
                                            <i class="fa-regular fa-rectangle-list"></i> <b style="text-decoration: underline">Dịch vụ đã chọn:</b><br>
                                            <div class="px-3">${detailsHtml}</div>

                                            <br>
                                            <b style="text-decoration: underline">Liên hệ:</b> ${contactHtml}
                                        </div>
                                            
                                        <div class="col-12 col-md-6 px-3"> 
                                            <b style="text-decoration: underline">Nhân viên xử lý:</b><br>
                                            <div class="px-3">
                                                ${advisorName}
                                                ${advisorEmail}
                                                ${advisorPhone}
                                            </div>

                                            <br>
                                            <b style="text-decoration: underline">Ghi chú:</b><br>
                                            <div class="px-3">${appointment.description ? appointment.description.replace(/\n/g, "<br>") : `<span class="font-italic">Không có ghi chú.</span>`}</div>

                                            <br>
                                            <b style="text-decoration: underline">Được tạo lúc:</b> ${createAt.hour}:${createAt.min}, ngày ${createAt.date}/${createAt.mon}/${createAt.year}
                                        </div>
                                    </div>
                                </div>
                                <div class="timeline-footer">
                                    ${footerHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    TIMELINE.append(html);
                });
            });

            TIMELINE.append(`<div>
                                <i class="fas fa-clock bg-gray"></i>
                            </div>`);
        }
        else {                          // sort by create time
            TIMELINE.html("");
            // Nhóm lịch hẹn theo ngày
            const groupedAppointments = {};

            res.data.forEach(appointment => {
                const appointmentDate = new Date(appointment.createAt);
                const dateString = `${appointmentDate.getDate().toString().padStart(2, '0')}/${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`;

                // Nếu ngày chưa tồn tại trong groupedAppointments, khởi tạo mảng
                if (!groupedAppointments[dateString]) {
                    groupedAppointments[dateString] = [];
                }

                // Thêm lịch hẹn vào mảng của ngày tương ứng
                groupedAppointments[dateString].push(appointment);
            });

            // Sắp xếp theo thứ tự ngày mới nhất
            const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));

            // Log ra kết quả
            sortedDates.forEach(date => {

                // Sắp xếp các cuộc hẹn trong cùng một ngày theo thời gian mới nhất
                groupedAppointments[date].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

                TIMELINE.append(`
                    <div class="time-label">
                        <span class="bg-info">${date}</span>
                    </div>
                `);

                groupedAppointments[date].forEach(appointment => {
                    const time = utils.getTimeAsJSON(appointment.time);
                    const createAt = utils.getTimeAsJSON(appointment.createAt);
                    let nameHtml = "";
                    let phoneHtml = "";
                    let emailHtml = "";
                    let detailsHtml = "";
                    let contactHtml = "";
                    
                    nameHtml = "<b>Họ tên: </b>" + appointment.customer.name +"<br>";

                    if (appointment.customer.phone) {
                        phoneHtml = `<b>SĐT: </b><a id="facility-phone" href="tel:${appointment.customer.phone}" class="text-dark hover-underline">${appointment.customer.phone}</a><br>`
                    }

                    if (appointment.customer.accounts.length> 0) {
                        emailHtml = `<b>Email: </b><a id="facility-email" href="mailto:${appointment.customer.accounts[0].email}" class="text-dark hover-underline">${appointment.customer.accounts[0].email}</a><br>`
                    }

                    appointment.details.forEach((val, idx) => {
                        let html = "";
                        html += `<b>- ${val.serviceName}</b> ${val.optionName ? `(${val.optionName})` : ""}<br>`
                        detailsHtml += html;
                    })

                    let footerHtml = "";
                    let statusHtml = "";

                    if (appointment.status == 0) { // Chưa gọi xác nhận
                        footerHtml = `
                            <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                            <button class="btn btn-primary btn-sm appointment-confirm-btn mr-1" data-id=${appointment.id}>Xác nhận</button>
                            <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                        `;
                        statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chờ xác nhận</span>`
                        if (new Date(appointment.time) < new Date()) { // Quá giờ
                            statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chưa xác nhận, đã quá giờ</span>`
                        }
                    } else if (appointment.status == 1) { // Đã gọi xác nhận
                        footerHtml = `
                            <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                            <button class="btn btn-success btn-sm appointment-complete-btn mr-1" data-id=${appointment.id}>Đã hoàn thành</button>
                            <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                        `;
                        statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận</span>`
                        if (new Date(appointment.time) < new Date()) { // Đã qua giờ hẹn
                            footerHtml += `<button class="btn btn-outline-danger btn-sm appointment-missed-btn" data-id=${appointment.id}>Đã bỏ lỡ</button>`;
                            statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận, đã quá giờ</span>`
                        }
                    } else if (appointment.status == 2) { // Đã thi công hoàn tất
                        statusHtml = `<span class="mx-1 badge badge-success"><i class="fa-solid fa-check-double"></i>&nbsp;Đã hoàn tất</span>` // fa-regular fa-square-check
                    } else if (appointment.status == 3) { // Đã bỏ lỡ
                        statusHtml = `<span class="mx-1 badge badge-secondary"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;Đã bỏ lỡ</span>`
                    } else {
                        statusHtml = `<span class="mx-1 badge badge-dark"><i class="fa-solid fa-xmark"></i>&nbsp;Đã hủy hẹn</span>`
                    }

                    if (appointment.contact && appointment.contact != "") {
                        contactHtml = appointment.contact
                    } else {
                        contactHtml = "<i>Không có</i>"
                    }

                    let iconHtml = "";
                    if (appointment.status == 0) {
                        iconHtml = "fa-solid fa-stopwatch bg-warning";
                    } else if (appointment.status == 1) {
                        iconHtml =  "fa-solid fa-check bg-info";
                    } else if (appointment.status == 2) {
                        iconHtml =  "fa-solid fa-check-double bg-success";
                    } else if (appointment.status == 3) {
                        iconHtml =  "fa-solid fa-circle-exclamation bg-secondary";
                    } else {
                        iconHtml =  "fa-solid fa-xmark bg-dark";
                    }

                    let advisorName = "";
                    let advisorPhone = "";
                    let advisorEmail = "";
                    if (appointment.advisor) {
                        advisorName = `<b>Họ tên: </b>${appointment.advisor.name}<br>`;
                        
                        advisorEmail = `<b>Email: </b><a href="tel:${appointment.advisor.accounts[0].email}" class="text-dark hover-underline">${appointment.advisor.accounts[0].email}</a><br>`
                        
                        advisorPhone = advisorPhone ? `<b>SĐT: </b><a href="tel:${appointment.advisor.phone}" class="text-dark hover-underline">${appointment.advisor.phone}</a><br>` : "";
                    } else {
                        advisorName = '<span class="font-italic">Chưa xử lý</span>';
                    }

                    let html = `
                        <div>
                            <i class="fas ${iconHtml}"></i>
                            <div class="timeline-item">
                                <span class="time font-weight-bold"><i class="fas fa-clock"></i> ${createAt.hour}:${createAt.min}</span>
                                <h3 class="timeline-header">Lịch hẹn của <b>${appointment.customer.name}</b> ${statusHtml}</h3>

                                <div class="timeline-body">
                                    <div class="row"> 
                                        <div class="col-12 col-md-6 border-right-md px-3"> 
                                            <b style="text-decoration: underline">Thông tin khách hàng:</b><br>
                                            <div class="px-3">
                                                ${nameHtml}
                                                ${phoneHtml}
                                                ${emailHtml}
                                            </div>

                                            <br>
                                            <i class="fa-regular fa-rectangle-list"></i> <b style="text-decoration: underline">Dịch vụ đã chọn:</b><br>
                                            <div class="px-3">${detailsHtml}</div>

                                            <br>
                                            <b style="text-decoration: underline">Liên hệ:</b> ${contactHtml}
                                        </div>
                                            
                                        <div class="col-12 col-md-6 px-3"> 
                                            <b style="text-decoration: underline">Nhân viên xử lý:</b><br>
                                            <div class="px-3">
                                                ${advisorName}
                                                ${advisorEmail}
                                                ${advisorPhone}
                                            </div>

                                            <br>
                                            <b style="text-decoration: underline">Ghi chú:</b><br>
                                            <div class="px-3">${appointment.description ? appointment.description.replace(/\n/g, "<br>") : `<span class="font-italic">Không có ghi chú.</span>`}</div>

                                            <br>
                                            <b style="text-decoration: underline">Đặt hẹn ngày:</b> ${time.hour}:${time.min}, ngày ${time.date}/${time.mon}/${time.year}
                                        </div>
                                    </div>
                                </div>
                                <div class="timeline-footer">
                                    ${footerHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    TIMELINE.append(html);
                });
            });

            TIMELINE.append(`<div>
                                <i class="fas fa-clock bg-gray"></i>
                            </div>`);
        }
    }
    else {
        console.error(res);
    }
    Swal.close();
}

$(document).on('click', '.appointment-confirm-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Xác nhận đặt hẹn",
        text: "Người dùng đã xác nhận đặt hẹn và các dịch vụ?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đồng ý",
        reverseButtons: true
    });
    
    if (!warning.isConfirmed) {
        return;
    }
    
    $.ajax({
        type: "PUT",
        url: "/api/appointment/update-status?appointment=" +id+"&status=1",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Đã cập nhật!",
                    text: "Đã xác nhận đặt hẹn thành công!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-cancel-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Hủy cuộc hẹn",
        text: "Xác nhận hủy cuộc hẹn này?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đồng ý",
        reverseButtons: true
    });
    
    if (!warning.isConfirmed) {
        return;
    }
    
    $.ajax({
        type: "PUT",
        url: "/api/appointment/update-status?appointment=" +id+"&status=4",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Đã hủy cuộc hẹn!",
                    text: "Đã hủy cuộc hẹn thành công!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-missed-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Cuộc hẹn đã bị bỏ lỡ?",
        text: "Xác nhận khách hàng đã bỏ lỡ cuộc hẹn này?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đồng ý",
        reverseButtons: true
    });
    
    if (!warning.isConfirmed) {
        return;
    }
    
    $.ajax({
        type: "PUT",
        url: "/api/appointment/update-status?appointment=" +id+"&status=3",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    text: "Đã cập nhật cuộc hẹn bị bỏ lỡ!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-complete-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Cuộc hẹn đã diễn ra",
        text: "Xác nhận cuộc hẹn đã diễn ra?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đồng ý",
        reverseButtons: true
    });
    
    if (!warning.isConfirmed) {
        return;
    }
    
    $.ajax({
        type: "PUT",
        url: "/api/appointment/update-status?appointment=" +id+"&status=2",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    text: "Đã cập nhật cuộc hẹn đã diễn ra!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

// Hàm định dạng option với name bên trái và price bên phải
function formatOption(state) {
    if (!state.id) {
        return state.text;
    }
    const price = $(state.element).data("price");
    return $(
        `<div class="d-flex justify-content-between">
            <span>${state.text}</span>
            <small class="align-text-bottomtext-muted">${price}</small>
        </div>`
    );
}

$(document).on('click', '.appointment-edit-btn', async function () {
    const id = $(this).data('id');

    Swal.showLoading();

    if (serviceOptionList.length == 0) {
        await $.ajax({
            type: "GET",
            url: "/api/services/enable-with-price",
            dataType: "json",
            headers: utils.defaultHeaders(),
            success: function (res) {
                if (res.code == 1000 && res.data) {
                    serviceOptionList = res.data;
                }
            },
            error: function (xhr, status, error) {
                console.error(utils.getXHRInfo(xhr));
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(response.code)
                });
                return;
            },
        });
    }

    let response;
    try {
        response = await $.ajax({
            type: "GET",
            url: "/api/appointment/"+id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });    
    } catch (error) {
        console.error(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
        });
        return;
    }

    if (!response) return;

    if (!response.code === 1000) {
        Swal.close();
        console.error(response);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(response.code)
        });
        return;
    }

    let appointment = response.data;

    clear_modal();
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_title").text("Chỉnh sửa thông tin đặt hẹn");
    $("#modal_body").append(`
        <div class="form-group">
            <label>Chọn thời gian:</label>
            <div class="input-group date" id="reservationdatetime" data-target-input="nearest">
                <input role="button" type="text" class="form-control datetimepicker-input" data-target="#reservationdatetime" readonly>
                <div class="input-group-append" data-target="#reservationdatetime" data-toggle="datetimepicker">
                    <div class="input-group-text"><i class="fa-regular fa-calendar-days"></i></div>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="modal_contact_input">Thông tin liên lạc khách hàng</label>
            <input type="text" class="form-control" id="modal_contact_input" maxlength="255" placeholder="Nhập thông tin liên lạc">
        </div>

        <div class="form-group">
            <label for="modal_description_input">Ghi chú</label>
            <textarea wrap="soft" 
                class="form-control" 
                id="modal_description_input" 
                rows="4" maxlength="65000" 
                placeholder="Ghi chú cho cuộc hẹn"></textarea>
        </div>

        <div class="form-group">
            <label class="mb-0">Chọn dịch vụ và Tùy chọn (option)</label><br>
            <div id="service-wrapper" class="mt-1">
            </div>
            <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
        </div>
    `);

    // Hiển thị datetimepicker khi nhấp vào input
    $('#reservationdatetime input').on('focus', function() {
        $('#reservationdatetime').datetimepicker('show');
    });

    // Cấu hình DateTimePicker
    $('#reservationdatetime').datetimepicker({
        format: 'HH:mm, [ngày] DD/MM/YYYY', // Định dạng ngày giờ
        icons: { 
            time: 'fa-regular fa-clock', 
            date: 'fa-solid fa-calendar-day' 
        },
        maxDate: moment().add(1, 'years'), // Giới hạn đến 1 năm sau 
        defaultDate: moment(appointment.time),
        locale: 'vi', // Thiết lập tiếng Việt
        widgetPositioning: {
            horizontal: 'auto', // Tự động điều chỉnh theo chiều ngang
            vertical: 'bottom'  // Hiển thị bên dưới trường nhập liệu
        }
    });

    $('#modal_description_input').val(appointment.description);
    $('#modal_contact_input').val(appointment.contact);

    utils.set_char_count('#modal_contact_input', '#modal_contact_counter');

    if (appointment.details.length != 0) {
        $.each(appointment.details, function (idx, detail) {
            const newRow = $(`
                <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                    <div class="col-12 col-lg-6 mb-1 mb-lg-0">
                        <select class="form-control select2bs4 modal-service-select" width="100%" required 
                        data-placeholder="Chọn dịch vụ"></select>
                    </div>
        
                    <div class="col-12 col-lg-5 mb-1 mb-lg-0">
                        <select class="form-control select2bs4 modal-option-select" width="100%" required 
                        data-placeholder="Chọn option"></select>
                    </div>

                    <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
                        <button class="btn btn-sm btn-danger remove-service-btn w-100">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </button>
                    </div>
                </div>
            `);

            // Thêm hàng mới vào #service-wrapper
            $("#service-wrapper").append(newRow);

            // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
            newRow.find(".select2bs4").select2({
                allowClear: true,
                theme: "bootstrap",
                closeOnSelect: true,
                width: "100%",
                language: "vi",
            });

            const $serviceSelect = newRow.find(".modal-service-select");
            const $optionSelect = newRow.find(".modal-option-select");
            $.each(serviceOptionList, function (idx, val) {
                $serviceSelect.append(
                    `<option value="${val.id}">${val.name}</option>`
                );
            });

            // Thêm sự kiện cho service-select và xử lý option-select
            newRow.find(".modal-service-select").on("change", function () {
                let id = $(this).val();
                const wrapper = $(this).closest(".service-option-wrapper");
                const $optionSelect = wrapper.find(".modal-option-select");
                if (id == null) {
                    $optionSelect.empty();
                    return;
                }

                const listOptionPrices = serviceOptionList.find(
                    (item) => item.id == id
                );
                $optionSelect.empty(); // Đảm bảo xóa các option cũ

                $.each(listOptionPrices.optionPrices, function (idx, val) {
                    const option = new Option(val.name, val.id, false, false);
                    $(option).attr(
                        "data-price",
                        utils.formatVNDCurrency(val.price)
                    );
                    $optionSelect.append(option);
                });
                $optionSelect.val("").trigger("change");

                // Khởi tạo Select2 với template tùy chỉnh cho option
                $optionSelect.select2({
                    templateResult: formatOption,
                    templateSelection: formatOption,
                    width: "100%",
                    theme: "bootstrap",
                });
            });

            $serviceSelect.val(detail.service.id).trigger("change");
            if (detail.option) {
                $optionSelect.val(detail.option.id).trigger("change");
            }
        });
    }

    $("#add-service-btn").click(function (e) {
        const newRow = $(`
            <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                <div class="col-12 col-lg-6 mb-1 mb-lg-0">
                    <select class="form-control select2bs4 modal-service-select" width="100%" required 
                    data-placeholder="Chọn dịch vụ"></select>
                </div>
    
                <div class="col-12 col-lg-5 mb-1 mb-lg-0">
                    <select class="form-control select2bs4 modal-option-select" width="100%" required 
                    data-placeholder="Chọn option"></select>
                </div>

                <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
                    <button class="btn btn-sm btn-danger remove-service-btn w-100">
                        <i class="fa-regular fa-circle-xmark fa-lg"></i>
                    </button>
                </div>
            </div>
        `);

        // Thêm hàng mới vào #service-wrapper
        $("#service-wrapper").append(newRow);

        // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
        newRow.find(".select2bs4").select2({
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            width: "100%",
            language: "vi",
        });

        const $serviceSelect = newRow.find(".modal-service-select");
        $.each(serviceOptionList, function (idx, val) {
            $serviceSelect.append(
                `<option value="${val.id}">${val.name}</option>`
            );
        });
        $serviceSelect.val("").trigger("change");

        // Thêm sự kiện cho service-select và xử lý option-select
        newRow.find(".modal-service-select").on("change", function () {
            let id = $(this).val();
            const wrapper = $(this).closest(".service-option-wrapper");
            const $optionSelect = wrapper.find(".modal-option-select");
            if (id == null) {
                $optionSelect.empty();
                return;
            }

            const listOptionPrices = serviceOptionList.find(
                (item) => item.id == id
            );
            $optionSelect.empty(); // Đảm bảo xóa các option cũ

            $.each(listOptionPrices.optionPrices, function (idx, val) {
                const option = new Option(val.name, val.id, false, false);
                $(option).attr(
                    "data-price",
                    utils.formatVNDCurrency(val.price)
                );
                $optionSelect.append(option);
            });
            $optionSelect.val("").trigger("change");

            // Khởi tạo Select2 với template tùy chỉnh cho option
            $optionSelect.select2({
                templateResult: formatOption,
                templateSelection: formatOption,
                width: "100%",
                theme: "bootstrap",
            });
        });
    });

    
    $(document).off('click', '.remove-service-btn');
    $(document).on("click", ".remove-service-btn", function () {
        var totalRows = $("#service-wrapper .row").length;

        if (totalRows == 1) {
            Toast.fire({
                icon: "warning",
                title: "Không thể xóa! Phải có ít nhất một dịch vụ",
            });
            return;
        } else {
            $(this).closest(".row").remove();
        }
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    Swal.close();

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(async function () {
        const selectedDate = $('#reservationdatetime').datetimepicker('date');
        let isoDate;
         
        try {
            isoDate = selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss') : null;
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Lỗi lấy thời gian hẹn",
                text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
            });
            return;
        }

        if (!isoDate) {
            Swal.fire({
                icon: "error",
                title: "Lỗi lấy thời gian hẹn",
                text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
            });
            return;
        }

        const selectedTime = moment(selectedDate).format("HH:mm"); // Chỉ lấy phần giờ phút
        const selectedMoment = moment(selectedTime, "HH:mm"); // Chuyển đổi thành moment

        // Kiểm tra xem thời gian đặt hẹn có nằm trong khung giờ mở cửa không
        if (selectedMoment.isBefore(OPENING_TIME) || selectedMoment.isAfter(CLOSING_TIME)) {
            Swal.fire({
                icon: "warning",
                title: "Thời gian không hợp lệ",
                html: `Vui lòng chọn thời gian hẹn trong khung giờ mở cửa<br><b>Từ ${OPENING_TIME._i} đến ${CLOSING_TIME._i}</b>`,
            });
            return;
        }
        
        let contact = $('#modal_contact_input').val();
        let description = $("#modal_description_input").val().trim();

        let serviceOptions = [];
        var hasError = false; // Biến cờ để theo dõi lỗi

        // Duyệt qua từng phần tử trong #service-wrapper
        $("#service-wrapper .row").each(function () {
            var selectedService = $(this).find(".modal-service-select").val();
            var selectedOption = $(this).find(".modal-option-select").val() || null;

            if (selectedService == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn dịch vụ",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            
            serviceOptions.push({
                serviceId: selectedService,
                optionId: selectedOption,
            });
        });

        if (hasError) {
            return;
        }

        let warning = await Swal.fire({
            title: "Cập nhật thông tin đặt hẹn",
            text: "Xác nhận cập nhật thông tin cho cuộc hẹn này?",
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Đồng ý",
            reverseButtons: true
        });
        
        if (!warning.isConfirmed) {
            return;
        }

        $.ajax({
            type: "PUT",
            url: "/api/appointment/staff-update/" + id,
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                time: isoDate,
                contact: contact,
                description: description,
                details: serviceOptions.map((detail) => ({
                    serviceId: detail.serviceId,
                    optionId: detail.optionId,
                }))
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: async function (response) {
                if (response.code == 1000) {
                    await loadListAppointment();
                    Swal.close();
                    $("#modal_id").modal("hide");
                    Toast.fire({
                        icon: "success",
                        title: `Cập nhật thành công`,
                    });
                    
                } else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code),
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.log(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        });
    });
});

$('#new-appointment-btn').click( async function (e) { 
    Swal.showLoading();

    if (customerList.length == 0) {
        let res = null;
        try {
            res = await $.ajax({
                type: "GET",
                url: "/api/users/customers",
                headers: utils.defaultHeaders(),
                dataType: "json",
            });
        } catch (error) {
            Swal.close();
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(error).message,
            });
            return;
        } 
        
        if (!res) {
            Swal.close();
            return;
        }
        
        if (res.code == 1000) {
            customerList = res.data;
        } else {
            Swal.close();
            console.error(res);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getErrorMessage(res.code),
            });
            return;
        }
    }

    clear_modal();
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_title").text("Tạo mới cuộc hẹn");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center">
                <label class="mb-0">Chọn hồ sơ khách hàng</label>
                <span class="font-weight-light font-italic">*Tìm kiếm theo tên, SĐT hoặc email</span>
            </div>
            <div class="form-group">
                <select id="modal-customer-select" class="form-control" style="width: 100%;"
                data-placeholder="Chọn 1 hồ sơ khách hàng">
                </select>
            </div>
            <div id="modal-customer-info" class="rounded border p-2 mt-2" hidden></div>
        </div>

        <div class="form-group">
            <label>Chọn thời gian:</label>
            <div class="input-group date" id="reservationdatetime" data-target-input="nearest">
                <input role="button" type="text" class="form-control datetimepicker-input" data-target="#reservationdatetime" readonly>
                <div class="input-group-append" data-target="#reservationdatetime" data-toggle="datetimepicker">
                    <div class="input-group-text"><i class="fa-regular fa-calendar-days"></i></div>
                </div>
            </div>
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0 px-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_contact_input">Thông tin liên lạc khách hàng</label>
                    <kbd id="modal_contact_counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_contact_input" maxlength="255" placeholder="Nhập thông tin liên lạc">
        </div>

        <div class="form-group">
            <label for="modal_description_input">Ghi chú</label>
            <textarea wrap="soft" 
                class="form-control" 
                id="modal_description_input" 
                rows="4" maxlength="65000" 
                placeholder="Ghi chú cho cuộc hẹn"></textarea>
        </div>

        <div class="form-group">
            <label class="mb-0">Chọn dịch vụ và Tùy chọn (option)</label><br>
            <div id="service-wrapper" class="mt-1">
                <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                    <div class="col-12 col-lg-6 mb-1 mb-lg-0">
                        <select class="form-control select2bs4 modal-service-select" width="100%" required 
                        data-placeholder="Chọn dịch vụ"></select>
                    </div>
        
                    <div class="col-12 col-lg-5 mb-1 mb-lg-0">
                        <select class="form-control select2bs4 modal-option-select" width="100%" required 
                        data-placeholder="Chọn option"></select>
                    </div>

                    <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
                        <button class="btn btn-sm btn-danger remove-service-btn w-100">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
            <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
        </div>
    `);

    // Hiển thị datetimepicker khi nhấp vào input
    $('#reservationdatetime input').on('focus', function() {
        $('#reservationdatetime').datetimepicker('show');
    });

    utils.set_char_count('#modal_contact_input', '#modal_contact_counter');

    // Cấu hình DateTimePicker
    $('#reservationdatetime').datetimepicker({
        format: 'HH:mm, [ngày] DD/MM/YYYY', // Định dạng ngày giờ
        icons: { 
            time: 'fa-regular fa-clock', 
            date: 'fa-solid fa-calendar-day' 
        },
        minDate:  moment(),
        maxDate: moment().add(1, 'years'), // Giới hạn đến 1 năm sau 
        defaultDate: moment(),
        locale: 'vi', // Thiết lập tiếng Việt
        widgetPositioning: {
            horizontal: 'auto', // Tự động điều chỉnh theo chiều ngang
            vertical: 'bottom'  // Hiển thị bên dưới trường nhập liệu
        }
    });

    $("#modal-customer-select").empty();
    $('#modal-customer-select').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        language: "vi",
        minimumInputLength: 1,
        ajax: {
            transport: function (params, success, failure) {                
                let results = [];
    
                // Lấy từ khóa tìm kiếm
                let term = params.data.q || "";
    
                // Lọc userList theo cả name, phone và email
                let filteredUsers = customerList.filter((user) => {
                    let normalizedName = utils.removeVietnameseTones(user.name.toLowerCase()); // Tên đã loại bỏ dấu
                    let termNormalized = utils.removeVietnameseTones(term.toLowerCase()); // Searching key đã loại bỏ dấu
                    
                    let nameMatch = normalizedName.includes(termNormalized);
                    let phoneMatch = user.phone && user.phone.includes(term);
                    let emailMatch = user.accounts.length > 0 && user.accounts[0].email && user.accounts[0].email.includes(term);
    
                    return nameMatch || phoneMatch || emailMatch;
                });
    
                // Map kết quả vào định dạng mà Select2 yêu cầu
                results = filteredUsers.map((user) => {
                    return {
                        id: user.id,
                        text: user.name, // Chỉ sử dụng tên ở đây
                        phone: user.phone,
                        email: user.accounts.length > 0 ? user.accounts[0].email : "", // Nạp email của phần tử đầu tiên
                        accountCount: user.accounts.length, // Số lượng tài khoản
                    };
                });
    
                // Trả về kết quả
                success({
                    results: results,
                });
            },
            delay: 250,
            cache: false,
        },
        escapeMarkup: function (markup) {
            return markup; // Allow HTML in text
        },
        templateResult: function (data) {
            let result = `${data.text}`;
            if (data.phone != null) {
                result += ` - ${data.phone}`;
            }
    
            if (data.accountCount != null && data.accountCount != 0) {
                result += ` <small><span class="badge badge-info">Có tài khoản</span></small>`;
            }
    
            return `<div>${result}</div>`;
        },
        templateSelection: function (data) {
            let selection = `${data.text}`;
    
            if (data.phone != null) {
                selection += ` - ${data.phone}`;
            }
    
            if (data.accountCount != null && data.accountCount != 0) {
                selection += ` <small><span class="badge badge-info">Có tài khoản</span></small>`;
            }
    
            return `<div>${selection}</div>`;
        },
        language: {
            errorLoading: function () {
                return "Không thể tải kết quả.";
            },
            inputTooLong: function (args) {
                let overChars = args.input.length - args.maximum;
                return `Vui lòng xóa bớt ${overChars} ký tự.`;
            },
            inputTooShort: function (args) {
                let remainingChars = args.minimum - args.input.length;
                return `Vui lòng nhập thêm ${remainingChars} ký tự.`;
            },
            loadingMore: function () {
                return "Đang tải thêm kết quả...";
            },
            maximumSelected: function (args) {
                return `Bạn chỉ có thể chọn tối đa ${args.maximum} mục.`;
            },
            noResults: function () {
                return "Không có kết quả.";
            },
            searching: function () {
                return "Đang tìm kiếm...";
            },
            removeAllItems: function () {
                return "Xóa tất cả các mục";
            },
        }
    });

    let selectedCustomer;

    $('#modal-customer-select').on('change', function (e) {
        const selectedUser = $(this).val(); // Lấy giá trị được chọn
        if (selectedUser) {
            const userData = customerList.find(user => user.id === selectedUser);
            selectedCustomer = userData;

            if(!userData) return;

            let html = "";
            html += `<b>- Tên khách hàng: </b>${userData.name}<br>`;

            if(userData.accounts.length > 0) { 
                html += `<b>- Email: </b>${userData.accounts ? userData.accounts[0].email : "Không có"}<br>`;
            } else {
                html += `<b>- Email: </b>Không có<br>`;
            }

            html += `<b>- SĐT: </b>${userData.phone ? userData.phone : "Không có"}<br>`;

            html += `<b>- Giới tính: </b>${userData.gender === 0 ? "Nữ" : userData.gender === 1 ? "Nam" : "Khác"}<br>`;

            html += `<b>- Địa chỉ: </b>${userData.address ? userData.address.address : "Không có"}<br>`;

            let roleHtml = "";
            userData.roles.forEach((role, idx) => {
                if( idx != 0) {
                    roleHtml += ", ";
                }
                roleHtml += role.roleName;
            });

            html += `<b>- Vai trò: </b>${roleHtml}<br>`;

            let carHtml = "";
            if (userData.cars.length > 0) {
                userData.cars.forEach((car, idx) => {
                    carHtml += `&#8226; ${car.model.brand.brand} ${car.model.model}  - BS: "${car.numPlate}" (${car.plateType.type})<br>`;
                })
            }

            html += carHtml!=="" ? `<b>- Xe: </b><br><div class="px-3">${carHtml}</div>` : "<b>- Xe: </b>Chưa đăng ký";
            
            $('#modal-customer-info').html(html);
            $('#modal-customer-info').prop('hidden', false);
        } else {
            selectedCustomer == null;
            $('#modal-customer-info').html('');
            $('#modal-customer-info').prop('hidden', true);
        }
    });

    $(".select2bs4").select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        width: "100%",
        language: "vi",
    });

    $.each(serviceOptionList, function (idx, val) {
        $(".modal-service-select").append(
            `<option value="${val.id}">${val.name}</option>`
        );
    });
    $(".modal-service-select").val("").trigger("change");

    $(".modal-service-select").on("change", function () {
        let id = $(this).val();
        const wrapper = $(this).closest(".service-option-wrapper");
        const $optionSelect = wrapper.find(".modal-option-select");
        if (id == null) {
            $optionSelect.empty();
            return;
        }

        const listOptionPrices = serviceOptionList.find(
            (item) => item.id == id
        );
        $optionSelect.empty(); // Đảm bảo xóa các option cũ

        $.each(listOptionPrices.optionPrices, function (idx, val) {
            const option = new Option(val.name, val.id, false, false);
            $(option).attr(
                "data-price",
                utils.formatVNDCurrency(val.price)
            );
            $optionSelect.append(option);
        });
        $optionSelect.val("").trigger("change");

        // Khởi tạo Select2 với template tùy chỉnh cho option
        $optionSelect.select2({
            templateResult: formatOption,
            templateSelection: formatOption,
            width: "100%",
            theme: "bootstrap",
        });
    });

    $("#add-service-btn").click(function (e) {
        const newRow = $(`
            <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                <div class="col-12 col-lg-6 mb-1 mb-lg-0">
                    <select class="form-control select2bs4 modal-service-select" width="100%" required 
                    data-placeholder="Chọn dịch vụ"></select>
                </div>
    
                <div class="col-12 col-lg-5 mb-1 mb-lg-0">
                    <select class="form-control select2bs4 modal-option-select" width="100%" required 
                    data-placeholder="Chọn option"></select>
                </div>

                <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
                    <button class="btn btn-sm btn-danger remove-service-btn w-100">
                        <i class="fa-regular fa-circle-xmark fa-lg"></i>
                    </button>
                </div>
            </div>
        `);

        // Thêm hàng mới vào #service-wrapper
        $("#service-wrapper").append(newRow);

        // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
        newRow.find(".select2bs4").select2({
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            width: "100%",
            language: "vi",
        });

        const $serviceSelect = newRow.find(".modal-service-select");
        $.each(serviceOptionList, function (idx, val) {
            $serviceSelect.append(
                `<option value="${val.id}">${val.name}</option>`
            );
        });
        $serviceSelect.val("").trigger("change");

        // Thêm sự kiện cho service-select và xử lý option-select
        newRow.find(".modal-service-select").on("change", function () {
            let id = $(this).val();
            const wrapper = $(this).closest(".service-option-wrapper");
            const $optionSelect = wrapper.find(".modal-option-select");
            if (id == null) {
                $optionSelect.empty();
                return;
            }

            const listOptionPrices = serviceOptionList.find(
                (item) => item.id == id
            );
            $optionSelect.empty(); // Đảm bảo xóa các option cũ

            $.each(listOptionPrices.optionPrices, function (idx, val) {
                const option = new Option(val.name, val.id, false, false);
                $(option).attr(
                    "data-price",
                    utils.formatVNDCurrency(val.price)
                );
                $optionSelect.append(option);
            });
            $optionSelect.val("").trigger("change");

            // Khởi tạo Select2 với template tùy chỉnh cho option
            $optionSelect.select2({
                templateResult: formatOption,
                templateSelection: formatOption,
                width: "100%",
                theme: "bootstrap",
            });
        });
    });

    
    $(document).off('click', '.remove-service-btn');
    $(document).on("click", ".remove-service-btn", function () {
        var totalRows = $("#service-wrapper .row").length;

        if (totalRows == 1) {
            Toast.fire({
                icon: "warning",
                title: "Không thể xóa! Phải có ít nhất một dịch vụ",
            });
            return;
        } else {
            $(this).closest(".row").remove();
        }
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    Swal.close();

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(async function () {
        const selectedDate = $('#reservationdatetime').datetimepicker('date');
        let isoDate;
        
        if (!selectedCustomer) {
            Swal.fire({
                icon: "warning",
                title: "Chưa chọn khách hàng",
                text: "Vui lòng chọn khách cần đặt hẹn!",
            });
            return;
        }

        try {
            isoDate = selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss') : null;
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Lỗi lấy thời gian hẹn",
                text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
            });
            return;
        }

        if (!isoDate) {
            Swal.fire({
                icon: "error",
                title: "Lỗi lấy thời gian hẹn",
                text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
            });
            return;
        }

        const selectedTime = moment(selectedDate).format("HH:mm"); // Chỉ lấy phần giờ phút
        const selectedMoment = moment(selectedTime, "HH:mm"); // Chuyển đổi thành moment

        // Kiểm tra xem thời gian đặt hẹn có nằm trong khung giờ mở cửa không
        if (selectedMoment.isBefore(OPENING_TIME) || selectedMoment.isAfter(CLOSING_TIME)) {
            Swal.fire({
                icon: "warning",
                title: "Thời gian không hợp lệ",
                html: `Vui lòng chọn thời gian hẹn trong khung giờ mở cửa<br><b>Từ ${OPENING_TIME._i} đến ${CLOSING_TIME._i}</b>`,
            });
            return;
        }

        if (selectedDate < moment()) {
            Swal.fire({
                icon: "warning",
                title: "Thời gian không hợp lệ",
                text: "Thời gian đặt hẹn phải bắt đầu từ bây giờ",
            });
            return;
        }
        
        let contact = $('#modal_contact_input').val();
        let description = $("#modal_description_input").val().trim();

        let serviceOptions = [];
        var hasError = false; // Biến cờ để theo dõi lỗi

        // Duyệt qua từng phần tử trong #service-wrapper
        $("#service-wrapper .row").each(function () {
            var selectedService = $(this).find(".modal-service-select").val();
            var selectedOption = $(this).find(".modal-option-select").val() || null;

            if (selectedService == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn dịch vụ",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            
            serviceOptions.push({
                serviceId: selectedService,
                optionId: selectedOption,
            });
        });

        if (hasError) {
            return;
        }

        let warning = await Swal.fire({
            title: "Tạo cuộc hẹn mới?",
            html: `Xác nhận tạo cuộc hẹn mới với <b>${selectedCustomer.name}</b><br>` + (selectedCustomer.accounts.length>0 ? `Thông báo sẽ được gửi đến <b>${selectedCustomer.accounts[0].email}</b>` : ""),
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Đồng ý",
            reverseButtons: true
        });
        
        if (!warning.isConfirmed) {
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/appointment",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                advisorId: null,
                customerId: selectedCustomer.id,
                time: isoDate,
                contact: contact,
                description: description,
                status: 1,
                details: serviceOptions.map((detail) => ({
                    serviceId: detail.serviceId,
                    optionId: detail.optionId,
                }))
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: async function (response) {
                if (response.code == 1000) {
                    await loadListAppointment();
                    Swal.close();
                    $("#modal_id").modal("hide");
                    Swal.fire({
                        icon: "success",
                        title: `Đã tạo cuộc hẹn`,
                        html: `Tạo thành công cuộc hẹn với người dùng<br>${selectedCustomer.name}`,
                        showCancelButton: false,
                        timer: 3000
                    });
                } else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code),
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.log(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        });
    });
});