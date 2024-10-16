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
var brandModelList = [];
var selectedCar;
var customerList = [];
var customer;
var advisor;
var selectedInvoice;

var INVOICE_CARD = $("#invoice-card");
    
$(document).ready(function () {
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
        loadCarInfoHistoryListByID(carId);
        let invoiceId = utils.getHashParam(hash_invoice);
        if (invoiceId) {
            loadInvoiceById(invoiceId);
        }
    }
});

$('.discount-suggestion').on('click', function() {
    const discountValue = $(this).text().replace('%', ''); // Loại bỏ dấu '%'
    $('#discount-info').val(discountValue);
});

$('#discount-info').on('input', function () {
    const input = $(this).val();
    if (!/^\d*$/.test(input) || parseInt(input) > 100) {
        $(this).val(input.slice(0, -1)); // Loại bỏ ký tự cuối nếu không hợp lệ
    }

    $('.dropdown-menu').removeClass('show');
});


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
                    userTable.search(this.value.trim()).draw();
                });
    
                $("#car-select-btn").click(function (e) { 
                    var selectedRow = $('#car-table tbody tr.selected');
                    let carData = $('#car-table').DataTable().row(selectedRow).data();
                    
                    if (selectedRow.length > 0) {
                        loadCarInfoHistoryListByID(carData.id);
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
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
            })
        },
    });
}

$("#edit-user-btn").click(function () {
    openUserSelectionTable();
});

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
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(xhr).message
        })
    }
}

async function loadCarInfoHistoryListByID(id) {
    utils.setHashParam(hash_car, id);

    await $.ajax({
        type: "GET",
        url: "/api/cars/" + id,
        headers: utils.defaultHeaders(),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data) {
                selectedCar = res.data;

                $("#num-plate-search-input").val(selectedCar.numPlate);
                $("#plate-type-select").val(selectedCar.plateType.id).trigger("change");
                $("#brand-select").val(selectedCar.model.brand.id).trigger("change");
                $("#model-select").val(selectedCar.model.id).trigger("change");
                
                $("#color_input").val(selectedCar.color);
                $("#color_input").prop("disabled", false)
                $("#description_input").val(selectedCar.carDetail);
                $("#description_input").prop("disabled", false);

                $("#save-btn").data("state", "save");
                $("#save-btn").text("Lưu");

                $("#new-history-btn").prop("disabled", false); customer = null;
            }
        },
        error: function(xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: "Không thể lấy thông tin xe"
            })
        }
    });

    await $.ajax({// ajax lấy lịch sử dịch vụ lên table
        type: "GET",
        url: "/api/history/get-by-car/" + id,
        headers: utils.defaultHeaders(),     
        dataType: "json",
        success: function (res) {
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
                    status: invoice.status
                });
            });

            historyTable.clear().rows.add(data).draw();
        },
        error: function(xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: "Không thể lấy thông tin xe"
            })
        }
    });
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

    $("#save-btn").data("state", "save");
    $("#save-btn").text("Lưu");
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
    if ($(this).data("state") == "add"){
        $("#color_input").prop("disabled", false)
        $("#description_input").prop("disabled", false);
    }
    
});

$("#new-history-btn").click(function () { 
    if ($(this).prop("disabled")) {
        return;
    }

    INVOICE_CARD.prop("hidden", false);
    
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

async function loadInvoiceById(invoiceId) {
    try {
        INVOICE_CARD.prop("hidden", false);

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
            utils.setHashParam(hash_invoice, res.data.id);
            selectedInvoice = res.data;
            advisor = res.data.advisor;
            customer = res.data.customer;
            loadCustomerInfo();
            loadAdvisorInfo();

            let t = utils.getTimeAsJSON(res.data.serviceDate);
            $('#invoice-id').html(res.data.id);
            $('#history-date').text(`${t.hour}:${t.min}, ${t.date}/${t.mon}/${t.year}`);
            $('#odo-info').html(res.data.odo ? res.data.odo + " km" : "Không xác định");

            let totalAmount = utils.formatVNDCurrency(res.data.totalAmount);
            let payableAmount = utils.formatVNDCurrency(res.data.payableAmount);

            $('#total-amount-info').text(totalAmount);
            $('#discount-info').text(res.data.discount);
            $('#payable-amount-info').text(payableAmount);

            //                                                                       Load các chi tiết hóa đơn lên

        }
        else {
            Toast.fire({
                icon: "error",
                title: res.message
            });
        }



    } catch (xhr) {
        console.log("Error in loading invoice");
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(xhr)
        });
    }
}

function loadInvoiceInfo(invoice) { // chưa  hoàn thiện
    INVOICE_CARD.prop("hidden", false);

    if (res.code == 1000 && res.data){
        selectedInvoice = res.data;
        customer = res.data.customer;
        loadCustomerInfo();

        let t = utils.getTimeAsJSON(res.data.serviceDate);
        $('#invoice-id').html(res.data.id);
        $('#history-date').text(`${t.hour}:${t.min}, ${t.date}/${t.mon}/${t.year}`);
        $('#odo-info').html(res.data.odo ? res.data.odo + " km" : "Không xác định");

        //                                                                       Load các chi tiết hóa đơn lên

    }
    else {
        Toast.fire({
            icon: "error",
            title: res.message
        });
    }

}

function loadCustomerInfo() {  // Load thông tin lên từ biến customer
    if (customer == null) {
        $("#customer-name").text("Khách vãng lai");
        $('#customer-address').html("");
        $('#customer-phone').html("");
        $('#customer-email').html("");
        return;
    }

    let addressHtml = customer.address ? formatAddress(customer.address.address) : "";
    let phoneHtml = customer.phone ? `Phone: <a href="tel:${customer.phone}" class="text-dark hover-underline">${customer.phone}</a>` : "";
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