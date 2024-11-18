import * as utils from "/dist/js/utils.js";

utils.introspectPermission('STATISTICS');

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

var dataTable;
var selectedInvoice;

$(document).ready(function () {
    moment.updateLocale('vi', {
        week: { dow: 1 } // dow: 1 đặt Thứ Hai là ngày đầu tuần
    });

    let hashStart = utils.getHashParam('start');
    let hashEnd = utils.getHashParam('end');
    let status = utils.getHashParam('status');

    if (!hashStart || !hashEnd) {
        utils.setHashParam('start', null);
        utils.setHashParam('end', null);
    }

    if (status) {
        $('#search-type-select').val(status).change();
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
        //     days: 31  // Giới hạn không quá 7 ngày
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
    let startOfDay = moment().subtract(6, 'days').startOf('day');  // 0h hôm nay
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

    dataTable = $("#data-table").DataTable({
        responsive: true,
        pageLength: 10,
        lengthChange: true,
        autoWidth: false,
        searching: true,
        language: {
            paginate: {
                next: "Sau",
                previous: "Trước",
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "Không có dữ liệu để hiển thị",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
            loadingRecords: "Đang tải dữ liệu...",
            zeroRecords: "Không tìm thấy dữ liệu",
        },
        buttons: [
            { extend: "copy", text: "Copy" },
            { extend: "csv", text: "CSV" },
            { extend: "excel", text: "Excel" },
            {
                extend: "pdf",
                text: "PDF",
            },
            { extend: "print", text: "Print" },
            { extend: "colvis", text: "Hiển thị" },
        ],
        columnDefs: [
            { orderable: false, targets: [0, 2] },
            { targets: '_all', className: "text-center" },
        ],
        columns: [
            { data: null },{
                data: "car", class: "text-left",
                render: function (data, type, row) {
                    let badge = "";
                    if(data.plateType.type.includes('xanh')){
                        badge = `<span class="badge badge-primary">&nbsp;${data.plateType.type}</span><br>`
                    } else if(data.plateType.type.includes('trắng')) {
                        badge = `<span class="badge badge-light">&nbsp;${data.plateType.type}</span><br>`
                    } else if(data.plateType.type.includes('vàng')) {
                        badge = `<span class="badge badge-warning">&nbsp;${data.plateType.type}</span><br>`
                    } else if(data.plateType.type.includes('đỏ')) {
                        badge = `<span class="badge badge-danger">&nbsp;${data.plateType.type}</span><br>`
                    } else {
                        badge = `<span class="badge badge-secondary">&nbsp;${data.plateType.type}</span><br>`
                    }

                    return `${data.numPlate} ${badge}<i>${data.model.brand.brand} ${data.model.model}</i>`;
                },
            },
            {
                data: "customer", class: "text-left",
                render: function (data, type, row) {
                    if (data==null) {
                        return `<i>Khách vãng lai</i>`;
                    } else {
                        let html = "";
                        html += data.name;
                        if(data.phone && data.phone != "") {
                            html += `<br><small>SĐT: ${data.phone}</small>`;
                        }
                        if(data.accounts.length > 0 && data.accounts[0]) {
                            html += `<br><small>Email: ${data.accounts[0].email}</small>`;
                        }

                        return html;
                    }
                },
            },
            {
                data: "serviceDate",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        let time = utils.getTimeAsJSON(data);
                        let html = `${time.hour}:${time.min}, ${time.date}/${time.mon}/${time.year}`;

                        return html;
                    }
                    return data;
                },
            },
            {
                data: "odo",
                render: function (data, type, row) {
                    let html = "Không xác định";

                    if(data) html = utils.formatCurrent(data);

                    return html;
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Hoàn thành</span></center>';
                    } else if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp;Đang thi công</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Đã hủy</span></center>';
                    }
                },
            },
            {
                data: "payableAmount",
                className: "text-right",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        // Hiển thị số tiền theo định dạng tiền tệ VN
                        return data.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        });
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return data;
                },
            },
        ],
        headerCallback: function (thead) {
            $(thead).find("th").addClass("text-center"); // Thêm class 'text-center' cho header
        },
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api.column(0, { page: "current" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerHTML = start + i + 1;
                });
        },
        initComplete: function () {
            this.api()
                .buttons()
                .container()
                .appendTo("#data-table_wrapper .col-md-6:eq(0)");
        },
    });


    
    // $.ajax({
    //     type: "GET",
    //     url: "/api/services/enable-with-price",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": ""
    //     },
    //     dataType: "json",
    //     success: function (res) {
    //         if (res.code == 1000 && res.data) {
    //             serviceOptionList = res.data;
    //         }
    //     },
    //     error: function (xhr, status, error) {
    //         console.error(utils.getXHRInfo(xhr));
    //     },
    // });
    
    // $.ajax({
    //     type: "GET",
    //     url: "/api/users/customers",
    //     headers: utils.defaultHeaders(),
    //     dataType: "json",
    //     success: function (res) {
    //         if (res.code == 1000) {
    //             customerList = res.data;
    //         } else {
    //             console.warn("Cannot get customer list");
    //             console.error(res);
    //         }
    //     },
    //     error: function(xhr, status, error) {
    //         console.warn("Cannot get customer list");
    //         console.error(xhr);
    //     }
    // });

    // $.ajax({
    //     type: "POST",
    //     url: "/api/common-param/list-param",
    //     headers: utils.noAuthHeaders(),
    //     data: JSON.stringify([
    //             "OPENING_TIME",
    //             "CLOSING_TIME",
    //         ]
    //     ),
    //     dataType: "json",
    //     success: function (res) {
    //         if (res.code == 1000 && res.data) {
    //             let data = res.data;
    //             OPENING_TIME = moment(data[0].value, "HH:mm");
    //             CLOSING_TIME = moment(data[1].value, "HH:mm");
                
    //             if (!OPENING_TIME.isValid() || !CLOSING_TIME.isValid()) {
    //                 Swal.fire({
    //                     icon: "error",
    //                     title: "Lỗi tham số",
    //                     text: OPENING_TIME.isValid() ? "Giờ đóng cửa không hợp lệ, vui lòng liên hệ quản trị viên" : "Giờ mở cửa không hợp lệ, vui lòng liên hệ quản trị viên",
    //                 });
    //                 return;
    //             }
    //         }
    //         else {
    //             console.error(res);
    //         }
    //     },
    //     error: function (xhr, status, error) {
    //         console.error(xhr.responseJSON);
    //     }
    // });
});

$('#card-submit-btn').click( async function () { 
    loadListHistory();
});

