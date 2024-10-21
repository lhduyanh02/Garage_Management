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

// Define hash param
var hash_car = "car";
var hash_invoice = "invoice";

var historyTable;
var plateTypeList = [];
var serviceOptionList = [];
var brandModelList = [];
var selectedCar;
var customerList = [];
var customer;
var advisor;
var selectedInvoice;

var INVOICE_CARD = $("#invoice-card");
var TABLE_DETAILS = $('#table-details');
    
$(document).ready(function () {
    ImgUpload();
    $('[data-toggle="tooltip"]').tooltip();
    utils.set_char_count("#color_input", "#color_counter");
    utils.set_char_count("#description_input", "#description_counter");

    historyTable = $("#service-history-table").DataTable({
        responsive: true,
        pageLength: 4,
        lengthChange: false,
        autoWidth: false,
        searching: false,
        language: {
            paginate: {
                next: "&raquo;",
                previous: "&laquo;"
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
            loadingRecords: "Đang tải dữ liệu..."
        },
        buttons: false,
        columnDefs: [
            { orderable: false, targets: 0 },
            { targets: 0, className: 'text-center' },
            { targets: 1, className: 'text-center' },
        ],
        columns: [
            { data: "number" },
            {
                data: "serviceDate",
                render: function (data, type, row) {
                    let time = utils.getTimeAsJSON(data);
                    let html = `${time.hour}:${time.min}, ${time.date}/${time.mon}/${time.year}`;

                    return `<b>${html}</b>`;
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
                data: "payableAmount", className: "text-right",
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        // Hiển thị số tiền theo định dạng tiền tệ VN
                        return data.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND"
                        });
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return data;
                }
            }
        ],
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
    
    $(TABLE_DETAILS).DataTable({
        dom: 't',  // Chỉ hiển thị nội dung bảng (không có thanh tìm kiếm, phân trang)
        autoWidth: false,
        paging: false,
        ordering: false,
        info: false,
        searching: false,language: {
            paginate: {
                next: "&raquo;",
                previous: "&laquo;"
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
            loadingRecords: "Đang tải dữ liệu..."
        },
        columns: [
            { data: "number", className: "text-center", width: "5%"},
            {
                data: "serviceName", className: "text-left", minWidth: "20%",
                render: function (data, type, row) {
                    let html = data + "<br>";
                    html += `<small>${row.optionName}</small>`;
                    return html;
                },
            },
            {
                data: "price", className: "text-right", width: "15%",
                render: function (data, type, row) {
                    return utils.formatVNDCurrency(data);
                },
            },
            {
                data: "quantity", className: "text-center", width: "10%",
                render: function (data, type, row) {
                    return data;
                },
            },
            {
                data: "discount", className: "text-center", width: "15%",
                render: function (data, type, row) {
                    return `${data}%`
                },
            },
            {
                data: "finalPrice", className: "text-right", width: "15%",
                render: function (data, type, row) {
                    return utils.formatVNDCurrency(data);
                }
            }
        ],
        headerCallback: function (thead) {
            $(thead).find('th').addClass('text-center'); // Thêm class 'text-center' cho header
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/brands/fetch-model",
        dataType: "json",
        headers: {
            "Authorization": ""
        },
        success: function (res) {
            if(res.code == 1000 && res.data){
                brandModelList = res.data;

                $("#brand-select").empty();
                $("#model-select").empty();
                $.each(res.data, function (idx, val) { 
                    $("#brand-select").append(`<option value = "${val.id}">${val.brand}</option>`);
                });
                $('#brand-select').val("").trigger("change");
            }
        },
    });
    $.ajax({
        type: "GET",
        url: "/api/plate-types",
        dataType: "json",
        headers: {
            "Authorization": ""
        },
        success: function (res) {
            if(res.code == 1000 && res.data){
                plateTypeList = res.data;

                $("#plate-type-select").empty();
                $.each(res.data, function (idx, val) { 
                    $("#plate-type-select").append(`<option value="${val.id}">${val.type}</option>`);
                });
                
                $('#plate-type-select').val("").trigger("change");
            }
        },
        error: function(xhr, status, error) {
            console.error(utils.getXHRInfo(xhr));
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/services/enable-with-price",
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if(res.code == 1000 && res.data){
                serviceOptionList = res.data;
            }
        },
        error: function(xhr, status, error) {
            console.error(utils.getXHRInfo(xhr));
        }
    });

    $(".select2").select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        width: "100%",
        dropdownAutoWidth: true, 
        language: "vi"
    });

    
    let carId = utils.getHashParam(hash_car);
    if(carId){
        loadCarInfoHistoryListByCarID(carId);
        let invoiceId = utils.getHashParam(hash_invoice);
        if (invoiceId) {
            loadInvoiceById(invoiceId);
        }
    }
});

$('.discount-suggestion').on('click', function() {
    const discountValue = $(this).text().replace('%', ''); // Loại bỏ dấu '%'
    $('#discount-info').val(discountValue).trigger('input');
});

$('#discount-info').on('input', function () {
    const input = $(this).val();
    if (input.startsWith('.')) {
        $(this).val("0"+input);
    }
    
    if (!/^\d*\.?\d*$/.test(input)) {
        $(this).val(input.slice(0, -1));
    } else {
        const parsedValue = parseFloat(input);
        if (parsedValue > 100) {
            $(this).val(input.slice(0, -1));
        } else if (!input.includes('.') && parsedValue == 0) {
            $(this).val("0");
            calculateAmountDue();   
        }
        else {
            calculateAmountDue();
        }
    }
    $('.dropdown-menu').removeClass('show');
});

$(document).on('input','#odo-info', function () {
    let input = $(this).val().replace(/\D/g, ''); 
    const formattedInput = utils.formatCurrent(input);
    $(this).val(formattedInput);
});

$('#discount-info').on('paste', function () {
    setTimeout(() => {
        const input = $(this).val();

        if (input.startsWith('.')) {
            $(this).val("0" + input);
        }
        if (!/^\d*\.?\d*$/.test(input)) {
            $(this).val("0");
            calculateAmountDue();
        } else {
            const parsedValue = parseFloat(input);
            if (parsedValue > 100) {
                $(this).val(input.slice(0, -1));
            } else if (!input.includes('.') && parsedValue == 0) {
                $(this).val("0");
            }
            else {
                calculateAmountDue();
            }
        }
        
        $('.dropdown-menu').removeClass('show');
    }, 0);
});

function calculateAmountDue() {
    if (selectedInvoice.totalAmount > 0) {
        const discountValue = $('#discount-info').val() == "" ? 0 : $('#discount-info').val();

        const parsedDiscount = parseFloat(discountValue);
        if (!isNaN(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 100) {
            // Tính toán số tiền phải thanh toán
            const discountAmount = (selectedInvoice.totalAmount * parsedDiscount) / 100;
            const amountDue = selectedInvoice.totalAmount - discountAmount;

            // Làm tròn
            const roundedAmountDue = Math.round(amountDue);
            $('#payable-amount-info').text(utils.formatVNDCurrency(roundedAmountDue));
        } else {
            Toast.fire({
                icon: "warning",
                title: "Giá trị của % giảm giá không hợp lệ"
            });
            return;
        }
    } else {
        $('#payable-amount-info').text('0');
    }
}

$('#brand-select').on('change', function () {
    let id = $(this).val();
    if (id == ""){
        return;
    }
    const brand = brandModelList.find(item => item.id == id);
    
    if(brand) {
        $('#model-select').empty();
        $.each(brand.models, function (idx, val) { 
            $('#model-select').append(`<option value="${val.id}"> ${val.model} </option>`);
        });
        $('#model-select').val("").trigger("change");
    } else {
        $("#model-select").empty();
    }
    
});

$("#num-plate-search-input").keydown(function (e) { 
    if (e.keyCode === 13) {
        openCarSelectionTable();
    }

});
  
$("#num-plate-search-btn").click(function (e) { 
    openCarSelectionTable();
});

$("#edit-user-btn").click(function () {
    openUserSelectionTable();
});

function openCarSelectionTable() {
    let numPlate = $("#num-plate-search-input").val().trim();
    let plateType = $("#plate-type-select").val();
    let brand = $("#brand-select").val();
    let model = $("#model-select").val();

    if (numPlate == "" && plateType == null && brand == null && model == null) {
        Toast.fire({
            icon: "warning",
            title: "Cần ít nhất một tiêu chí tìm kiếm"
        });
        
        $("#num-plate-search-input").css("border", "2px solid red");

        $("#plate-type-select, #brand-select, #model-select")
            .next(".select2-container--bootstrap")
            .find(".select2-selection")
            .css("border", "2px solid red");
        setTimeout(() => {
            $("#num-plate-search-input").css("border", "");
    
            $("#plate-type-select, #brand-select, #model-select")
                .next(".select2-container--bootstrap")
                .find(".select2-selection")
                .css("border", "");
        }, 2000);

        return;
    }

    $.ajax({
        type: "GET",
        url: `/api/cars/search?`+ (numPlate ? `plate=${numPlate}` : ``) + (plateType ? `&plateType=${plateType}` : ``)
        + (brand ? `&brand=${brand}` : ``) + (model ? `&model=${model}` : ``),
        dataType: "json",
        headers: utils.defaultHeaders(),
        beforeSend: function() {
            Swal.showLoading();
        },
        success: function (res) {
            if (res.code == 1000) {
                Swal.close();
                clear_modal();
                $("#modal_title").text("Chọn hồ sơ xe");
                $(".modal-dialog").addClass("modal-lg");
                $("#modal_body").append(`
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Tìm hồ sơ xe</label>
                                <div class="input-group">
                                    <input id="car-search-input" type="text" class="form-control" placeholder="Tìm kiếm hồ sơ xe">
                                    <div class="input-group-append">
                                        <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 d-flex">
                            <button id="car-select-btn" type="button" class="btn btn-outline-primary ml-auto mt-auto mb-3 px-3">Chọn</button>
                        </div>
                    </div>
                    <table id="car-table" class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th scope="col" style="text-align: center" width="4%">#</th>
                                <th scope="col" style="text-align: center" min-width="12%">Biển số</th>
                                <th scope="col" style="text-align: center" min-width="15%">Mẫu xe</th>
                                <th scope="col" style="text-align: center">Mô tả</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                `);

                let carTable = $("#car-table").DataTable({
                    responsive: true,
                    lengthChange: false,
                    autoWidth: false,
                    buttons: false,
                    pageLength: 5,
                    searching: true,
                    dom: 'lrtip', // (l: length, r: processing, t: table, i: information, p: pagination)

                    columnDefs: [
                        { orderable: false, targets: 0 },
                        {
                            targets: '_all', // Áp dụng cho tất cả các cột
                            className: 'text-center, targets: 0' // Căn giữa nội dung của tất cả các cột
                        }
                    ],
                    language: {
                        paginate: {
                            next: "&raquo;",
                            previous: "&laquo;"
                        },
                        lengthMenu: "Số dòng: _MENU_",
                        info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
                        infoEmpty: "Không có dữ liệu để hiển thị",
                        infoFiltered: "(Lọc từ _MAX_ mục)",
                        emptyTable: "Không có dữ liệu",
                        search: "Tìm kiếm:",
                    },
                    data: res.data, 
                    columns: [
                        { title: '#', data: null, orderable: false }, // Cột số thứ tự không cho phép sắp xếp
                        { data: 'numPlate',
                            render: function (data, type, row) {
                                let html="";
                                html += `<center>${data}<br> `;
            
                                if(row.plateType.type.includes('xanh')){
                                    html += `<span class="badge badge-primary">&nbsp;${row.plateType.type}</span><br>`
                                } else if(row.plateType.type.includes('trắng')) {
                                    html += `<span class="badge badge-light">&nbsp;${row.plateType.type}</span><br>`
                                } else if(row.plateType.type.includes('vàng')) {
                                    html += `<span class="badge badge-warning">&nbsp;${row.plateType.type}</span><br>`
                                } else if(row.plateType.type.includes('đỏ')) {
                                    html += `<span class="badge badge-danger">&nbsp;${row.plateType.type}</span><br>`
                                } else {
                                    html += `<span class="badge badge-secondary">&nbsp;${row.plateType.type}</span><br>`
                                }
                                return html+'</center>';
                            },
                        },
                        { data: "model", 
                            render: function(data, type, row) {
                                let html = `<center>${data.brand.brand}<br>${data.model}</center>`;
                                return html;
                            }
                        },
                        { data: "carDetail",
                            render: function (data, type, row) {
                                let html = "";
                                if(row.color != null) {
                                    html += `<b>Màu:</b> ${row.color} | `;
                                }
            
                                if(row.createAt != null) {
                                    html += `<b>Khởi tạo:</b> ${utils.formatVNDate(row.createAt)}<br>`;
                                }
            
                                if (data != "") {
                                    html += `<b>Ghi chú: <br></b> ${data.replace(/\n/g, '<br>')}`;
                                }
                                return html;
                            },
                        },
                    ],
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
                });

                $('#car-table tbody').on('click', 'tr', function() {
                    if ($(this).find('td').hasClass('dataTables_empty')) return;

                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                    } else {
                        $('#car-table tbody tr').removeClass('selected');
                        $(this).addClass('selected');
                    }
                });

                $("#car-search-input").on("keyup", function () {
                    carTable.search(this.value.trim()).draw();
                });
    
                $("#car-select-btn").click(function (e) { 
                    var selectedRow = $('#car-table tbody tr.selected');
                    let carData = $('#car-table').DataTable().row(selectedRow).data();
                    
                    if (selectedRow.length > 0) {
                        loadCarInfoHistoryListByCarID(carData.id);
                        $("#modal_id").modal("hide");
                    } else {
                        Toast.fire({
                            icon: "warning",
                            title: "Chọn 1 hồ sơ xe"
                        })
                    }
                });
    
                $("#modal_id").modal("show");
                
            }
            else {
                Swal.close();
                Toast.fire({
                    icon: "warning",
                    title: utils.getErrorMessage(res.code),
                })
            }
        },
        error: function (xhr, status, error) {  
            Swal.close();
            console.log(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
            })
        },
    });
}

