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

    Swal.isLoading() && Swal.close();
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
    
    let deleteBtn = "";

    if (invoice.status == 1 || invoice.status == -1) {
        deleteBtn = `<button class="btn btn-danger btn ms-auto ml-2" id="delete-btn">
            Xóa đơn
        </button>`;
    }

    $("#modal_footer").append(`
        <div class="d-flex justify-content-between w-100">
        <button type="button" class="btn btn-outline-info" id="modal_print_btn">In đơn</button>
        ${deleteBtn}
        <button type="button" class="btn btn-primary" id="modal_submit_btn">Đóng</button>
    </div>`
    );

    $(document).off('click', '#delete-btn');
    $(document).on('click', '#delete-btn', async function () {
        if (!invoice) return;
        if (invoice.status != 1 && invoice.status != -1) {
            Toast.fire({
                icon: "warning",
                title: "Chỉ xóa đơn hoạt động Đã hoàn thành hoặc Đã hủy"
            });
            return;
        }
        let time = utils.getTimeAsJSON(invoice.serviceDate);
        let serviceDate = `${time.date}/${time.mon}/${time.year}`;

        let warning = await Swal.fire({
            icon: 'warning',
            title: 'Xóa đơn dịch vụ?',
            html: `Xóa đơn dịch vụ của xe <b>${invoice.car.model.brand.brand} ${invoice.car.model.model}</b><br>ngày <b>${serviceDate}</b>?`,
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
            reverseButtons: true
        });
    
        if (!warning.isConfirmed) {
            return;
        }

        $.ajax({
            type: "DELETE",
            url: "/api/history/delete-history/"+ invoice.id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
            success: async function (res) {
                Swal.close();
                if (res.code == 1000 && res.data) {
                    $("#modal_id").modal("hide");
                    await loadListHistory();
                    Swal.fire({
                        icon: "success",
                        title: "Đã xóa đơn dịch vụ",
                        html: `Đã xóa đơn dịch vụ của xe <b>${invoice.car.model.brand.brand} ${invoice.car.model.model}</b><br>tạo vào ngày <b>${serviceDate}</b>` 
                    });
                } 
                else {
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(res)
                    });
                    return;
                }
            },
            error: function(xhr) {
                Swal.close();
                console.error(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
                return;
            }
        });
    });

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