async function loadListHistory() {
    $('.order-quantity').prop('hidden', true);

    let status = null;
    if($('#search-type-select').val() === "all") {
        status = null;
        $('.order-quantity').prop('hidden', false);
    } else if ($('#search-type-select').val() === "paid") {
        status = 1;
        $('#total-paid').closest('div').prop('hidden', false);
    }  else if ($('#search-type-select').val() === "proceeding") {
        status = 0;
        $('#total-proceeding').closest('div').prop('hidden', false);
    }  else if ($('#search-type-select').val() === "canceled") {
        status = -1;
        $('#total-canceled').closest('div').prop('hidden', false);
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
            url: "/api/history/all-history-by-time-range" +`?start=${startDate}&end=${endDate}` + (status!==null ? `&status=${status}` : ""),
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
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

    Swal.close();
    if (!res) return;

    if (res.code == 1000) {
        utils.setHashParam('start', startDate);
        utils.setHashParam('end', endDate);
        utils.setHashParam('status', $('#search-type-select').val());

        let data = res.data.map((invoice, index) => ({
            number: index+1, // Số thứ tự tự động tăng
            id: invoice.id,
            car: invoice.car,
            advisor: invoice.advisor,
            customer: invoice.customer,
            odo: invoice.odo,
            serviceDate: invoice.serviceDate,
            summary: invoice.summary,
            diagnose: invoice.diagnose,
            totalAmount: invoice.totalAmount,
            discount: invoice.discount,
            payableAmount: invoice.payableAmount,
            status: invoice.status,
        }));

        let totalPayableAmount = res.data
        .filter(invoice => invoice.status === 1) // Lọc các invoice có status = 1
        .reduce((sum, invoice) => sum + invoice.payableAmount, 0);

        // Đếm số lượng invoice theo từng status
        let totalPaid = res.data.filter(invoice => invoice.status === 1).length; // Status = 1
        let totalProceeding = res.data.filter(invoice => invoice.status === 0).length; // Status = 0
        let totalCanceled = res.data.filter(invoice => invoice.status === -1).length; // Status = -1

        // Hiển thị các giá trị lên giao diện
        $('#total-payable-amount').text(utils.formatVNDCurrency(totalPayableAmount) || 0);
        $('#total-paid').text(totalPaid || 0);
        $('#total-proceeding').text(totalProceeding || 0);
        $('#total-canceled').text(totalCanceled || 0);

        // Cập nhật DataTable với dữ liệu đã lọc
        $('#data-table').DataTable().clear().rows.add(data).draw();
    }
    else {
        Swal.close
        console.error(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code)
        });
    }
}

$(document).on('dblclick', '#data-table tbody tr', async function () {
    if ($(this).find("td").hasClass("dataTables_empty")) return;

    selectedInvoice = $('#data-table').DataTable().row($(this)).data();
    var id = selectedInvoice.id;

    let res; 

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
    } catch (error){
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
        });
        return;
    }

    Swal.close();
    if (!res) return;

    if (res.code != 1000) {
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code),
        });
        return;
    }
    const invoice = res.data;
    let modalName ="";

    if (invoice.status === 0) { modalName = "Đơn dịch vụ đang thi công"; }
    else if (invoice.status === 1) { modalName = "Hóa đơn đã thanh toán"; }
    else { modalName = "Đơn dịch vụ đã hủy"; }

    clear_modal();
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_title").html(modalName); 
    $("#modal_body").append(`
        <label>Thông tin khách hàng</label>
        <div class="rounded border p-2" id="modal-customer-info">
        </div>

        <label class="mt-2">Thông tin cố vấn dịch vụ</label>
        <div class="rounded border p-2" id="modal-advisor-info">
        </div>

        <label class="mt-2">Tóm tắt vấn đề</label>
        <p class="rounded border p-2" id="modal-summary">
        </p>

        <label>Chẩn đoán, đề xuất</label>
        <p class="rounded border p-2" id="modal-diagnose">
        </p>

        <label>Danh sách dịch vụ</label>
        <div class="row">
            <div class="col-12 table-responsive">
                <table id="table-details" class="table table-striped" width="100%">
                    <thead>
                        <tr>
                            <th class="text-center" min-width="20%">Dịch vụ</th>
                            <th class="text-center" width="20%">Số lượng</th>
                            <th class="text-center" width="20%">Giảm giá (%)</th>
                            <th class="text-center" width="20%">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <!-- /.col -->
        </div>
        <!-- /.row -->

        <label>Thanh toán</label>
        <div class="table-responsive">
            <table class="table">
            <tr class="row w-100">
                <th class="col-6">Tổng cộng:</th>
                <td class="col-6" id="modal-total-amount">${utils.formatVNDCurrency(invoice.totalAmount)}</td>
            </tr>
            <tr class="row w-100">
                <th class="col-6">Thuế (%):</th>
                <td class="col-6" id="modal-tax">${invoice.tax} %</td>
            </tr>
            <tr class="row w-100">
                <th class="col-6">Giảm giá (%):</th>
                <td class="col-6" id="modal-discount">${invoice.discount} %</td>
            </tr>
            <tr class="row w-100">
                <th class="col-6">Tổng thanh toán:</th>
                <td class="col-6" id="modal-payable-amount">${utils.formatVNDCurrency(invoice.payableAmount)}</td>
            </tr>
            </table>
        </div>
        <hr>

        <label class="mt-2">Hình ảnh trước thi công</label>
        <div class="upload__box image-card">
            <div class="upload__btn-box">
                <label class="image-card-btn reload-images-btn mr-2" id="pre-service-image">
                <span>Xem ảnh</span>
                </label>
            </div>
            <div class="upload__img-wrap" id="pre-service"></div>
        </div>

        <label class="mt-2">Hình ảnh sau thi công</label>
        <div class="upload__box image-card">
            <div class="upload__btn-box">
                <label class="image-card-btn reload-images-btn mr-2" id="post-service-image">
                <span>Xem ảnh</span>
                </label>
            </div>
            <div class="upload__img-wrap" id="post-service"></div>
        </div>
    `);

    // LOAD CUSTOMER INFO 
    if (invoice.customer) {
        let userHtml = `<b>- Họ tên: </b><span id="modal-customer-name">${invoice.customer.name}</span>`;
        if (invoice.customer.address) {
            userHtml += `<br><b>- Địa chỉ: </b><span id="modal-customer-address">${invoice.customer.address.address}</span>`;
        }
        if (invoice.customer.phone) {
            userHtml += `<br><b>- SĐT: </b><span id="modal-customer-phone">${invoice.customer.phone}</span>`;
        }
        if (invoice.customer.accounts[0]) {
            userHtml += `<br><b>- Email: </b><span id="modal-customer-email">${invoice.customer.accounts[0].email}</span>`;
        }
        $('#modal-customer-info').html(userHtml);   
    }
    else {
        $('#modal-customer-info').html(`<p class="text-center font-weight-bold my-1">Khách vãng lai</p>`);
    }

    // LOAD ADVISOR INFO 
    let advisorHtml = `<b>- Họ tên: </b><span id="modal-advisor-name">${invoice.advisor.name}</span>`;
    if (invoice.advisor.phone) {
        advisorHtml += `<br><b>- SĐT: </b><span id="modal-advisor-phone">${invoice.advisor.phone}</span>`;
    }
    if (invoice.advisor.accounts[0]) {
        advisorHtml += `<br><b>- Email: </b><span id="modal-advisor-email">${invoice.advisor.accounts[0].email}</span>`;
    }
    $('#modal-advisor-info').html(advisorHtml);   

    if (invoice.summary != null && invoice.summary.length > 0) {
        $('#modal-summary').append(invoice.summary.replace(/\n/g, "<br>"));
    } else {
        $('#modal-summary').append(`<span class="font-italic font-weight-bold" style="text-align: center;">Không có tóm tắt</span>`);
    }

    if (invoice.diagnose != null && invoice.diagnose.length > 0) {
        $('#modal-diagnose').append(invoice.diagnose.replace(/\n/g, "<br>"));
    } else {
        $('#modal-diagnose').append(`<span class="font-italic font-weight-bold" style="text-align: center;">Không có chẩn đoán, đề xuất</span>`);
    }

    if (invoice.details != null && invoice.details.length > 0) {
        $.each(invoice.details, function (idx, detail) { 
            let isOdd = idx % 2 === 0;
            $('#table-details').append(
                formatRow(
                    isOdd,
                    detail.serviceName,
                    detail.optionName,
                    detail.price,
                    detail.quantity,
                    detail.discount,
                    detail.finalPrice
                )
            );
        });
    }
    

    $("#modal_footer").append(`
        <div class="d-flex justify-content-between w-100">
        <button type="button" class="btn btn-outline-info" id="modal_print_btn">In đơn</button>
        <button type="button" class="btn btn-primary" id="modal_submit_btn">Đóng</button>
    </div>`
    );

    $("#modal_id").modal("show");

    $('#modal_submit_btn').click(function () { 
        $("#modal_id").modal("hide");
    });
});