async function openUserSelectionTable() {
    try {
        if (customerList.length == 0) {
            const res = await $.ajax({
                type: "GET",
                url: "/api/users/customers",
                headers: utils.defaultHeaders(),
                dataType: "json",
                beforeSend: function() {
                    Swal.showLoading();
                }
            });

            Swal.close();

            if (res.code == 1000 && res.data) {
                customerList = res.data;
            }
            else {
                Toast.fire({
                    icon: "error",
                    title: utils.getErrorMessage(res.code)
                });
                return;
            }
        }

        clear_modal();
        $("#modal_title").text("Chọn hồ sơ khách hàng");
        $(".modal-dialog").addClass("modal-xl");
        $("#modal_body").append(`
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Tìm hồ sơ khách hàng</label>
                        <div class="input-group">
                            <input id="user-search-input" type="text" class="form-control" placeholder="Tìm kiếm hồ sơ khách hàng">
                            <div class="input-group-append">
                                <span id="modal-clear-btn" role="button" class="input-group-text"><i class="fa-solid fa-xmark"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 d-flex">
                    <button id="select-btn" type="button" class="btn btn-outline-primary ml-auto mt-auto mb-3 px-3">Chọn</button>
                </div>
            </div>
            <table id="user-table" class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th scope="col" style="text-align: center" width="4%">#</th>
                        <th scope="col" style="text-align: center" min-width="15%">Họ tên</th>
                        <th scope="col" style="text-align: center" min-width="25%">Thông tin</th>
                        <th scope="col" style="text-align: center">Xe</th>
                        <th scope="col" style="text-align: center" width="10%">Vai trò</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);

        let userTable = $("#user-table").DataTable({
            responsive: true,
            lengthChange: false,
            autoWidth: false,
            buttons: false,
            pageLength: 5,
            searching: true,
            dom: 'lrtip', // (l: length, r: processing, t: table, i: information, p: pagination)

            columnDefs: [
                { orderable: false, targets: 0 },
                { orderable: false, targets: 4 },
                {
                    targets: '_all', // Áp dụng cho tất cả các cột
                    className: 'text-center, targets: 0' // Căn giữa nội dung của tất cả các cột
                }
            ],
            language: {
                paginate: {
                    next: "&raquo;",
                    previous: "&laquo;"
                },
                lengthMenu: "Số dòng: _MENU_",
                info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
                infoEmpty: "Không có dữ liệu để hiển thị",
                infoFiltered: "(Lọc từ _MAX_ mục)",
                emptyTable: "Không có dữ liệu",
                search: "Tìm kiếm:",
            },
            data: customerList, 
            columns: [
                { title: '#', data: null, orderable: false }, // Cột số thứ tự không cho phép sắp xếp
                { data: 'name',
                    render: function (data, type, row) {
                        let html="";
                        html += `${data}`;

                        if (row.gender == 0) {
                            html += ' <span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span><br>';
                        } else if (row.gender == 1) {
                            html += ' <span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span><br>';
                        } else{
                            html += ` <span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp;Khác</span></center><br>`
                        }

                        if (row.accounts.length>0) {
                            html += `<small>${row.accounts[0].email}</small>`;
                        }
                        return html;
                    },
                },
                { data: "address",
                    render: function(data, type, row) {
                        let html = "";
                        if (row.phone) {
                            html += `SĐT: ${row.phone}<br>`;
                        }
                        if (data) {
                            html += `ĐC: ${data.address}`;
                        }
                        return html;
                    }
                },
                { data: "cars", 
                    render: function(data, type, row) {
                        let html = `<center>`;
                        if (data.length > 0) {
                            $.each(data, function (idx, val) { 
                                html += `<span class="badge badge-light">&nbsp;${val.numPlate}<br>${val.model.brand.brand} ${val.model.model}</span><br><br>`
                            });
                        }
                        return html + "</center>";
                    }
                },
                { data: "roles",
                    render: function (data, type, row) {
                        if (data != null && Array.isArray(data)) {
                            let html = "";
                            $.each(data , function (idx, val) {
                                if(val.status == 1){
                                    html+=` <span class="badge badge-light">&nbsp;${val.roleName}</span></br>`
                                }
                                else if (val.status == 0){
                                    html+=` <span class="badge badge-danger">&nbsp;${val.roleName}</span></br>`
                                }
                            });
                            return (
                                '<center>' + html + '</center>'
                            );
                        }
                        return "";
                    },
                },
            ],
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
        });

        $('#user-table tbody').on('click', 'tr', function() {
            if ($(this).find('td').hasClass('dataTables_empty')) return;

            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                $('#user-table tbody tr').removeClass('selected');
                $(this).addClass('selected');
            }
        });

        $("#user-search-input").on("input", function () {
            userTable.search(this.value.trim()).draw();
        });

        $('#modal-clear-btn').click(function (e) { 
            $("#user-search-input").val("").trigger("input");
        });

        $("#user-search-input").val(selectedCar ? selectedCar.numPlate : "").trigger("input");

        $("#select-btn").click(function (e) { 
            var selectedRow = $('#user-table tbody tr.selected');
            let userData = $('#user-table').DataTable().row(selectedRow).data();
            
            if (selectedRow.length > 0) {
                $.ajax({
                    type: "PUT",
                    url: "/api/history/update-customer",
                    headers: utils.defaultHeaders(),
                    dataType: "json",
                    data: JSON.stringify({
                        historyId: selectedInvoice.id,
                        userId: userData.id,
                        isConfirm: false
                    }),
                    success: function (res) {
                        if (res.code == 1000) {
                            Toast.fire({
                                icon: "success",
                                title: "Cập nhật khách hàng thành công"
                            });
                            advisor = res.data.advisor;
                            customer = res.data.customer;
                            loadAdvisorInfo();
                            loadCustomerInfo();
                            $("#modal_id").modal("hide");

                        } else if (res.code == 1081) {
                            Swal.fire({
                                title: `Thao tác này sẽ tự động thêm người dùng đã chọn làm người quản lý của xe này?`,
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/history/update-customer",
                                        headers: utils.defaultHeaders(),
                                        dataType: "json",
                                        data: JSON.stringify({
                                            historyId: selectedInvoice.id,
                                            userId: userData.id,
                                            isConfirm: true
                                        }),
                                        success: function (resp) {
                                            if (resp.code == 1000) {
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Cập nhật khách hàng thành công"
                                                });
                                                advisor = resp.data.advisor;
                                                customer = resp.data.customer;
                                                loadCustomerInfo();
                                                loadAdvisorInfo();
                                                $("#modal_id").modal("hide");
                                            }
                                            else {
                                                console.log(resp);
                                                
                                            }
                                        },
                                        error: function (xhr, status, error) {
                                            console.log(xhr);
                                            Toast.fire({
                                                icon: "error",
                                                title: utils.getXHRInfo(xhr).message,
                                            });
                                        },
                                    });
                                }
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr);
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message,
                        });
                    },
                });
            } else {
                Toast.fire({
                    icon: "warning",
                    title: "Chọn 1 hồ sơ người dùng"
                })
            }
        });

        $("#modal_id").modal("show");
        
    } catch (xhr) {
        Swal.close();
        console.log(xhr);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(xhr).message
        });
        return;
    }
}

async function loadCarInfoHistoryListByCarID(id) {
    utils.setHashParam(hash_car, id);

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/cars/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
        Swal.close();

    } catch (error) {
        Swal.close();
        console.log(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });      
        return;  
    }

    if (res.code == 1000 && res.data) {
        loadCarInfoByCar(res.data);

        loadHistoryListByCarID(id);

        $("#reload-history-list-btn").prop("disabled", false);
        $("#new-history-btn").prop("disabled", false); customer = null;
    } else {
        console.log(res);
        Toast.fire({
            icon: "error",
            title: utils.getErrorMessage(res.code)
        })
    }
}

function loadHistoryList(historyList) {
    let data = [];
    let counter = 1;
    historyList.forEach(function (invoice) {
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
            status: invoice.status
        });
    });

    historyTable.clear().rows.add(data).draw();

    selectedInvoice = null;
    let hash_invoiceID = utils.getHashParam(hash_invoice);

    if (hash_invoiceID != null){ // Kiểm tra invoice trên url có thuộc về xe hay không và load lên
        let found = false;
        $.each(historyList, function (idx, val) { 
            if (val.id == hash_invoiceID) {
                loadInvoiceById(hash_invoiceID);
                found = true;
                return false;
            }
        });

        if (!found) {
            clearInvoiceCard();
        }
    } else {
        clearInvoiceCard();
    }
}

function loadHistoryListByCarID(carId) {
    $.ajax({
        type: "GET",
        url: "/api/history/get-by-car/" + carId,
        headers: utils.defaultHeaders(),     
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: function (res) {
            Swal.close();
            loadHistoryList(res.data);
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.log(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            })
        }
    });
}

function clearInvoiceCard() {
    utils.setHashParam(hash_invoice, null);
    customer = null;
    advisor = null;

    $(TABLE_DETAILS).DataTable().clear().draw();
    INVOICE_CARD.prop("hidden", true);
    $('#company-info').html(`
        <strong>Spring, Inc.</strong><br>
        Đồng Văn Cống, An Thới,<br>
        Bình Thủy, Cần Thơ<br>
        Phone: <a id="company-phone" href="tel:+84818700047" class="text-dark hover-underline">(+84) 81 8700047</a><br>
        Email: <a id="company-email" href="mailto:lhduyanh2002@gmail.com" class="text-dark hover-underline">lhduyanh2002@gmail.com</a>
    `);

    $('#customer-info').html(`
        <strong><span id="customer-name">Khách vãng lai</span></strong><br>
        <span id="customer-address"><br></span>
        <span id="customer-phone"><br></span>
        <span id="customer-email"></span><br>
    `);

    $('#advisor-invoice-info').html(`
        <b><span id="invoice-id"></span></b><br>
        <b>Service Date: </b><span id="history-date"></span><br>

        <div class=" hover-underline-animation left" role="button">
            <b style="display: inline-block; margin-right: 3px;">Odo:</b>
            <input id="odo-info" type="text" class="form-control h-auto w-auto p-0 d-inline-block" 
                placeholder="Không xác định" style="border: none;" maxlength="15">
        </div><br>
        
        <span id="advisor-name">Advisor: </span><br>
        <span id="advisor-contact">Email: </span><br>
    `);

    $('#summary-input').val("");
    $('#diagnose-input').val("");

    $('#total-amount-info').text("0");
    $('#discount-info').val("0");
    $('#payable-amount-info').text("0");
}

function loadCarInfoByCar(car) {
    utils.setHashParam(hash_car, car.id);

    selectedCar = car;

    $("#num-plate-search-input").val(selectedCar.numPlate);
    $("#plate-type-select").val(selectedCar.plateType.id).trigger("change");
    $("#brand-select").val(selectedCar.model.brand.id).trigger("change");
    $("#model-select").val(selectedCar.model.id).trigger("change");
    
    $("#color_input").val(selectedCar.color);
    $("#color_input").prop("disabled", false)
    $("#description_input").val(selectedCar.carDetail);
    $("#description_input").prop("disabled", false);

    utils.set_char_count("#color_input", "#color_counter");
    utils.set_char_count("#description_input", "#description_counter");

    $("#save-btn").data("state", "save");
    $("#save-btn").text("Lưu");
    
    $("#show-history-btn").prop("hidden", true);
    $("#reload-history-list-btn").prop("disabled", false);
    $("#new-history-btn").prop("disabled", false);
}

$("#reset-btn").click(function (e) {
    $("#num-plate-search-input").val("");
    $("#plate-type-select").val(null).trigger("change");
    $("#brand-select").val(null).trigger("change");
    $("#model-select").val(null).trigger("change");
    $("#color_input").val("");
    $("#color_input").prop("disabled", true)
    $("#description_input").val("");
    $("#description_input").prop("disabled", true);

    $("#save-btn").data("state", "add");
    $("#save-btn").text("Thêm");

    $("#reload-history-list-btn").prop("disabled", true);
    $("#new-history-btn").prop("disabled", true);
    $("#show-history-btn").prop("hidden", true);

    historyTable.clear().draw();
    INVOICE_CARD.prop("hidden", true); 
    advisor = null;
    customer = null;
    selectedCar = null;
    utils.setHashParam(hash_car, null);
    selectedInvoice = null;
    utils.setHashParam(hash_invoice, null);

});

$("#save-btn").click(function () { 
    if ($(this).data("state") == "add" && $("#color_input").prop("disabled") == true && $("#description_input").prop("disabled") == true) {
        $("#color_input").prop("disabled", false)
        $("#description_input").prop("disabled", false);
        return;
    }
    if ($(this).data("state") == "add"){
        let numPlate = $("#num-plate-search-input").val().replace(/\s+/g, '');
        let plateType = $("#plate-type-select").val();
        let model = $("#model-select").val();
        let color = $("#color_input").val().trim();
        let detail = $("#description_input").val().trim();
        
        if(numPlate == null || numPlate == ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền biển kiểm soát"
            });
            return;
        }

        if(plateType == null){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn loại biển kiểm soát"
            });
            return;
        }

        if(model == null){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn mẫu xe"
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/cars",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                numPlate: numPlate,
                color: color,
                carDetail: detail,
                plateType: plateType,
                model: model
            }),
            beforeSend: function() {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if(response.code == 1000){
                    Swal.fire({
                        title: "Đã thêm mới xe",
                        html: `Thêm thông tin xe <b>${numPlate}</b> thành công` ,
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
                        backdrop: `
                            rgba(0,0,123,0.4)
                            url("https://sweetalert2.github.io/images/nyan-cat.gif")
                            left top
                            no-repeat
                        `
                    });
                    loadCarInfoByCar(response.data);
                }
                else {
                    console.log(response);
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code)
                    });
                }
            },
            error: function(xhr, status, error) {
                Swal.close();
                console.log(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
            }
        });



    }
    else if ($(this).data("state") == "save" && selectedCar !== null) { // update car info
        let numPlate = $('#num-plate-search-input').val().replace(/\s+/g, '');
        let plateType = $("#plate-type-select").val();
        let model = $("#model-select").val();
        let color = $("#color_input").val().trim();
        let detail = $("#description_input").val().trim();

        if(numPlate == null || numPlate == ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền biển kiểm soát"
            });
            return;
        }

        if(plateType == null){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn loại biển kiểm soát"
            });
            return;
        }

        if(model == null){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn mẫu xe"
            });
            return;
        }

        Swal.fire({
            title: "Cập nhật thông tin xe?",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: `Hủy`
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: "/api/cars/" + selectedCar.id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        numPlate: numPlate,
                        color: color,
                        carDetail: detail,
                        plateType: plateType,
                        model: model
                    }),
                    dataType: "json",
                    beforeSend: function() {
                        Swal.showLoading();
                    },
                    success: function (res) {
                        Swal.close();
                        if (res.code == 1000){
                            selectedCar = res.data;
                            loadCarInfoByCar(res.data);
                            Swal.fire({
                                title: "Cập nhật thành công",
                                html: `Thông tin xe <b>${selectedCar.numPlate}</b> đã được cập nhật` ,
                                icon: "success",
                                showConfirmButton: false,
                                timer: 2000,
                                backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("https://sweetalert2.github.io/images/nyan-cat.gif")
                                    left top
                                    no-repeat
                                `
                            });
                        }
                        else {
                            Toast.fire({
                                icon: "error",
                                title: utils.getErrorMessage(res.code)
                            });
                        }
                    }, 
                    error: function(xhr, status, error) {
                        Swal.close();
                        console.log(xhr);
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message
                        })
                    }
                });
            }
        });
    }
});

