import * as utils from "/dist/js/utils.js";

utils.introspect(true);

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

var carList = [];
var dataTable;
var selectedInvoice;

var HASH_CAR = 'car';

$(document).ready( async function () {
    utils.set_char_count('#color-input', '#color-counter');
    utils.set_char_count('#description-input', '#description-counter');
    $.ajax({
        type: "GET",
        url: "/api/cars/my-cars",
        headers: utils.defaultHeaders(),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000) {
                carList = res.data;
                loadCarList();
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
        },
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
            { data: "number" },
            {
                data: "serviceDate",
                render: function (data, type, row) {
                    let time = utils.getTimeAsJSON(data);
                    let html = `${time.hour}:${time.min}, ${time.date}/${time.mon}/${time.year}`;

                    return html;
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

async function loadCarList() {
    $('#cars-wrapper').html("");
    $('#service-history-wrapper').prop('hidden', true);

    if (carList==null || carList.length == 0) {
        return;
    }

    let carID = utils.getHashParam(HASH_CAR);

    carList.forEach(async function (car, idx) {
        let numPlate = car.numPlate;
        let plateType = car.plateType.type;
        let color = car.color;
        let model = car.model.brand.brand + " " + car.model.model;
        let carDetail = car.carDetail.replace(/\n/g, "<br>");

        let bgClass = "bg-light"
        if (plateType.includes('xanh')) {
            bgClass = "bg-primary";
        } else if (plateType.includes('trắng')) {
            bgClass = "bg-white";
        } else if (plateType.includes('vàng')) {
            bgClass = "bg-warning";
        } else if (plateType.includes('đỏ')) {
            bgClass = "bg-danger";
        } 

        let newRow =  $(`
            <div class="col-lg-3 col-6">
                <div role='button' class="small-box ${bgClass} car-info-card" data-id="${car.id}">
                    <div class="inner">
                        <h4>${numPlate} - ${plateType}</h4>
                        <b>${model}</b>
                        <span>${color}</span>

                        <p style="height:50px; margin-bottom: 0px;">${carDetail}</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-solid fa-car"></i>
                    </div>
                    <a role='button' class="small-box-footer">
                    Xem lịch sử dịch vụ <i class="fas fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>
        `);
        
        $('#cars-wrapper').append(newRow);

        newRow.find('.car-info-card').on('click', function () {
            $('.fa-car').removeClass('fa-flip');
            $(this).find('.fa-car').addClass('fa-flip');
            loadCarInfoAndHistoryListByID($(this).data('id'));
        });

        if (carID && carID === car.id) {
            $('.fa-car').removeClass('fa-flip');
            newRow.find('.fa-car').addClass('fa-flip');
            await loadCarInfoAndHistoryListByID(carID);
        }
    });
}

async function loadCarInfoAndHistoryListByID (id) {
    if (!id) return;
    utils.setHashParam(HASH_CAR, id);

    const selectedCar = carList.find(car => car.id === id);

    if (selectedCar==null) return;
    $('#service-history-wrapper').prop('hidden', false);

    $('#num-plate-info').val(selectedCar.numPlate);
    $('#plate-type-info').val(selectedCar.plateType.type);
    $('#model-info').val(selectedCar.model.brand.brand +" "+ selectedCar.model.model);
    $('#color-input').val(selectedCar.color || "").trigger('input');
    $('#description-input').val(selectedCar.carDetail || "").trigger('input');

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/customer/get-by-car/"+id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function () {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
        });
        return;
    }

    Swal.isLoading() && Swal.close();

    if (res.code == 1000) {
        let data = [];
        let counter = 1;
        res.data.forEach(function (invoice) {
            data.push({
                number: counter++, // Số thứ tự tự động tăng
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
            });
        });
    
        dataTable.clear().rows.add(data).draw();
    } else {
        console.log(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code),
        });
        return;
    }
}

$("#data-table tbody").on("dblclick", "tr", async function () {
    if ($(this).find("td").hasClass("dataTables_empty")) return;
    
    selectedInvoice = $('#data-table').DataTable().row($(this)).data();
    var id = selectedInvoice.id;

    let res; 

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/customer/get-detail/" + id,
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


$(document).on('click', '#modal_print_btn', async function () { 
    if (!selectedInvoice || !selectedInvoice.id) {
        Swal.fire({
            icon: "warning",
            title: "Vui lòng chọn lại đơn cần in",
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    let confirm;
    if (selectedInvoice.status == 1) {
        confirm = await Swal.fire({
            icon: "question",
            title: "In hóa đơn?",
            showConfirmButton: true,
            confirmButtonText: "Đồng ý",
            showCancelButton: true,
            cancelButtonText: "Hủy",
        });
    } else {
        confirm = await Swal.fire({
            icon: "question",
            title: "In tạm tính?",
            showConfirmButton: true,
            confirmButtonText: "Đồng ý",
            showCancelButton: true,
            cancelButtonText: "Hủy",
        });
    }

    if (confirm.isConfirmed) {
        window.open('/provisional-invoice-print#user=customer&invoice=' + selectedInvoice.id, '_blank');
    }
    
});

$(document).on('click', '#pre-service-image', function() {
    loadPreImageByHistoryId();
})

$(document).on('click', '#post-service-image', function() {
    loadPostImageByHistoryId();
})

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


$(document).on('click', '#save-info-btn', async function () {
    const id = utils.getHashParam(HASH_CAR);

    if (!id || id==="") {
        return;
    }

    let numPlate = $("#num-plate-info").val().replace(/\s+/g, '');
    let plateType = $("#plate-type-info").val();
    let model = $("#model-info").val();
    let color = $("#color-input").val().trim();
    let detail = $("#description-input").val().trim();

    let warning = await Swal.fire({
        title: "Cập nhật thông tin?",
        text: "Cập nhật màu xe và mô tả chi tiết của xe",
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
        url: "/api/cars/customer-update/" + id,
        headers: utils.defaultHeaders(),
        dataType: "json",
        data: JSON.stringify({
            numPlate: numPlate,
            color: color,
            carDetail: detail,
            plateType: 0,
            model: 0
        }),
        beforeSend: function() {
            Swal.showLoading();
        },
        success: function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                $.ajax({
                    type: "GET",
                    url: "/api/cars/my-cars",
                    headers: utils.defaultHeaders(),
                    dataType: "json",
                    success: async function (res) {
                        if (res.code == 1000) {
                            carList = res.data;
                            await loadCarList();
                            Swal.fire({
                                icon: "success",
                                title: "Cập nhật thành công!",
                                text: "Đã cập nhật thông tin xe!",
                                showCancelButton: false,
                                timer: 3000,
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error(xhr);
                    },
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