$('#modal_id').on('hidden.bs.modal', function () {
    selectedInvoice = null;
});

function formatRow(isOdd, serviceName, optionName, price, quantity, discount, totalPrice) {
    const rowClass = isOdd ? "odd" : "even";
    return `
        <tr class="${rowClass}">
            <td class="text-left">${serviceName}<br><small>${optionName}<br>Giá: ${utils.formatVNDCurrency(price)}</small></td>
            <td class="text-center">${quantity}</td>
            <td class="text-center">${discount}%</td>
            <td class="text-right">${utils.formatVNDCurrency(totalPrice)}</td>
        </tr>
    `;
}

async function loadPreImageByHistoryId() {
    let orderID = selectedInvoice.id;
    if (!orderID) {
        Swal.fire({
            icon: "warning",
            title: "Đã xảy ra lỗi",
            text: "Không thể lấy ID đơn dịch vụ!",
            timer: 3000,
            showConfirmButton: false,
        });
        return;
    }

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/service-images/pre-service/" + orderID,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Swal.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message,
            text: "Không thể lấy hình ảnh trước thi công!",
            timer: 2000,
            showConfirmButton: false,
        });
        return;
    }
    
    Swal.close();
    if (!res) return;
    if (res.code == 1000) {
        loadPreServiceImage(res.data);
    } else {
        console.error(res);
        Swal.fire({
            icon: "error",
            title: utils.getErrorMessage(res.code),
            showConfirmButton: false,
            timer: 2000
        });
    }
}

$(document).on('click', '#pre-service-image', function() {
    loadPreImageByHistoryId();
})

$(document).on('click', '#post-service-image', function() {
    loadPostImageByHistoryId();
})

async function loadPostImageByHistoryId() {
    let orderID = selectedInvoice.id;
    if (!orderID) {
        Swal.fire({
            icon: "warning",
            title: "Đã xảy ra lỗi",
            text: "Không thể lấy ID đơn dịch vụ!",
            timer: 3000,
            showConfirmButton: false,
        });
        return;
    }

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/service-images/post-service/" + orderID,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Swal.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message,
            text: "Không thể lấy hình ảnh sau thi công!",
            timer: 2000,
            showConfirmButton: false,
        });
        return;
    }
    
    Swal.close();
    if (!res) return;
    if (res.code == 1000) {
        loadPostServiceImage(res.data);
    } else {
        console.error(res);
        Swal.fire({
            icon: "error",
            title: utils.getErrorMessage(res.code),
            showConfirmButton: false,
            timer: 2000
        });
    }
}

$(document).on("click", '[data-toggle="lightbox"]', function (event) {
    event.preventDefault();
    $(this).ekkoLightbox();
});


function loadPreServiceImage(images) {
    const imgWrap = $('#pre-service');
    imgWrap.html('');

    $.each(images, function (idx, val) {
        const base64Image = `data:image/png;base64,${val.image}`;
        const imgSizeMB = calculateImageSize(base64Image); // Hàm tính kích thước ảnh

        const html = `
            <div class='upload__img-box'>
                <a href="${base64Image}" data-toggle="lightbox" data-gallery="gallery-pre-service" data-footer="${val.title} (${imgSizeMB}MB)">
                    <div style='background-image: url(${base64Image}); background-size: cover; background-position: center;'
                        data-number='${$(".upload__img-close").length}'
                        data-file='${val.title}'
                        class='img-bg position-relative'>
                        <div class='overlay d-flex justify-content-center align-items-center'>
                            <span class='img-size'>${imgSizeMB} MB</span>
                        </div>
                    </div>
                </a>
            </div>
        `;

        imgWrap.append(html);
    });
}

function loadPostServiceImage(images) {
    const imgWrap = $('#post-service');
    imgWrap.html('');

    $.each(images, function (idx, val) {
        const base64Image = `data:image/png;base64,${val.image}`;
        const imgSizeMB = calculateImageSize(base64Image); // Hàm tính kích thước ảnh

        const html = `
            <div class='upload__img-box'>
                <a href="${base64Image}" data-toggle="lightbox" data-gallery="gallery-post-service" data-footer="${val.title} (${imgSizeMB}MB)">
                    <div style='background-image: url(${base64Image}); background-size: cover; background-position: center;'
                        data-number='${$(".upload__img-close").length}'
                        data-file='${val.title}'
                        class='img-bg position-relative'>
                        <div class='overlay d-flex justify-content-center align-items-center'>
                            <span class='img-size'>${imgSizeMB} MB</span>
                        </div>
                    </div>
                </a>
            </div>
        `;

        imgWrap.append(html);
    });
}

function calculateImageSize(base64Image) {
    const sizeInBytes = (base64Image.length * (3 / 4)) - 
        (base64Image.endsWith('==') ? 2 : base64Image.endsWith('=') ? 1 : 0);
    return (sizeInBytes / (1024 * 1024)).toFixed(2); // Trả về kích thước MB
}


// $(document).on('click', '.appointment-cancel-btn', async function () {
//     const id = $(this).data('id');

//     let warning = await Swal.fire({
//         title: "Hủy cuộc hẹn",
//         text: "Xác nhận hủy cuộc hẹn này?",
//         icon: "warning",
//         showCancelButton: true,
//         showConfirmButton: true,
//         cancelButtonText: "Hủy",
//         confirmButtonText: "Đồng ý",
//         reverseButtons: true
//     });
    
//     if (!warning.isConfirmed) {
//         return;
//     }
    
//     $.ajax({
//         type: "PUT",
//         url: "/api/appointment/update-status?appointment=" +id+"&status=4",
//         headers: utils.defaultHeaders(),
//         dataType: "json",
//         beforeSend: function() {
//             Swal.showLoading();
//         },
//         success: async function (res) {
//             Swal.close();
//             if (res.code == 1000 && res.data) {
//                 await loadListAppointment();
//                 Swal.fire({
//                     icon: "success",
//                     title: "Đã hủy cuộc hẹn!",
//                     text: "Đã hủy cuộc hẹn thành công!",
//                     showCancelButton: false,
//                     timer: 3000
//                 });
//             } else {
//                 console.error(res);
//                 Swal.fire({
//                     icon: 'error',
//                     title: "Đã xảy ra lỗi",
//                     text: utils.getErrorMessage(res.code),
//                 });
//             }
//         },
//         error: function(xhr, status, error) {
//             Swal.close();
//             console.error(xhr);
//             Swal.fire({
//                 icon: "error",
//                 title: "Đã xảy ra lỗi",
//                 text: utils.getXHRInfo(xhr).message
//             });
//         }
//     });
// });

// $(document).on('click', '.appointment-missed-btn', async function () {
//     const id = $(this).data('id');