// Hàm định dạng option với name bên trái và price bên phải
function formatOption(state) {
    if (!state.id) {
        return state.text;
    }
    const price = $(state.element).data('price');
    return $(
        `<div class="d-flex justify-content-between">
            <span>${state.text}</span>
            <small class="align-text-bottomtext-muted">${price}</small>
        </div>`
    );
}

$('#add-detail-btn').click(async function () { 
    if (selectedInvoice == null) {
        Swal.fire({
            icon: "error",
            title: "Chưa chọn đơn dịch vụ",
            html: `Không thể lấy ID đơn dịch vụ, vui lòng chọn lại đơn cần chỉnh sửa`
        });
        return;
    } else if (selectedInvoice.status != 0) {
        Swal.fire({
            icon: "error",
            title: `Chỉnh sửa không hợp lệ`,
            html: `Chỉ được chỉnh sửa đơn dịch vụ có trạng thái <b>"đang thi công"</b>`
        });
        return;
    }

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/" + selectedInvoice.id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function(){
                Swal.showLoading();
            }
        });
        Swal.close();
    } catch (error) {
        console.log(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }
    if (res == null) return;
    if (res.code == 1000 && res.data){
        selectedInvoice = res.data;
        clearInvoiceCard();
        loadInvoiceInfo(selectedInvoice);
    }
    else {
        Toast.fire({
            icon: "error",
            title: res.message
        });
        return;
    }

    clear_modal();
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_title").text("Danh sách đăng ký dịch vụ");
    $("#modal_body").append(`
        <form id="modal-form">
            <div class="input_wrap form-group">
                <label>Chọn dịch vụ - Option - Số lượng - Giảm giá (%)</label><br>
                <span class="font-weight-light font-italic">*Mặc định số lượng là "1" và % giảm giá là "0"</span>
                <div id="service-wrapper" class="mt-2">
                    
                </div>

                <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
            </div>
        </form>
    `
                        
        );

    if (selectedInvoice.details.length == 0) {
        $('#service-wrapper').append(`
            <div class="row my-2 pb-2 service-option-wrapper border-bottom">
                <div class="col-12 col-md-4 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-service-select bigdrop" width="100%" data-placeholder="Chọn dịch vụ">
                    </select>
                </div>

                <div class="col-12 col-md-4 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-option-select bigdrop" width="100%" data-placeholder="Chọn option">
                    </select>
                </div>

                <div class="col-6 col-md-2">
                    <input type="text" name="modal-quantity" class="form-control select2-height modal-quantity-input"
                    maxlength="4" placeholder="Số lượng" value="1">
                </div>

                <div class="col-6 col-md-2">
                    <input type="text" name="modal-discount" class="form-control select2-height modal-discount-input"
                    maxlength="3" placeholder="Giảm giá %" value="0">
                </div>
            </div>
        `);

        $(".select2bs4").select2({
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            width: "100%",
            language: "vi",
            dropdownAutoWidth: true,
        });
    
        $(".modal-quantity-input").on("input", function () {
            const input = $(this).val().trim();
    
            if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                $(this).val('');
            }
        });
    
        $(".modal-discount-input").on("input", function () {
            const input = $(this).val().trim();
    
            if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                $(this).val('');
                return;
            }
    
            if (parseInt(input) > 100) {
                $(this).val(input.slice(0, -1));
            }
        });
    
        $.each(serviceOptionList, function (idx, val) { 
            $('.modal-service-select').append(`<option value="${val.id}">${val.name}</option>`);
        });
        $('.modal-service-select').val("").trigger("change");
    
    
        $('.modal-service-select').on('change', function () {
            let id = $(this).val();
            const wrapper = $(this).closest('.service-option-wrapper'); // Tìm cha gần nhất
            const $optionSelect = wrapper.find('.modal-option-select'); // Tìm select trong cùng cha
            if (id == null) {
                $optionSelect.empty();
                return;
            }
        
            const listOptionPrices = serviceOptionList.find(item => item.id == id);
        
            $.each(listOptionPrices.optionPrices, function (idx, val) {
                const option = new Option(val.name, val.id, false, false);
                $(option).attr('data-price', utils.formatVNDCurrency(val.price));
                $optionSelect.append(option);
            });
            $optionSelect.val("").trigger("change");
            
            // Khởi tạo Select2 với tùy chỉnh template cho các option
            $optionSelect.select2({
                templateResult: formatOption,
                templateSelection: formatOption,
                width: '100%',
                theme: 'bootstrap'
            });
        });
    }
    else {
        $.each(selectedInvoice.details, function (idx, detail) { 
            const newRow = $(`
                <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                    <div class="col-12 col-md-4 mb-1 mb-md-0">
                        <select class="form-control select2bs4 modal-service-select" width="100%" required 
                        data-placeholder="Chọn dịch vụ"></select>
                    </div>
        
                    <div class="col-12 col-md-4 mb-1 mb-md-0">
                        <select class="form-control select2bs4 modal-option-select" width="100%" required 
                        data-placeholder="Chọn option"></select>
                    </div>
        
                    <div class="col-6 col-md-2">
                        <input type="text" name="modal-quantity" class="form-control select2-height modal-quantity-input"
                        maxlength="4" placeholder="Số lượng" value="1">
                    </div>
        
                    <div class="input-group col-6 col-md-2">
                        <input type="text" name="modal-discount" class="form-control select2-height modal-discount-input"
                        maxlength="3" placeholder="% Giảm giá" value="0"
                        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <div class="input-group-append select2-height">
                            <a class="btn btn-sm btn-danger d-flex align-items-center remove-service-btn">
                                <i class="fa-regular fa-circle-xmark fa-lg"></i>
                            </a>
                        </div>
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
                $serviceSelect.append(`<option value="${val.id}">${val.name}</option>`);
            });
        
            // Thêm sự kiện chỉ cho input mới
            newRow.find(".modal-quantity-input").on("input", function () {
                const input = $(this).val().trim();
                if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                    $(this).val('');
                }
            });
            newRow.find(".modal-quantity-input").val(detail.quantity);
        
            newRow.find(".modal-discount-input").on("input", function () {
                const input = $(this).val().trim();
                if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                    $(this).val('');
                    return;
                }
                if (parseInt(input) > 100) {
                    $(this).val(input.slice(0, -1));
                }
            });
            newRow.find(".modal-discount-input").val(detail.discount);
        
            // Thêm sự kiện cho service-select và xử lý option-select
            newRow.find('.modal-service-select').on('change', function () {
                let id = $(this).val();
                const wrapper = $(this).closest('.service-option-wrapper');
                const $optionSelect = wrapper.find('.modal-option-select');
                if (id == null) {
                    $optionSelect.empty();
                    return;
                }
        
                const listOptionPrices = serviceOptionList.find(item => item.id == id);
                $optionSelect.empty(); // Đảm bảo xóa các option cũ
        
                $.each(listOptionPrices.optionPrices, function (idx, val) {
                    const option = new Option(val.name, val.id, false, false);
                    $(option).attr('data-price', utils.formatVNDCurrency(val.price));
                    $optionSelect.append(option);
                });
                $optionSelect.val("").trigger("change");
        
                // Khởi tạo Select2 với template tùy chỉnh cho option
                $optionSelect.select2({
                    templateResult: formatOption,
                    templateSelection: formatOption,
                    width: '100%',
                    theme: 'bootstrap'
                });
            });
            
            $serviceSelect.val(detail.service.id).trigger("change");
            $optionSelect.val(detail.option.id).trigger("change");
        });
    }

    $("#add-service-btn").click(function (e) {
        const newRow = $(`
            <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                <div class="col-12 col-md-4 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-service-select" width="100%" required 
                    data-placeholder="Chọn dịch vụ"></select>
                </div>
    
                <div class="col-12 col-md-4 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-option-select" width="100%" required 
                    data-placeholder="Chọn option"></select>
                </div>
    
                <div class="col-6 col-md-2">
                    <input type="text" name="modal-quantity" class="form-control select2-height modal-quantity-input"
                    maxlength="4" placeholder="Số lượng" value="1">
                </div>
    
                <div class="input-group col-6 col-md-2">
                    <input type="text" name="modal-discount" class="form-control select2-height modal-discount-input"
                    maxlength="3" placeholder="% Giảm giá" value="0"
                    style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <div class="input-group-append select2-height">
                        <a class="btn btn-sm btn-danger d-flex align-items-center remove-service-btn">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </a>
                    </div>
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
            $serviceSelect.append(`<option value="${val.id}">${val.name}</option>`);
        });
        $serviceSelect.val("").trigger("change");
    
        // Thêm sự kiện chỉ cho input mới
        newRow.find(".modal-quantity-input").on("input", function () {
            const input = $(this).val().trim();
            if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                $(this).val('');
            }
        });
    
        newRow.find(".modal-discount-input").on("input", function () {
            const input = $(this).val().trim();
            if (!/^\d*$/.test(input) || isNaN(parseInt(input.slice(-1)))) {
                $(this).val('');
                return;
            }
            if (parseInt(input) > 100) {
                $(this).val(input.slice(0, -1));
            }
        });
    
        // Thêm sự kiện cho service-select và xử lý option-select
        newRow.find('.modal-service-select').on('change', function () {
            let id = $(this).val();
            const wrapper = $(this).closest('.service-option-wrapper');
            const $optionSelect = wrapper.find('.modal-option-select');
            if (id == null) {
                $optionSelect.empty();
                return;
            }
    
            const listOptionPrices = serviceOptionList.find(item => item.id == id);
            $optionSelect.empty(); // Đảm bảo xóa các option cũ
    
            $.each(listOptionPrices.optionPrices, function (idx, val) {
                const option = new Option(val.name, val.id, false, false);
                $(option).attr('data-price', utils.formatVNDCurrency(val.price));
                $optionSelect.append(option);
            });
            $optionSelect.val("").trigger("change");
    
            // Khởi tạo Select2 với template tùy chỉnh cho option
            $optionSelect.select2({
                templateResult: formatOption,
                templateSelection: formatOption,
                width: '100%',
                theme: 'bootstrap'
            });
        });
    });

    $('#modal_body').on("click", ".remove-service-btn", function () {
        $(this).closest(".row").remove();
    });
    
    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" form="modal-form" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $("#modal_id").modal("show");

    $('#modal_submit_btn').click( async function () { 
        if (!$("#modal-form")[0].checkValidity()) {
            $("#modal-form")[0].reportValidity();
            return;
        }

        let serviceOptions = [];;
        var hasError = false; // Biến cờ để theo dõi lỗi
        var hasEmptyInput = false;

        // Duyệt qua từng phần tử trong #service-wrapper
        $("#service-wrapper .row").each(function () {
            var selectedService = $(this).find(".modal-service-select").val();
            var selectedOption = $(this).find(".modal-option-select").val();

            var modalQuantity = $(this).find('input[name="modal-quantity"]').val().replace(/\s+/g, '');
            var modalDiscount = $(this).find('input[name="modal-discount"]').val().replace(/\s+/g, '');

            if (selectedService == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn dịch vụ",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            if (selectedOption == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn option",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            if (modalQuantity === null || modalDiscount === null || modalQuantity === "" || modalDiscount === "") {
                hasEmptyInput = true;
                if(modalQuantity === null || modalQuantity === "") {
                    modalQuantity = 1;
                }
                if(modalDiscount === null || modalDiscount === "") {
                    modalDiscount = 0;
                }
                console.log(modalQuantity);
                console.log(modalDiscount);
                
            }

            var isValidNumber = /^\d+$/.test(modalQuantity);
            if (!isValidNumber) {
                Toast.fire({
                    icon: "warning",
                    title: "Số lượng phải là số nguyên lớn hơn 0",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            // Kiểm tra giá trị nhập vào có phải là số hay không (double)
            var modalQuantityAsNumber = parseInt(modalQuantity);
            if (isNaN(modalQuantityAsNumber) || modalQuantityAsNumber <= 0) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng nhập số lượng hợp lệ và lớn hơn 0",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            isValidNumber = /^\d+$/.test(modalDiscount);
            if (!isValidNumber) {
                Toast.fire({
                    icon: "warning",
                    title: "% Giảm giá phải là số nguyên không âm",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            // Kiểm tra giá trị nhập vào có phải là số hay không (double)
            var modalDiscountAsNumber = parseInt(modalDiscount);
            if (isNaN(modalDiscountAsNumber) || modalDiscountAsNumber < 0) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng nhập % giảm giá hợp lệ và không âm",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            serviceOptions.push({
                serviceId: selectedService,
                optionId: selectedOption,
                discount: modalDiscountAsNumber,
                quantity: modalQuantityAsNumber
            });
        });

        if (hasError) {
            return;
        }

        if (hasEmptyInput) {
            const warn = await Swal.fire({
                title: "Trường thông tin trống",
                html: `Mặc định trường <b>"số lượng" là 1</b> và <b>"% giảm giá" là 0</b>`,
                icon: "warning",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Hủy"
            });

            if (warn.isConfirmed){
            } else {
                return;
            }
        }

        if (serviceOptions.length == 0){
            const warn = await Swal.fire({
                icon: "question",
                title: "Xóa tất cả dịch vụ?",
                html: "Thao tác này sẽ xóa tất cả dịch vụ đã đăng ký<br>trong đơn dịch vụ này?",
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Hủy"
            });
            if (warn.isConfirmed) {
                console.warn("Gọi ajax xóa hết chi tiết lịch sử");
                $.ajax({
                    type: "PUT",
                    url: "/api/detail/clear-details/"+selectedInvoice.id,
                    headers: utils.defaultHeaders(),
                    dataType: "json",
                    beforeSend: function(){
                        Swal.showLoading();
                    },
                    success: function (response) {
                        Swal.close();
                        if (response.code == 1000) {
                            Toast.fire({
                                icon: "success",
                                title: `Đã xóa tất cả dịch vụ`,
                            });
                            $("#modal_id").modal("hide");
                            loadInvoiceInfo(response.data);
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
            } else {
                return;
            }
        }
        else {
            $.ajax({
                type: "POST",
                url: "/api/detail/" + selectedInvoice.id,
                headers: utils.defaultHeaders(),
                data: JSON.stringify(
                    serviceOptions.map(detail => ({
                        serviceId: detail.serviceId,
                        optionId: detail.optionId,
                        discount: detail.discount,
                        quantity: detail.quantity
                    })),
                ),
                beforeSend: function(){
                    Swal.showLoading();
                },
                success: function (response) {
                    Swal.close();
                    if (response.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Cập nhật thành công`,
                        });
                        $("#modal_id").modal("hide");
                        loadInvoiceInfo(response.data);
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
        }
    });
});

$("#new-history-btn").click(async function () { 
    if ($(this).prop("disabled")) {
        return;
    }
    if (selectedCar == null) {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng chọn xe cần xem dịch vụ"
        });
        return;
    }
    if (utils.getUserInfo() == null) {
        Swal.fire({
            icon: "error",
            title: "Không thể lấy thông tin",
            text: "Không thể lấy thông tin cố vấn dịch vụ, vui lòng tải lại trang",
            showConfirmButton: false,
        });
        return;
    }
    let res;

    try {
        res = await $.ajax({
            type: "POST",
            url: "/api/history/new-history",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                carId: selectedCar.id,
                advisorId: utils.getUserInfo().id
            }),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
        Swal.close();
    } catch (error) {
        Swal.close();
        console.log(error);
        Swal.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message,
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }
    Swal.close();
    if (res.code == 1000 && res.data) {
        loadHistoryListByCarID(res.data.car.id)
        selectedInvoice = res.data;
        clearInvoiceCard();
        loadInvoiceInfo(res.data);
    }
    else {
        INVOICE_CARD.prop("hidden", true);
        clearInvoiceCard();
        Swal.fire({
            icon: "error",
            title: utils.getErrorMessage(res.code).message,
            showConfirmButton: false
        });
    }
});

$('#reload-history-list-btn').click(function () { 
    if (selectedCar == null) {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng chọn xe cần xem dịch vụ"
        });
        return;
    }
    loadHistoryListByCarID(selectedCar.id);
});

$('#service-history-table tbody').on('click', 'tr', function() {
    if ($(this).find('td').hasClass('dataTables_empty')) return;

    if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
        $("#show-history-btn").prop("hidden", true);
    } else {
        $('#car-table tbody tr').removeClass('selected');
        $(this).addClass('selected');
        $("#show-history-btn").prop("hidden", false);
    }
});

$("#show-history-btn").click(function () { 
    var selectedRow = $('#service-history-table tbody tr.selected');
    let rowData = $('#service-history-table').DataTable().row(selectedRow).data();
    
    if (selectedRow.length > 0) {
        loadInvoiceById(rowData.id);
    } else {
        Toast.fire({
            icon: "warning",
            title: "Chọn 1 hồ sơ dịch vụ"
        })
    }
});

$('#save-invoice-info-btn').click(function () { // Lưu odo, summary, diagnose, discount 
    let summary = $('#summary-input').val().trim();
    let diagnose = $('#diagnose-input').val().trim();
    let discount = $('#discount-info').val();
    let odo = $('#odo-info').val().trim();

    if (odo != null && odo != "") {
        odo = odo.replace(/\D/g, ''); 
    } else {
        odo = null;
    }

    if (discount == null || discount == ""){
        discount = 0;
    }

    $.ajax({
        type: "PUT",
        url: "/api/history/update-info/"+selectedInvoice.id,
        headers: utils.defaultHeaders(),
        data: JSON.stringify({
            summary: summary,
            diagnose: diagnose,
            discount: discount,
            odo: odo
        }),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data) {
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công",
                    html: "Cập nhật thành công thông tin tóm tắt, chẩn đoán và % giảm giá",
                    showConfirmButton: false,
                    timer: 1500
                });
                loadInvoiceInfo(res.data);
            }
            else {
                Toast.fire({
                    icon: "error",
                    title: utils.getErrorMessage(res.code)
                });
            }
        },
        error: function(xhr, status, error){
            console.log(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$('#table-details tbody').on('click', 'tr', function() {
    if ($(this).find('td').hasClass('dataTables_empty')) return;

    if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
        $('#delete-detail-btn').prop('hidden', true);
    } else {
        $('#table-details tbody tr').removeClass('selected');
        $(this).addClass('selected');
        $('#delete-detail-btn').prop('hidden', false);
    }
});

async function loadInvoiceById(invoiceId) {
    try {
        const res = await $.ajax({
            type: "GET",
            url: "/api/history/" + invoiceId,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function(){
                Swal.showLoading();
            }
        });
        Swal.close();

        if (res.code == 1000 && res.data){
            clearInvoiceCard();
            loadInvoiceInfo(res.data);
        }
        else {
            Toast.fire({
                icon: "error",
                title: res.message
            });
        }
    } catch (xhr) {
        Swal.close();
        console.log(xhr);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(xhr).message
        });
        return;
    }
}

function loadListDetailsHistory(details) {
    $(TABLE_DETAILS).DataTable().clear().draw();
    if(details == null) {
        return;
    }
    if (details.length == 0){
        return;
    }

    let data = [];
    let counter = 1;
    details.forEach(function (detail) {
        data.push({
            number: counter++, // Số thứ tự tự động tăng
            id: detail.id,
            service: detail.service,
            serviceName: detail.serviceName,
            option: detail.option,
            optionName: detail.optionName,
            price: detail.price,
            discount: detail.discount,
            quantity: detail.quantity,
            finalPrice: detail.finalPrice,
        });
    });

    $(TABLE_DETAILS).DataTable().clear().rows.add(data).draw();
}

function loadInvoiceInfo(invoice) {
    INVOICE_CARD.prop("hidden", false);

    utils.setHashParam(hash_invoice, invoice.id);
    selectedInvoice = invoice;
    advisor = invoice.advisor;
    customer = invoice.customer;
    loadCustomerInfo();
    loadAdvisorInfo();

    let t = utils.getTimeAsJSON(invoice.serviceDate);
    let invoiceIdHtml = "";
    if (invoice.status == 1) {
        invoiceIdHtml = `Invoice #${invoice.id}`;
    } else {
        invoiceIdHtml = `Order #${invoice.id}`;
    }
    $('#invoice-id').html(invoiceIdHtml);
    $('#history-date').text(`${t.hour}:${t.min}, ${t.date}/${t.mon}/${t.year}`);
    $('#odo-info').val(invoice.odo != null ? utils.formatCurrent(invoice.odo) : "");

    let totalAmount = utils.formatVNDCurrency(invoice.totalAmount);
    let payableAmount = utils.formatVNDCurrency(invoice.payableAmount);

    $('#total-amount-info').text(totalAmount);
    $('#discount-info').val(invoice.discount);
    $('#payable-amount-info').text(payableAmount);
    $('#summary-input').val(invoice.summary);
    $('#diagnose-input').val(invoice.diagnose);

    if (invoice.status == 0) {
        $('#summary-input').prop("disabled", false);
        $('#diagnose-input').prop("disabled", false);
    } else {
        $('#summary-input').prop("disabled", true);
        $('#diagnose-input').prop("disabled", true);
    }

    loadListDetailsHistory(invoice.details);
}

function loadCustomerInfo() {  // Load thông tin lên từ biến customer
    if (customer == null) {
        $("#customer-name").text("Khách vãng lai");
        $('#customer-address').html("");
        $('#customer-phone').html("");
        $('#customer-email').html("");
        return;
    }

    let addressHtml = customer.address ? formatAddress(customer.address.address)+"<br>" : "";
    let phoneHtml = customer.phone ? `Phone: <a href="tel:${customer.phone}" class="text-dark hover-underline">${customer.phone}</a><br>` : "";
    let mailHtml = customer.accounts[0] ? `Email: <a href="mailto:${customer.accounts[0].email}" class="text-dark hover-underline">${customer.accounts[0].email}</a>`: "";

    $("#customer-name").text(customer.name);
    $('#customer-address').html(addressHtml);
    $('#customer-phone').html(phoneHtml);
    $('#customer-email').html(mailHtml);
}

function loadAdvisorInfo() {  // Load thông tin lên từ biến advisor
    if (advisor == null) {
        $("#advisor-name").text("- Không xác định -");
        $('#advisor-contact').html("");
        return;
    }

    let phone = advisor.phone || "";
    let email = advisor.accounts[0] ? advisor.accounts[0].email : "";

    let contactHtml = `<b>Contact: </b>`;
    if (phone !== "") {
        if(email !== ""){
            contactHtml += phone + " - " + email;
        } else {
            contactHtml += phone;
        }
    } else {
        if(email !== ""){
            contactHtml += email;
        } else {
            contactHtml = "";
        }
    }

    $("#advisor-name").html(`<b>Advisor: </b>${advisor.name}`);
    $('#advisor-contact').html(contactHtml);
}

function formatAddress(address) {
    const parts = address.split(',');
    if (parts.length > 2) {
        return `${parts.slice(0, 2).join(', ')},<br>${parts.slice(2).join(', ')}`;
    }
    return address;
}

$(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
});




function ImgUpload() {
    var imgWrap = "";
    var imgArray = [];
  
    $('.upload__inputfile').each(function () {
      $(this).on('change', function (e) {
        imgWrap = $(this).closest('.upload__box').find('.upload__img-wrap');
        var maxLength = $(this).data('max_length');
  
        var files = e.target.files;        
        var filesArr = Array.prototype.slice.call(files);
        var iterator = 0;

        if (imgArray.length + files.length > maxLength) {
            Swal.fire({
                icon: "warning",
                title: "Upload tối đa 5 ảnh",
                showConfirmButton: false,
                timer: 2000
            })
            return false;
        }

        filesArr.forEach(function (f, index) {  
          if (!f.type.match('image.*')) {
            return;
          }
  
          if (imgArray.length > maxLength) {
            Swal.fire({
                icon: "warning",
                title: "Upload tối đa 5 ảnh",
                showConfirmButton: false,
                timer: 2000
            })
            return false;
          } else {
            var len = 0;
            for (var i = 0; i < imgArray.length; i++) {
              if (imgArray[i] !== undefined) {
                len++;
              }
            }
            if (len > maxLength) {
              return false;
            } else {
              imgArray.push(f);
  
              var reader = new FileReader();
              reader.onload = function (e) {
                var html = `
                    <div class='upload__img-box'>
                        <a href="${e.target.result}" data-toggle="lightbox" data-gallery="gallery" data-footer="${f.name}">
                        <div style='background-image: url(${e.target.result})' 
                            data-number='${$(".upload__img-close").length}' 
                            data-file='${f.name}' 
                            class='img-bg'>
                            <img src="${e.target.result}" class="img-fluid" style="display:none;"> 
                            <div class='upload__img-close'></div>
                        </div>
                        </a>
                    </div>
                    `;
                imgWrap.append(html);
                iterator++;

                
              }
              reader.readAsDataURL(f);
            }
          }
        });
      });
    });
  
    $('body').on('click', ".upload__img-close", function (e) {
        var file = $(this).parent().data("file");
        for (var i = 0; i < imgArray.length; i++) {
            if (imgArray[i].name === file) {
            imgArray.splice(i, 1);
            break;
            }
        }
        $(this).parent().parent().remove();
    });
  }
