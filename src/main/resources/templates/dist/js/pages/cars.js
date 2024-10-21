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
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

var dataTable;
var dataTableCard = $("#data-table-card");

var userList = [];

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

$(document).ready(function () {
    dataTable = $("#data-table").DataTable({
        responsive: true,
        lengthChange: true,
        autoWidth: false,
        buttons: [
            { extend: "copy", text: "Copy" },
            { extend: "csv", text: "CSV" },
            { extend: "excel", text: "Excel" },
            {
                extend: "pdf",
                text: "PDF",
            },
            { extend: "print", text: "Print" },
            { extend: "colvis", text: "Column Visibility" },
        ],
        columnDefs: [
            { orderable: false, targets: 5 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/cars/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (car) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: car.id,
                            numPlate: car.numPlate,
                            color: car.color,
                            carDetail: car.carDetail,
                            createAt: car.createAt,
                            status: car.status,
                            plateType: car.plateType,
                            brand: car.model.brand,
                            model: car.model
                        });
                    });

                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: res.message || "Lỗi! Không thể lấy dữ liệu",
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
            },
        },
        columns: [
            { data: "number" },
            {
                data: "numPlate",
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
            { data: null,
                render: function(data, type, row) {
                    let html = `<center>${row.brand.brand}<br>${row.model.model}</center>`;
                    return html;
                }
            },
            {
                data: "carDetail",
                render: function (data, type, row) {
                    let html = "";
                    if(row.color != null) {
                        html += `<b>Màu xe:</b> ${row.color}<br>`;
                    }

                    if(row.createAt != null) {
                        html += `<b>Ngày tạo:</b> ${utils.formatVNDate(row.createAt)}<br>`;
                    }

                    if (data != "") {
                        html += `<b>Nội dung: <br></b> ${data.replace(/\n/g, '<br>')}`;
                    }
                    return html;
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang sử dụng</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Ngưng sử dụng</span></center>';
                    }
                    return "";
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;

                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" style="padding: .25rem 0.4rem;" id="disableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i></a>`;
                    }
                    if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-check fa-lg"></i></a> 
                        <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    }
                    return "<center>" + html + "</center>";
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
        initComplete: function () {
            this.api()
                .buttons()
                .container()
                .appendTo("#data-table_wrapper .col-md-6:eq(0)");
        },
    });
});

$("#data-table").on("click", "#editBtn", function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/cars/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu xe"
                });
                return;
            }
            var car = res.data;
            clear_modal();
            $("#modal_title").text("Sửa thông tin xe");
            $("#modal_body").append(`
                <form id="modal-form">
                    <div class="form-group">
                        <div class="container mt-3 mb-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="mb-0" for="modal_numplate_input">Biển kiểm soát <span class="text-danger">*</span></label>
                                <kbd id="modal_numplate_counter" class="mb-0 small">0/50</kbd>
                            </div>
                        </div>
                        <input id="modal_numplate_input" type="text" class="form-control" required 
                        style="text-transform: uppercase;" maxlength="50" placeholder="65A12345">
                    </div>

                    <div class="form-group">
                        <label>Loại biển kiểm soát <span class="text-danger">*</span></label>
                        <div class="form-group">
                            <select id="plate-type-select" required class="form-control select2bs4" style="width: 100%;">
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Hãng xe <span class="text-danger">*</span></label>
                        <div class="form-group">
                            <select id="brand-select" class="form-control select2bs4" required style="width: 100%;">
                                <option disabled selected> Chọn hãng xe </option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Mẫu xe <span class="text-danger">*</span></label>
                        <div class="form-group">
                            <select id="model-select" class="form-control select2bs4" required style="width: 100%;">
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="container mt-3 mb-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="mb-0" for="modal_color_input">Màu sơn/wrap</label>
                                <kbd id="modal_color_counter" class="mb-0 small">0/200</kbd>
                            </div>
                        </div>
                        <input type="text" class="form-control" id="modal_color_input" maxlength="200" placeholder="Nhập mô tả màu sơn/wrap">
                    </div>

                    <div class="form-group">
                        <div class="container mt-3 mb-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="mb-0" for="modal_cardetail_input">Mô tả chi tiết</label>
                                <kbd id="modal_cardetail_counter" class="mb-0 small">0/1000</kbd>
                            </div>
                        </div>
                        <textarea wrap="soft" class="form-control" id="modal_cardetail_input" rows="3" maxlength="1000" placeholder="Mô tả chi tiết xe"></textarea>
                    </div>
                </form>
            `);

            var brandModelList = [];

            $("#modal_numplate_input").val(car.numPlate);
            $("#modal_color_input").val(car.color);
            $("#modal_cardetail_input").val(car.carDetail);

            $.ajax({
                type: "GET",
                url: "/api/brands/fetch-model",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": ""
                },
                success: function (response) {
                    if(response.code == 1000) {
                        brandModelList = response.data;
                        $("#brand-select").empty();
                        $("#brand-select").append(`<option selected value=""> Chọn hãng xe </option>`);
                        $.each(response.data, function (idx, brand) { 
                            let html = "";
                            if(brand.id == car.model.brand.id){
                                html = `<option selected value=${brand.id}> ${brand.brand} </option>`;
                            } else {
                                html = `<option value=${brand.id}> ${brand.brand} </option>`;
                            }
                            $("#brand-select").append(html);

                            const selectedBrand = brandModelList.find(item => item.id == car.model.brand.id);
                            $('#model-select').empty();
                            $('#model-select').append(`<option disabled value=""> Chọn mẫu xe </option>`);
                            $.each(selectedBrand.models, function (idx, val) { 
                                html = "";
                                if(val.id == car.model.id){
                                    html = `<option selected value="${val.id}"> ${val.model} </option>`;
                                } else {
                                    html = `<option value="${val.id}"> ${val.model} </option>`;
                                }
                                $('#model-select').append(html);
                            });
                        });
                    }
                    else {
                        Toast.fire({
                            icon: "warning",
                            title: "Lỗi lấy dữ liệu brand-model"
                        });
                        console.log(utils.getErrorMessage(response.code));
                        $("#modal_id").modal("hide");
                    }
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    $("#modal_id").modal("hide");
                }
            });

            $.ajax({
                type: "GET",
                url: "/api/plate-types",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": ""
                },
                success: function (response) {
                    if(response.code == 1000) {
                        $("#plate-type-select").append(`<option disabled value=""> Chọn loại biển kiểm soát </option>`);
                        $.each(response.data, function (idx, plateType) { 
                            let html = "";
                            if(plateType.id == car.plateType.id) {
                                html = `<option selected value=${plateType.id}> ${plateType.type} </option>`;
                            }
                            else {
                                html = `<option value=${plateType.id}> ${plateType.type} </option>`;
                            }

                            $("#plate-type-select").append(html);
                        });
                    }
                    else {
                        Toast.fire({
                            icon: "warning",
                            title: "Lỗi lấy dữ liệu plate-type"
                        });
                        console.log(utils.getErrorMessage(response.code));
                        $("#modal_id").modal("hide");
                    }
                },
                error: function(xhr, status, error) {
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    $("#modal_id").modal("hide");
                }
            });

            $('#plate-type-select').select2({
                placeholder: "Chọn loại biển kiểm soát",
                allowClear: true,
                theme: "bootstrap",
                language: "vi",
                closeOnSelect: true
            });
        
            $('#brand-select').select2({
                placeholder: "Chọn hãng xe",
                allowClear: true,
                theme: "bootstrap",
                language: "vi",
                closeOnSelect: true,
            });
        
            $('#model-select').select2({
                placeholder: "Chọn mẫu xe",
                allowClear: true,
                theme: "bootstrap",
                language: "vi",
                closeOnSelect: true
            });
        
            $('#brand-select').on('change', function () {
                let id = $(this).val();
                
                const brand = brandModelList.find(item => item.id == id);
        
                if(brand) {
                    $('#model-select').empty();
                    $('#model-select').append(`<option disabled selected value=""> Chọn mẫu xe </option>`);
                    $.each(brand.models, function (idx, val) { 
                        $('#model-select').append(`<option value="${val.id}"> ${val.model} </option>`);
                    });
                } else {
                    console.log("Error in getting model");
                }
                
            });

            $("#modal_footer").append(
                '<button class="btn btn-primary" type="button" form="modal-form" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
            );
            
            utils.set_char_count("#modal_numplate_input", "#modal_numplate_counter");
            utils.set_char_count("#modal_color_input", "#modal_color_counter");
            utils.set_char_count("#modal_cardetail_input", "#modal_cardetail_counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                if(!$('#modal-form')[0].checkValidity()){
                    $('#modal-form')[0].reportValidity();
                    return;
                }
                
                let numPlate = $("#modal_numplate_input").val().replace(/\s+/g, '');
                let plateType = $("#plate-type-select").val();
                let model = $("#model-select").val();
                let color = $("#modal_color_input").val().trim();
                let detail = $("#modal_cardetail_input").val().trim();
                
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
                    type: "PUT",
                    url: "/api/cars/" + id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        numPlate: numPlate,
                        color: color,
                        carDetail: detail,
                        plateType: plateType,
                        model: model
                    }),
                    success: function (response) {
                        if(response.code == 1000){
                            Toast.fire({
                                icon: "success", 
                                title: "Cập nhật thông tin xe thành công"
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        }
                        else {
                            Toast.fire({
                                icon: "warning",
                                title: utils.getErrorMessage(response.code)
                            })
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr);
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message
                        });
                        dataTable.ajax.reload();
                    }
                });
            });

        },
        error: function(xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
            $("#modal_id").modal("hide");
        }
    });
});

$("#data-table").on("click", "#deleteBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    // Lấy hàng hiện tại
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let numPlate = rowData.numPlate;

    Swal.fire({
        title: `Xóa hồ sơ xe</br>${numPlate}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/cars/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${numPlate}`,
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: res.message,
                        });
                    }
                    dataTable.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message,
                    });
                    dataTable.ajax.reload();
                },
            });
        }
    });
});

$("#data-table").on("click", "#disableBtn", function () {  

    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let numPlate = rowData.numPlate.toUpperCase();

    Swal.fire({
        title: `Ngưng sử dụng xe</br>${numPlate}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/cars/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ngưng sử dụng</br>" + numPlate
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});

$("#data-table").on("click", "#enableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let numPlate = rowData.numPlate.toUpperCase();

    Swal.fire({
        title: `Sử dụng xe</br>${numPlate}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/cars/enable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã mở sử dụng xe</br>" + numPlate
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});

$("#new-car-btn").click(function () { 
    clear_modal();
    $("#modal_title").text("Thêm hồ sơ xe");
    $("#modal_body").append(`
        <form id="modal-form">
            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_numplate_input">Biển kiểm soát <span class="text-danger">*</span></label>
                        <kbd id="modal_numplate_counter" class="mb-0 small">0/50</kbd>
                    </div>
                </div>
                <input id="modal_numplate_input" type="text" class="form-control" required 
                style="text-transform: uppercase;" maxlength="50" placeholder="65A12345">
            </div>

            <div class="form-group">
                <label>Loại biển kiểm soát <span class="text-danger">*</span></label>
                <div class="form-group">
                    <select id="plate-type-select" required class="form-control select2bs4" style="width: 100%;" data-placeholder="Chọn loại biển kiểm soát">
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Hãng xe <span class="text-danger">*</span></label>
                <div class="form-group">
                    <select id="brand-select" class="form-control select2bs4" required style="width: 100%;" data-placeholder="Chọn hãng xe">
                        <option disabled selected> Chọn hãng xe </option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Mẫu xe <span class="text-danger">*</span></label>
                <div class="form-group">
                    <select id="model-select" class="form-control select2bs4" required style="width: 100%;" data-placeholder="Chọn mẫu xe">
                    </select>
                </div>
            </div>

            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_color_input">Màu sơn/wrap</label>
                        <kbd id="modal_color_counter" class="mb-0 small">0/200</kbd>
                    </div>
                </div>
                <input type="text" class="form-control" id="modal_color_input" maxlength="200" placeholder="Nhập mô tả màu sơn/wrap">
            </div>

            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_cardetail_input">Mô tả chi tiết</label>
                        <kbd id="modal_cardetail_counter" class="mb-0 small">0/1000</kbd>
                    </div>
                </div>
                <textarea wrap="soft" class="form-control" id="modal_cardetail_input" rows="3" maxlength="1000" placeholder="Mô tả chi tiết xe"></textarea>
            </div>
        </form>
    `);

    var brandModelList = [];

    $.ajax({
        type: "GET",
        url: "/api/brands/fetch-model",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        success: function (response) {
            if(response.code == 1000) {
                brandModelList = response.data;
                $("#brand-select").empty();
                $("#brand-select").append(`<option disabled selected value=""> Chọn hãng xe </option>`);
                $.each(response.data, function (_idx, brand) { 
                    $("#brand-select").append(`<option value=${brand.id}> ${brand.brand} </option>`);
                });
            }
            else {
                Toast.fire({
                    icon: "warning",
                    title: "Lỗi lấy dữ liệu brand-model"
                });
                console.log(utils.getErrorMessage(response.code));
                $("#modal_id").modal("hide");
            }
        },
        error: function(xhr, _status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
            $("#modal_id").modal("hide");
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/plate-types",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        success: function (response) {
            if(response.code == 1000) {
                $("#plate-type-select").append(`<option disabled selected value=""> Chọn loại biển kiểm soát </option>`);
                $.each(response.data, function (idx, plateType) { 
                    $("#plate-type-select").append(`<option value=${plateType.id}> ${plateType.type} </option>`);
                });
            }
            else {
                Toast.fire({
                    icon: "warning",
                    title: "Lỗi lấy dữ liệu plate-type"
                });
                console.log(utils.getErrorMessage(response.code));
                $("#modal_id").modal("hide");
            }
        },
        error: function(xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
            $("#modal_id").modal("hide");
        }
    });

    $('.select2bs4').select2({
        allowClear: true,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true
    });

    $('#brand-select').on('change', function () {
        let id = $(this).val();
        
        const brand = brandModelList.find(item => item.id == id);

        if(brand) {
            $('#model-select').empty();
            $('#model-select').append(`<option disabled selected value=""> Chọn mẫu xe </option>`);
            $.each(brand.models, function (idx, val) { 
                $('#model-select').append(`<option value="${val.id}"> ${val.model} </option>`);
            });
        } else {
            console.log("Error in getting model");
        }
        
    });

    $("#modal_footer").append(
        '<button class="btn btn-primary" type="button" form="modal-form" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
    );
    
    utils.set_char_count("#modal_numplate_input", "#modal_numplate_counter");
    utils.set_char_count("#modal_color_input", "#modal_color_counter");
    utils.set_char_count("#modal_cardetail_input", "#modal_cardetail_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        if(!$('#modal-form')[0].checkValidity()){
            $('#modal-form')[0].reportValidity();
            return;
        }
        
        let numPlate = $("#modal_numplate_input").val().replace(/\s+/g, '');
        let plateType = $("#plate-type-select").val();
        let model = $("#model-select").val();
        let color = $("#modal_color_input").val().trim();
        let detail = $("#modal_cardetail_input").val().trim();
        
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
            success: function (response) {
                if(response.code == 1000){
                    Toast.fire({
                        icon: "success", 
                        title: "Thêm hồ sơ xe thành công"
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                }
                else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code)
                    })
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
                dataTable.ajax.reload();
            }
        });
    });
});

$("#user-mapping-btn").click(function () { 
    if ($(this).hasClass("btn-info")) {
        Toast.fire({
            icon: "info",
            title: "Chọn xe cần đăng ký",
        });
        $("#data-table tbody tr").css("cursor", "pointer");

        $(this).removeClass("btn-info").addClass("btn-danger").html(`
            <i class="fa-regular fa-circle-xmark mr-1"></i> Hủy
        `);

        // Lắng nghe sự kiện click item trong bảng #data-table
        $("#data-table tbody").on("click", "tr", function () {
            var rowData = $('#data-table').DataTable().row(this).data();
            var carId = rowData.id;
            var carPlate = rowData.numPlate;
            var carModel = rowData.model.model;

            $("#user-mapping-btn").removeClass("btn-danger").addClass("btn-info").html(`
                <i class="fa-solid fa-key mr-1"></i> Đăng ký sở hữu
            `);
            $("#data-table tbody tr").css("cursor", "default");
            $("#data-table tbody").off("click", "tr");
            
            $.ajax({
                type: "GET",
                url: "/api/users/is-active",
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: function() {
                    Swal.showLoading();
                },
                success: function (res) {
                    if (res.code != 1000) {
                        Toast.fire({
                            icon: "error",
                            title: "Không thể lấy danh sách hồ sơ",
                        });
                        return;
                    }
                    clear_modal();
                    $("#modal_title").text("Chọn hồ sơ");
                    $(".modal-dialog").addClass("modal-lg");
                    $("#modal_body").append(`
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Tìm hồ sơ</label>
                                    <div class="input-group">
                                        <input id="user-search-input" type="text" class="form-control form-control-sm" placeholder="Tìm kiếm hồ sơ">
                                        <div class="input-group-append">
                                            <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 d-flex">
                                <button id="user-select-btn" type="button" class="btn btn-sm btn-outline-info ml-auto mt-auto mb-3 px-3">Chọn</button>
                            </div>
                        </div>
                        <table id="user-table" class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th scope="col" style="text-align: center" width="4%">#</th>
                                    <th scope="col" style="text-align: center" min-width="20%">Họ tên</th>
                                    <th scope="col" style="text-align: center" min-width="35%">Thông tin</th>
                                    <th scope="col" style="text-align: center" width="20%">Danh sách xe</th>
                                    <th scope="col" style="text-align: center" width="15%">Vai trò</th>
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
                        select: true,
                        dom: 'lrtip', // (l: length, r: processing, t: table, i: information, p: pagination)
                        columnDefs: [
                            { orderable: false, targets: 3 },
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
                            { data: 'name',
                                render: function(data, type, row) {
                                    let html = `${data} `;
                                    if (row.gender == 0){
                                        html += `<span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span>`;
                                    }
                                    else if (row.gender == 0){
                                        html += `<span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span>`;
                                    }
                                    return html;
                                }
                            },
                            { data: 'phone', 
                                render: function(data, type, row){
                                    let html = "";
                                    if (data != "") {
                                        html += `<i>SĐT: </i>${data}<br>`;
                                    }
                                    if (row.address) {
                                        html += `<i>ĐC: </i>${row.address.address}`;
                                    }
                                    return `<small>${html}</small>`;
                                }
                            },
                            { data: 'cars', 
                                render: function(data, type, row){
                                    if (data != null && Array.isArray(data)) {
                                        let html = "";
                                        $.each(data , function (idx, val) {
                                            if(val.status == 1){
                                                html+=` <span class="badge badge-light">&nbsp;${val.numPlate}<br>${val.model.model}</span></br>`
                                            }
                                            else if (val.status == 0){
                                                html+=` <span class="badge badge-danger">&nbsp;${val.numPlate}<br>${va.model.model}</span></br>`
                                            }
                                        });
                
                                        
                                        return (
                                            '<center>' + html + '</center>'
                                        );
                                    }
                                    return "";
                                }
                            },
                            { data: 'roles', 
                                render: function(data, type, row){
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
                    });

                    $('#user-table tbody').on('click', 'tr', function() {
                        if ($(this).hasClass('selected')) {
                            $(this).removeClass('selected');
                        } else {
                            $('#user-table tbody tr').removeClass('selected');
                            $(this).addClass('selected');
                        }
                    });

                    $("#user-search-input").on("keyup", function () {
                        userTable.search(this.value.trim()).draw();
                    });
        
                    $("#user-select-btn").click(function (e) { 
                        var selectedRow = $('#user-table tbody tr.selected');
                        let userData = $('#user-table').DataTable().row(selectedRow).data();
                        
                        if (selectedRow.length > 0) {
                            Swal.fire({
                                title: `Xác nhận hồ sơ<br>${userData.name} quản lý xe<br>${carModel} ${carPlate}`,
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Xác nhận",
                                cancelButtonText: `Hủy`
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/users/car-mapping",
                                        headers: utils.defaultHeaders(),
                                        data: JSON.stringify({
                                            userId: userData.id,
                                            carId: carId
                                        }),
                                        success: function (response) {
                                            if(response.code == 1000 && response.data == true) {
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Cập nhật thành công"
                                                });
                                                $("#modal_id").modal("hide");
                                                dataTable.ajax.reload();
                                            }
                                            else {
                                                Toast.fire({
                                                    icon: "error",
                                                    title: response.message
                                                })
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr);
                                            Toast.fire({
                                                icon: "error",
                                                title: utils.getXHRInfo(xhr).message
                                            })
                                        }
                                    });
                                }
                            });
                        } else {
                            Toast.fire({
                                icon: "warning",
                                title: "Hãy chọn 1 hồ sơ"
                            })
                        }
                    });
        
                    $("#modal_id").modal("show");
                },
                error: function (xhr, status, error) {
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message,
                    });
                    $("#modal_id").modal("hide");
                },
                complete: function() {
                    Swal.close();
                }
            });
        });
    } else {
        $(this).removeClass("btn-danger").addClass("btn-info").html(`
            <i class="fa-solid fa-key mr-1"></i> Đăng ký sở hữu
        `);

        $("#data-table tbody tr").css("cursor", "default");
        $("#data-table tbody").off("click", "tr");
    }
});