//     let warning = await Swal.fire({
//         title: "Cuộc hẹn đã bị bỏ lỡ?",
//         text: "Xác nhận khách hàng đã bỏ lỡ cuộc hẹn này?",
//         icon: "warning",
//         showCancelButton: true,
//         showConfirmButton: true,
//         cancelButtonText: "Hủy",
//         confirmButtonText: "Đồng ý",
//         reverseButtons: true
//     });
    
//     if (!warning.isConfirmed) {
//         return;
//     }
    
//     $.ajax({
//         type: "PUT",
//         url: "/api/appointment/update-status?appointment=" +id+"&status=3",
//         headers: utils.defaultHeaders(),
//         dataType: "json",
//         beforeSend: function() {
//             Swal.showLoading();
//         },
//         success: async function (res) {
//             Swal.close();
//             if (res.code == 1000 && res.data) {
//                 await loadListAppointment();
//                 Swal.fire({
//                     icon: "success",
//                     title: "Cập nhật thành công!",
//                     text: "Đã cập nhật cuộc hẹn bị bỏ lỡ!",
//                     showCancelButton: false,
//                     timer: 3000
//                 });
//             } else {
//                 console.error(res);
//                 Swal.fire({
//                     icon: 'error',
//                     title: "Đã xảy ra lỗi",
//                     text: utils.getErrorMessage(res.code),
//                 });
//             }
//         },
//         error: function(xhr, status, error) {
//             Swal.close();
//             console.error(xhr);
//             Swal.fire({
//                 icon: "error",
//                 title: "Đã xảy ra lỗi",
//                 text: utils.getXHRInfo(xhr).message
//             });
//         }
//     });
// });

// $(document).on('click', '.appointment-complete-btn', async function () {
//     const id = $(this).data('id');

//     let warning = await Swal.fire({
//         title: "Cuộc hẹn đã diễn ra",
//         text: "Xác nhận cuộc hẹn đã diễn ra?",
//         icon: "warning",
//         showCancelButton: true,
//         showConfirmButton: true,
//         cancelButtonText: "Hủy",
//         confirmButtonText: "Đồng ý",
//         reverseButtons: true
//     });
    
//     if (!warning.isConfirmed) {
//         return;
//     }
    
//     $.ajax({
//         type: "PUT",
//         url: "/api/appointment/update-status?appointment=" +id+"&status=2",
//         headers: utils.defaultHeaders(),
//         dataType: "json",
//         beforeSend: function() {
//             Swal.showLoading();
//         },
//         success: async function (res) {
//             Swal.close();
//             if (res.code == 1000 && res.data) {
//                 await loadListAppointment();
//                 Swal.fire({
//                     icon: "success",
//                     title: "Cập nhật thành công!",
//                     text: "Đã cập nhật cuộc hẹn đã diễn ra!",
//                     showCancelButton: false,
//                     timer: 3000
//                 });
//             } else {
//                 console.error(res);
//                 Swal.fire({
//                     icon: 'error',
//                     title: "Đã xảy ra lỗi",
//                     text: utils.getErrorMessage(res.code),
//                 });
//             }
//         },
//         error: function(xhr, status, error) {
//             Swal.close();
//             console.error(xhr);
//             Swal.fire({
//                 icon: "error",
//                 title: "Đã xảy ra lỗi",
//                 text: utils.getXHRInfo(xhr).message
//             });
//         }
//     });
// });

// // Hàm định dạng option với name bên trái và price bên phải
// function formatOption(state) {
//     if (!state.id) {
//         return state.text;
//     }
//     const price = $(state.element).data("price");
//     return $(
//         `<div class="d-flex justify-content-between">
//             <span>${state.text}</span>
//             <small class="align-text-bottomtext-muted">${price}</small>
//         </div>`
//     );
// }

// $(document).on('click', '.appointment-edit-btn', async function () {
//     const id = $(this).data('id');

//     Swal.showLoading();

//     if (serviceOptionList.length == 0) {
//         await $.ajax({
//             type: "GET",
//             url: "/api/services/enable-with-price",
//             dataType: "json",
//             headers: utils.defaultHeaders(),
//             success: function (res) {
//                 if (res.code == 1000 && res.data) {
//                     serviceOptionList = res.data;
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error(utils.getXHRInfo(xhr));
//                 Swal.close();
//                 Swal.fire({
//                     icon: "error",
//                     title: "Đã xảy ra lỗi",
//                     text: utils.getErrorMessage(response.code)
//                 });
//                 return;
//             },
//         });
//     }

//     let response;
//     try {
//         response = await $.ajax({
//             type: "GET",
//             url: "/api/appointment/"+id,
//             headers: utils.defaultHeaders(),
//             dataType: "json",
//         });    
//     } catch (error) {
//         console.error(error);
//         Swal.close();
//         Swal.fire({
//             icon: "error",
//             title: "Đã xảy ra lỗi",
//             text: utils.getXHRInfo(error).message,
//         });
//         return;
//     }

//     if (!response) return;

//     if (!response.code === 1000) {
//         Swal.close();
//         console.error(response);
//         Swal.fire({
//             icon: "error",
//             title: "Đã xảy ra lỗi",
//             text: utils.getErrorMessage(response.code)
//         });
//         return;
//     }

//     let appointment = response.data;

//     clear_modal();
//     $('#modal_id').modal({
//         backdrop: 'static', // Ngăn đóng khi click bên ngoài
//         keyboard: true      // Cho phép đóng khi nhấn Escape
//     });
//     $(".modal-dialog").addClass("modal-lg");
//     $("#modal_title").text("Chỉnh sửa thông tin đặt hẹn");
//     $("#modal_body").append(`
//         <div class="form-group">
//             <label>Chọn thời gian:</label>
//             <div class="input-group date" id="reservationdatetime" data-target-input="nearest">
//                 <input role="button" type="text" class="form-control datetimepicker-input" data-target="#reservationdatetime" readonly>
//                 <div class="input-group-append" data-target="#reservationdatetime" data-toggle="datetimepicker">
//                     <div class="input-group-text"><i class="fa-regular fa-calendar-days"></i></div>
//                 </div>
//             </div>
//         </div>

//         <div class="form-group">
//             <label for="modal_contact_input">Thông tin liên lạc khách hàng</label>
//             <input type="text" class="form-control" id="modal_contact_input" maxlength="255" placeholder="Nhập thông tin liên lạc">
//         </div>

//         <div class="form-group">
//             <label for="modal_description_input">Ghi chú</label>
//             <textarea wrap="soft" 
//                 class="form-control" 
//                 id="modal_description_input" 
//                 rows="4" maxlength="65000" 
//                 placeholder="Ghi chú cho cuộc hẹn"></textarea>
//         </div>

//         <div class="form-group">
//             <label class="mb-0">Chọn dịch vụ và Tùy chọn (option)</label><br>
//             <div id="service-wrapper" class="mt-1">
//             </div>
//             <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
//         </div>
//     `);

//     // Hiển thị datetimepicker khi nhấp vào input
//     $('#reservationdatetime input').on('focus', function() {
//         $('#reservationdatetime').datetimepicker('show');
//     });

//     // Cấu hình DateTimePicker
//     $('#reservationdatetime').datetimepicker({
//         format: 'HH:mm, [ngày] DD/MM/YYYY', // Định dạng ngày giờ
//         icons: { 
//             time: 'fa-regular fa-clock', 
//             date: 'fa-solid fa-calendar-day' 
//         },
//         maxDate: moment().add(1, 'years'), // Giới hạn đến 1 năm sau 
//         defaultDate: moment(appointment.time),
//         locale: 'vi', // Thiết lập tiếng Việt
//         widgetPositioning: {
//             horizontal: 'auto', // Tự động điều chỉnh theo chiều ngang
//             vertical: 'bottom'  // Hiển thị bên dưới trường nhập liệu
//         }
//     });

//     $('#modal_description_input').val(appointment.description);
//     $('#modal_contact_input').val(appointment.contact);

//     utils.set_char_count('#modal_contact_input', '#modal_contact_counter');

//     if (appointment.details.length != 0) {
//         $.each(appointment.details, function (idx, detail) {
//             const newRow = $(`
//                 <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
//                     <div class="col-12 col-lg-6 mb-1 mb-lg-0">
//                         <select class="form-control select2bs4 modal-service-select" width="100%" required 
//                         data-placeholder="Chọn dịch vụ"></select>
//                     </div>
        
//                     <div class="col-12 col-lg-5 mb-1 mb-lg-0">
//                         <select class="form-control select2bs4 modal-option-select" width="100%" required 
//                         data-placeholder="Chọn option"></select>
//                     </div>

//                     <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
//                         <button class="btn btn-sm btn-danger remove-service-btn w-100">
//                             <i class="fa-regular fa-circle-xmark fa-lg"></i>
//                         </button>
//                     </div>
//                 </div>
//             `);

//             // Thêm hàng mới vào #service-wrapper
//             $("#service-wrapper").append(newRow);

//             // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
//             newRow.find(".select2bs4").select2({
//                 allowClear: true,
//                 theme: "bootstrap",
//                 closeOnSelect: true,
//                 width: "100%",
//                 language: "vi",
//             });

//             const $serviceSelect = newRow.find(".modal-service-select");
//             const $optionSelect = newRow.find(".modal-option-select");
//             $.each(serviceOptionList, function (idx, val) {
//                 $serviceSelect.append(
//                     `<option value="${val.id}">${val.name}</option>`
//                 );
//             });

//             // Thêm sự kiện cho service-select và xử lý option-select
//             newRow.find(".modal-service-select").on("change", function () {
//                 let id = $(this).val();
//                 const wrapper = $(this).closest(".service-option-wrapper");
//                 const $optionSelect = wrapper.find(".modal-option-select");
//                 if (id == null) {
//                     $optionSelect.empty();
//                     return;
//                 }

//                 const listOptionPrices = serviceOptionList.find(
//                     (item) => item.id == id
//                 );
//                 $optionSelect.empty(); // Đảm bảo xóa các option cũ

//                 $.each(listOptionPrices.optionPrices, function (idx, val) {
//                     const option = new Option(val.name, val.id, false, false);
//                     $(option).attr(
//                         "data-price",
//                         utils.formatVNDCurrency(val.price)
//                     );
//                     $optionSelect.append(option);
//                 });
//                 $optionSelect.val("").trigger("change");

//                 // Khởi tạo Select2 với template tùy chỉnh cho option
//                 $optionSelect.select2({
//                     templateResult: formatOption,
//                     templateSelection: formatOption,
//                     width: "100%",
//                     theme: "bootstrap",
//                 });
//             });

//             $serviceSelect.val(detail.service.id).trigger("change");
//             if (detail.option) {
//                 $optionSelect.val(detail.option.id).trigger("change");
//             }
//         });
//     }

//     $("#add-service-btn").click(function (e) {
//         const newRow = $(`
//             <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
//                 <div class="col-12 col-lg-6 mb-1 mb-lg-0">
//                     <select class="form-control select2bs4 modal-service-select" width="100%" required 
//                     data-placeholder="Chọn dịch vụ"></select>
//                 </div>
    
//                 <div class="col-12 col-lg-5 mb-1 mb-lg-0">
//                     <select class="form-control select2bs4 modal-option-select" width="100%" required 
//                     data-placeholder="Chọn option"></select>
//                 </div>

//                 <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
//                     <button class="btn btn-sm btn-danger remove-service-btn w-100">
//                         <i class="fa-regular fa-circle-xmark fa-lg"></i>
//                     </button>
//                 </div>
//             </div>
//         `);

//         // Thêm hàng mới vào #service-wrapper
//         $("#service-wrapper").append(newRow);

//         // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
//         newRow.find(".select2bs4").select2({
//             allowClear: true,
//             theme: "bootstrap",
//             closeOnSelect: true,
//             width: "100%",
//             language: "vi",
//         });

//         const $serviceSelect = newRow.find(".modal-service-select");
//         $.each(serviceOptionList, function (idx, val) {
//             $serviceSelect.append(
//                 `<option value="${val.id}">${val.name}</option>`
//             );
//         });
//         $serviceSelect.val("").trigger("change");

//         // Thêm sự kiện cho service-select và xử lý option-select
//         newRow.find(".modal-service-select").on("change", function () {
//             let id = $(this).val();
//             const wrapper = $(this).closest(".service-option-wrapper");
//             const $optionSelect = wrapper.find(".modal-option-select");
//             if (id == null) {
//                 $optionSelect.empty();
//                 return;
//             }

//             const listOptionPrices = serviceOptionList.find(
//                 (item) => item.id == id
//             );
//             $optionSelect.empty(); // Đảm bảo xóa các option cũ

//             $.each(listOptionPrices.optionPrices, function (idx, val) {
//                 const option = new Option(val.name, val.id, false, false);
//                 $(option).attr(
//                     "data-price",
//                     utils.formatVNDCurrency(val.price)
//                 );
//                 $optionSelect.append(option);
//             });
//             $optionSelect.val("").trigger("change");

//             // Khởi tạo Select2 với template tùy chỉnh cho option
//             $optionSelect.select2({
//                 templateResult: formatOption,
//                 templateSelection: formatOption,
//                 width: "100%",
//                 theme: "bootstrap",
//             });
//         });
//     });

    
//     $(document).off('click', '.remove-service-btn');
//     $(document).on("click", ".remove-service-btn", function () {
//         var totalRows = $("#service-wrapper .row").length;

//         if (totalRows == 1) {
//             Toast.fire({
//                 icon: "warning",
//                 title: "Không thể xóa! Phải có ít nhất một dịch vụ",
//             });
//             return;
//         } else {
//             $(this).closest(".row").remove();
//         }
//     });

//     $("#modal_footer").append(
//         '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
//     );

//     Swal.close();

//     $("#modal_id").modal("show");

//     $("#modal_submit_btn").click(async function () {
//         const selectedDate = $('#reservationdatetime').datetimepicker('date');
//         let isoDate;
         
//         try {
//             isoDate = selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss') : null;
//         } catch (error) {
//             console.error(error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Lỗi lấy thời gian hẹn",
//                 text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
//             });
//             return;
//         }

//         if (!isoDate) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Lỗi lấy thời gian hẹn",
//                 text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
//             });
//             return;
//         }

//         const selectedTime = moment(selectedDate).format("HH:mm"); // Chỉ lấy phần giờ phút
//         const selectedMoment = moment(selectedTime, "HH:mm"); // Chuyển đổi thành moment

//         // Kiểm tra xem thời gian đặt hẹn có nằm trong khung giờ mở cửa không
//         if (selectedMoment.isBefore(OPENING_TIME) || selectedMoment.isAfter(CLOSING_TIME)) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Thời gian không hợp lệ",
//                 html: `Vui lòng chọn thời gian hẹn trong khung giờ mở cửa<br><b>Từ ${OPENING_TIME._i} đến ${CLOSING_TIME._i}</b>`,
//             });
//             return;
//         }
        
//         let contact = $('#modal_contact_input').val();
//         let description = $("#modal_description_input").val().trim();

//         let serviceOptions = [];
//         var hasError = false; // Biến cờ để theo dõi lỗi

//         // Duyệt qua từng phần tử trong #service-wrapper
//         $("#service-wrapper .row").each(function () {
//             var selectedService = $(this).find(".modal-service-select").val();
//             var selectedOption = $(this).find(".modal-option-select").val() || null;

//             if (selectedService == null) {
//                 Toast.fire({
//                     icon: "warning",
//                     title: "Vui lòng chọn dịch vụ",
//                 });
//                 hasError = true; // Đặt cờ lỗi
//                 return;
//             }
            
//             serviceOptions.push({
//                 serviceId: selectedService,
//                 optionId: selectedOption,
//             });
//         });

//         if (hasError) {
//             return;
//         }

//         let warning = await Swal.fire({
//             title: "Cập nhật thông tin đặt hẹn",
//             text: "Xác nhận cập nhật thông tin cho cuộc hẹn này?",
//             icon: "warning",
//             showCancelButton: true,
//             showConfirmButton: true,
//             cancelButtonText: "Hủy",
//             confirmButtonText: "Đồng ý",
//             reverseButtons: true
//         });
        
//         if (!warning.isConfirmed) {
//             return;
//         }

//         $.ajax({
//             type: "PUT",
//             url: "/api/appointment/staff-update/" + id,
//             headers: utils.defaultHeaders(),
//             data: JSON.stringify({
//                 time: isoDate,
//                 contact: contact,
//                 description: description,
//                 details: serviceOptions.map((detail) => ({
//                     serviceId: detail.serviceId,
//                     optionId: detail.optionId,
//                 }))
//             }),
//             beforeSend: function () {
//                 Swal.showLoading();
//             },
//             success: async function (response) {
//                 if (response.code == 1000) {
//                     await loadListAppointment();
//                     Swal.close();
//                     $("#modal_id").modal("hide");
//                     Toast.fire({
//                         icon: "success",
//                         title: `Cập nhật thành công`,
//                     });
                    
//                 } else {
//                     Toast.fire({
//                         icon: "warning",
//                         title: utils.getErrorMessage(response.code),
//                     });
//                 }
//             },
//             error: function (xhr, status, error) {
//                 Swal.close();
//                 console.log(xhr);
//                 Toast.fire({
//                     icon: "error",
//                     title: utils.getXHRInfo(xhr).message,
//                 });
//             },
//         });
//     });
// });

// $('#new-appointment-btn').click( async function (e) { 
//     Swal.showLoading();

//     if (customerList.length == 0) {
//         let res = null;
//         try {
//             res = await $.ajax({
//                 type: "GET",
//                 url: "/api/users/customers",
//                 headers: utils.defaultHeaders(),
//                 dataType: "json",
//             });
//         } catch (error) {
//             Swal.close();
//             console.error(error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Đã xảy ra lỗi",
//                 text: utils.getXHRInfo(error).message,
//             });
//             return;
//         } 
        
//         if (!res) {
//             Swal.close();
//             return;
//         }
        
//         if (res.code == 1000) {
//             customerList = res.data;
//         } else {
//             Swal.close();
//             console.error(res);
//             Swal.fire({
//                 icon: "error",
//                 title: "Đã xảy ra lỗi",
//                 text: utils.getErrorMessage(res.code),
//             });
//             return;
//         }
//     }

//     clear_modal();
//     $('#modal_id').modal({
//         backdrop: 'static', // Ngăn đóng khi click bên ngoài
//         keyboard: true      // Cho phép đóng khi nhấn Escape
//     });
//     $(".modal-dialog").addClass("modal-lg");
//     $("#modal_title").text("Tạo mới cuộc hẹn");
//     $("#modal_body").append(`
//         <div class="form-group">
//             <div class="d-flex justify-content-between align-items-center">
//                 <label class="mb-0">Chọn hồ sơ khách hàng</label>
//                 <span class="font-weight-light font-italic">*Tìm kiếm theo tên, SĐT hoặc email</span>
//             </div>
//             <div class="form-group">
//                 <select id="modal-customer-select" class="form-control" style="width: 100%;"
//                 data-placeholder="Chọn 1 hồ sơ khách hàng">
//                 </select>
//             </div>
//             <div id="modal-customer-info" class="rounded border p-2 mt-2" hidden></div>
//         </div>

//         <div class="form-group">
//             <label>Chọn thời gian:</label>
//             <div class="input-group date" id="reservationdatetime" data-target-input="nearest">
//                 <input role="button" type="text" class="form-control datetimepicker-input" data-target="#reservationdatetime" readonly>
//                 <div class="input-group-append" data-target="#reservationdatetime" data-toggle="datetimepicker">
//                     <div class="input-group-text"><i class="fa-regular fa-calendar-days"></i></div>
//                 </div>
//             </div>
//         </div>

//         <div class="form-group">
//             <div class="container mt-3 mb-0 px-0">
//                 <div class="d-flex justify-content-between align-items-center mb-2">
//                     <label class="mb-0" for="modal_contact_input">Thông tin liên lạc khách hàng</label>
//                     <kbd id="modal_contact_counter" class="mb-0 small">0/255</kbd>
//                 </div>
//             </div>
//             <input type="text" class="form-control" id="modal_contact_input" maxlength="255" placeholder="Nhập thông tin liên lạc">
//         </div>

//         <div class="form-group">
//             <label for="modal_description_input">Ghi chú</label>
//             <textarea wrap="soft" 
//                 class="form-control" 
//                 id="modal_description_input" 
//                 rows="4" maxlength="65000" 
//                 placeholder="Ghi chú cho cuộc hẹn"></textarea>
//         </div>

//         <div class="form-group">
//             <label class="mb-0">Chọn dịch vụ và Tùy chọn (option)</label><br>
//             <div id="service-wrapper" class="mt-1">
//                 <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
//                     <div class="col-12 col-lg-6 mb-1 mb-lg-0">
//                         <select class="form-control select2bs4 modal-service-select" width="100%" required 
//                         data-placeholder="Chọn dịch vụ"></select>
//                     </div>
        
//                     <div class="col-12 col-lg-5 mb-1 mb-lg-0">
//                         <select class="form-control select2bs4 modal-option-select" width="100%" required 
//                         data-placeholder="Chọn option"></select>
//                     </div>

//                     <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
//                         <button class="btn btn-sm btn-danger remove-service-btn w-100">
//                             <i class="fa-regular fa-circle-xmark fa-lg"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
//         </div>
//     `);

//     // Hiển thị datetimepicker khi nhấp vào input
//     $('#reservationdatetime input').on('focus', function() {
//         $('#reservationdatetime').datetimepicker('show');
//     });

//     utils.set_char_count('#modal_contact_input', '#modal_contact_counter');

//     // Cấu hình DateTimePicker
//     $('#reservationdatetime').datetimepicker({
//         format: 'HH:mm, [ngày] DD/MM/YYYY', // Định dạng ngày giờ
//         icons: { 
//             time: 'fa-regular fa-clock', 
//             date: 'fa-solid fa-calendar-day' 
//         },
//         minDate:  moment(),
//         maxDate: moment().add(1, 'years'), // Giới hạn đến 1 năm sau 
//         defaultDate: moment(),
//         locale: 'vi', // Thiết lập tiếng Việt
//         widgetPositioning: {
//             horizontal: 'auto', // Tự động điều chỉnh theo chiều ngang
//             vertical: 'bottom'  // Hiển thị bên dưới trường nhập liệu
//         }
//     });

//     $("#modal-customer-select").empty();
//     $('#modal-customer-select').select2({
//         allowClear: true,
//         theme: "bootstrap",
//         closeOnSelect: true,
//         language: "vi",
//         minimumInputLength: 1,
//         ajax: {
//             transport: function (params, success, failure) {                
//                 let results = [];
    
//                 // Lấy từ khóa tìm kiếm
//                 let term = params.data.q || "";
    
//                 // Lọc userList theo cả name, phone và email
//                 let filteredUsers = customerList.filter((user) => {
//                     let normalizedName = utils.removeVietnameseTones(user.name.toLowerCase()); // Tên đã loại bỏ dấu
//                     let termNormalized = utils.removeVietnameseTones(term.toLowerCase()); // Searching key đã loại bỏ dấu
                    
//                     let nameMatch = normalizedName.includes(termNormalized);
//                     let phoneMatch = user.phone && user.phone.includes(term);
//                     let emailMatch = user.accounts.length > 0 && user.accounts[0].email && user.accounts[0].email.includes(term);
    
//                     return nameMatch || phoneMatch || emailMatch;
//                 });
    
//                 // Map kết quả vào định dạng mà Select2 yêu cầu
//                 results = filteredUsers.map((user) => {
//                     return {
//                         id: user.id,
//                         text: user.name, // Chỉ sử dụng tên ở đây
//                         phone: user.phone,
//                         email: user.accounts.length > 0 ? user.accounts[0].email : "", // Nạp email của phần tử đầu tiên
//                         accountCount: user.accounts.length, // Số lượng tài khoản
//                     };
//                 });
    
//                 // Trả về kết quả
//                 success({
//                     results: results,
//                 });
//             },
//             delay: 250,
//             cache: false,
//         },
//         escapeMarkup: function (markup) {
//             return markup; // Allow HTML in text
//         },
//         templateResult: function (data) {
//             let result = `${data.text}`;
//             if (data.phone != null) {
//                 result += ` - ${data.phone}`;
//             }
    
//             if (data.accountCount != null && data.accountCount != 0) {
//                 result += ` <small><span class="badge badge-info">Có tài khoản</span></small>`;
//             }
    
//             return `<div>${result}</div>`;
//         },
//         templateSelection: function (data) {
//             let selection = `${data.text}`;
    
//             if (data.phone != null) {
//                 selection += ` - ${data.phone}`;
//             }
    
//             if (data.accountCount != null && data.accountCount != 0) {
//                 selection += ` <small><span class="badge badge-info">Có tài khoản</span></small>`;
//             }
    
//             return `<div>${selection}</div>`;
//         },
//         language: {
//             errorLoading: function () {
//                 return "Không thể tải kết quả.";
//             },
//             inputTooLong: function (args) {
//                 let overChars = args.input.length - args.maximum;
//                 return `Vui lòng xóa bớt ${overChars} ký tự.`;
//             },
//             inputTooShort: function (args) {
//                 let remainingChars = args.minimum - args.input.length;
//                 return `Vui lòng nhập thêm ${remainingChars} ký tự.`;
//             },
//             loadingMore: function () {
//                 return "Đang tải thêm kết quả...";
//             },
//             maximumSelected: function (args) {
//                 return `Bạn chỉ có thể chọn tối đa ${args.maximum} mục.`;
//             },
//             noResults: function () {
//                 return "Không có kết quả.";
//             },
//             searching: function () {
//                 return "Đang tìm kiếm...";
//             },
//             removeAllItems: function () {
//                 return "Xóa tất cả các mục";
//             },
//         }
//     });

//     let selectedCustomer;

//     $('#modal-customer-select').on('change', function (e) {
//         const selectedUser = $(this).val(); // Lấy giá trị được chọn
//         if (selectedUser) {
//             const userData = customerList.find(user => user.id === selectedUser);
//             selectedCustomer = userData;

//             if(!userData) return;

//             let html = "";
//             html += `<b>- Tên khách hàng: </b>${userData.name}<br>`;

//             if(userData.accounts.length > 0) { 
//                 html += `<b>- Email: </b>${userData.accounts ? userData.accounts[0].email : "Không có"}<br>`;
//             } else {
//                 html += `<b>- Email: </b>Không có<br>`;
//             }

//             html += `<b>- SĐT: </b>${userData.phone ? userData.phone : "Không có"}<br>`;

//             html += `<b>- Giới tính: </b>${userData.gender === 0 ? "Nữ" : userData.gender === 1 ? "Nam" : "Khác"}<br>`;

//             html += `<b>- Địa chỉ: </b>${userData.address ? userData.address.address : "Không có"}<br>`;

//             let roleHtml = "";
//             userData.roles.forEach((role, idx) => {
//                 if( idx != 0) {
//                     roleHtml += ", ";
//                 }
//                 roleHtml += role.roleName;
//             });

//             html += `<b>- Vai trò: </b>${roleHtml}<br>`;

//             let carHtml = "";
//             if (userData.cars.length > 0) {
//                 userData.cars.forEach((car, idx) => {
//                     carHtml += `&#8226; ${car.model.brand.brand} ${car.model.model}  - BS: "${car.numPlate}" (${car.plateType.type})<br>`;
//                 })
//             }

//             html += carHtml!=="" ? `<b>- Xe: </b><br><div class="px-3">${carHtml}</div>` : "<b>- Xe: </b>Chưa đăng ký";
            
//             $('#modal-customer-info').html(html);
//             $('#modal-customer-info').prop('hidden', false);
//         } else {
//             selectedCustomer == null;
//             $('#modal-customer-info').html('');
//             $('#modal-customer-info').prop('hidden', true);
//         }
//     });

//     $(".select2bs4").select2({
//         allowClear: true,
//         theme: "bootstrap",
//         closeOnSelect: true,
//         width: "100%",
//         language: "vi",
//     });

//     $.each(serviceOptionList, function (idx, val) {
//         $(".modal-service-select").append(
//             `<option value="${val.id}">${val.name}</option>`
//         );
//     });
//     $(".modal-service-select").val("").trigger("change");

//     $(".modal-service-select").on("change", function () {
//         let id = $(this).val();
//         const wrapper = $(this).closest(".service-option-wrapper");
//         const $optionSelect = wrapper.find(".modal-option-select");
//         if (id == null) {
//             $optionSelect.empty();
//             return;
//         }

//         const listOptionPrices = serviceOptionList.find(
//             (item) => item.id == id
//         );
//         $optionSelect.empty(); // Đảm bảo xóa các option cũ

//         $.each(listOptionPrices.optionPrices, function (idx, val) {
//             const option = new Option(val.name, val.id, false, false);
//             $(option).attr(
//                 "data-price",
//                 utils.formatVNDCurrency(val.price)
//             );
//             $optionSelect.append(option);
//         });
//         $optionSelect.val("").trigger("change");

//         // Khởi tạo Select2 với template tùy chỉnh cho option
//         $optionSelect.select2({
//             templateResult: formatOption,
//             templateSelection: formatOption,
//             width: "100%",
//             theme: "bootstrap",
//         });
//     });

//     $("#add-service-btn").click(function (e) {
//         const newRow = $(`
//             <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
//                 <div class="col-12 col-lg-6 mb-1 mb-lg-0">
//                     <select class="form-control select2bs4 modal-service-select" width="100%" required 
//                     data-placeholder="Chọn dịch vụ"></select>
//                 </div>
    
//                 <div class="col-12 col-lg-5 mb-1 mb-lg-0">
//                     <select class="form-control select2bs4 modal-option-select" width="100%" required 
//                     data-placeholder="Chọn option"></select>
//                 </div>

//                 <div class="col-12 col-lg-1 mb-1 mb-lg-0 d-flex justify-content-center">
//                     <button class="btn btn-sm btn-danger remove-service-btn w-100">
//                         <i class="fa-regular fa-circle-xmark fa-lg"></i>
//                     </button>
//                 </div>
//             </div>
//         `);

//         // Thêm hàng mới vào #service-wrapper
//         $("#service-wrapper").append(newRow);

//         // Khởi tạo Select2 cho các phần tử trong hàng mới thêm
//         newRow.find(".select2bs4").select2({
//             allowClear: true,
//             theme: "bootstrap",
//             closeOnSelect: true,
//             width: "100%",
//             language: "vi",
//         });

//         const $serviceSelect = newRow.find(".modal-service-select");
//         $.each(serviceOptionList, function (idx, val) {
//             $serviceSelect.append(
//                 `<option value="${val.id}">${val.name}</option>`
//             );
//         });
//         $serviceSelect.val("").trigger("change");

//         // Thêm sự kiện cho service-select và xử lý option-select
//         newRow.find(".modal-service-select").on("change", function () {
//             let id = $(this).val();
//             const wrapper = $(this).closest(".service-option-wrapper");
//             const $optionSelect = wrapper.find(".modal-option-select");
//             if (id == null) {
//                 $optionSelect.empty();
//                 return;
//             }

//             const listOptionPrices = serviceOptionList.find(
//                 (item) => item.id == id
//             );
//             $optionSelect.empty(); // Đảm bảo xóa các option cũ

//             $.each(listOptionPrices.optionPrices, function (idx, val) {
//                 const option = new Option(val.name, val.id, false, false);
//                 $(option).attr(
//                     "data-price",
//                     utils.formatVNDCurrency(val.price)
//                 );
//                 $optionSelect.append(option);
//             });
//             $optionSelect.val("").trigger("change");

//             // Khởi tạo Select2 với template tùy chỉnh cho option
//             $optionSelect.select2({
//                 templateResult: formatOption,
//                 templateSelection: formatOption,
//                 width: "100%",
//                 theme: "bootstrap",
//             });
//         });
//     });

    
//     $(document).off('click', '.remove-service-btn');
//     $(document).on("click", ".remove-service-btn", function () {
//         var totalRows = $("#service-wrapper .row").length;

//         if (totalRows == 1) {
//             Toast.fire({
//                 icon: "warning",
//                 title: "Không thể xóa! Phải có ít nhất một dịch vụ",
//             });
//             return;
//         } else {
//             $(this).closest(".row").remove();
//         }
//     });

//     $("#modal_footer").append(
//         '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
//     );

//     Swal.close();

//     $("#modal_id").modal("show");

//     $("#modal_submit_btn").click(async function () {
//         const selectedDate = $('#reservationdatetime').datetimepicker('date');
//         let isoDate;
        
//         if (!selectedCustomer) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Chưa chọn khách hàng",
//                 text: "Vui lòng chọn khách cần đặt hẹn!",
//             });
//             return;
//         }

//         try {
//             isoDate = selectedDate ? selectedDate.format('YYYY-MM-DDTHH:mm:ss') : null;
//         } catch (error) {
//             console.error(error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Lỗi lấy thời gian hẹn",
//                 text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
//             });
//             return;
//         }

//         if (!isoDate) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Lỗi lấy thời gian hẹn",
//                 text: "Không thể lấy thời gian hẹn, vui lòng chọn lại!",
//             });
//             return;
//         }

//         const selectedTime = moment(selectedDate).format("HH:mm"); // Chỉ lấy phần giờ phút
//         const selectedMoment = moment(selectedTime, "HH:mm"); // Chuyển đổi thành moment

//         // Kiểm tra xem thời gian đặt hẹn có nằm trong khung giờ mở cửa không
//         if (selectedMoment.isBefore(OPENING_TIME) || selectedMoment.isAfter(CLOSING_TIME)) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Thời gian không hợp lệ",
//                 html: `Vui lòng chọn thời gian hẹn trong khung giờ mở cửa<br><b>Từ ${OPENING_TIME._i} đến ${CLOSING_TIME._i}</b>`,
//             });
//             return;
//         }

//         if (selectedDate < moment()) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Thời gian không hợp lệ",
//                 text: "Thời gian đặt hẹn phải bắt đầu từ bây giờ",
//             });
//             return;
//         }
        
//         let contact = $('#modal_contact_input').val();
//         let description = $("#modal_description_input").val().trim();

//         let serviceOptions = [];
//         var hasError = false; // Biến cờ để theo dõi lỗi

//         // Duyệt qua từng phần tử trong #service-wrapper
//         $("#service-wrapper .row").each(function () {
//             var selectedService = $(this).find(".modal-service-select").val();
//             var selectedOption = $(this).find(".modal-option-select").val() || null;

//             if (selectedService == null) {
//                 Toast.fire({
//                     icon: "warning",
//                     title: "Vui lòng chọn dịch vụ",
//                 });
//                 hasError = true; // Đặt cờ lỗi
//                 return;
//             }
            
//             serviceOptions.push({
//                 serviceId: selectedService,
//                 optionId: selectedOption,
//             });
//         });

//         if (hasError) {
//             return;
//         }

//         let warning = await Swal.fire({
//             title: "Tạo cuộc hẹn mới?",
//             html: `Xác nhận tạo cuộc hẹn mới với <b>${selectedCustomer.name}</b><br>` + (selectedCustomer.accounts.length>0 ? `Thông báo sẽ được gửi đến <b>${selectedCustomer.accounts[0].email}</b>` : ""),
//             icon: "warning",
//             showCancelButton: true,
//             showConfirmButton: true,
//             cancelButtonText: "Hủy",
//             confirmButtonText: "Đồng ý",
//             reverseButtons: true
//         });
        
//         if (!warning.isConfirmed) {
//             return;
//         }

//         $.ajax({
//             type: "POST",
//             url: "/api/appointment",
//             headers: utils.defaultHeaders(),
//             data: JSON.stringify({
//                 advisorId: null,
//                 customerId: selectedCustomer.id,
//                 time: isoDate,
//                 contact: contact,
//                 description: description,
//                 status: 1,
//                 details: serviceOptions.map((detail) => ({
//                     serviceId: detail.serviceId,
//                     optionId: detail.optionId,
//                 }))
//             }),
//             beforeSend: function () {
//                 Swal.showLoading();
//             },
//             success: async function (response) {
//                 if (response.code == 1000) {
//                     await loadListAppointment();
//                     Swal.close();
//                     $("#modal_id").modal("hide");
//                     Swal.fire({
//                         icon: "success",
//                         title: `Đã tạo cuộc hẹn`,
//                         html: `Tạo thành công cuộc hẹn với người dùng<br>${selectedCustomer.name}`,
//                         showCancelButton: false,
//                         timer: 3000
//                     });
//                 } else {
//                     Toast.fire({
//                         icon: "warning",
//                         title: utils.getErrorMessage(response.code),
//                     });
//                 }
//             },
//             error: function (xhr, status, error) {
//                 Swal.close();
//                 console.log(xhr);
//                 Toast.fire({
//                     icon: "error",
//                     title: utils.getXHRInfo(xhr).message,
//                 });
//             },
//         });
//     });
// });