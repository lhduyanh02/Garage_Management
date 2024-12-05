import * as utils from "/dist/js/utils.js";

utils.introspectPermission("EDIT_MODEL_LIST");

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

// Clear modal
function clear_modal() {
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

var dataTable;
var dataTableCard = $("#data-table-card");
var plateTypeTable;
var listBrand = [];

$(document).ready(function () {
    dataTable = $("#data-table").DataTable({
        responsive: true,
        lengthChange: true,
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
            { orderable: false, targets: 3 }, // Vô hiệu hóa sort cho cột Thao tác (index 3)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/brands/fetch-model",
            dataType: "json",
            headers: utils.defaultHeaders(),
            beforeSend: (xhr) => {
                const headers = utils.defaultHeaders(); // Lấy headers từ defaultHeaders()
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key]); // Thiết lập từng header
                }
            },
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (brandItem) {
                        brandItem.models.forEach(function (modelItem) {
                            data.push({
                                number: counter++, // Số thứ tự tự động tăng
                                brand: brandItem.brand, // Hãng xe
                                model: modelItem.model, // Mẫu xe
                                id: modelItem.id, // ID của model (dùng cho cột Thao tác)
                            });
                        });
                    });

                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: res.message || "Error in fetching data",
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        },
        columns: [
            { data: "number" },
            { data: "brand" },
            { data: "model" },
            {
                data: "id",
                render: function (data, type, row) {
                    return (
                        '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
                        data +
                        '"><i class="fas fa-pencil-alt"></i></a></center>'
                    );
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

    $.ajax({
        type: "GET",
        url: "/api/brands",
        headers: {
            "Content-Type": "application/json",
            Authorization: "",
        },
        success: function (res) {
            if (res.code == 1000) {
                listBrand = res.data;
            } else {
                Toast.fire({
                    icon: "error",
                    title: utils.getErrorMessage(res.code),
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

    setTimeout(() => {
        plateTypeTable = $("#plate-type-table").DataTable({
            responsive: true,
            lengthChange: true,
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
                { orderable: false, targets: 0 }, // Vô hiệu hóa sort cho cột Thao tác (index 3)
                { className: "text-center", targets: 0 },
            ],
            ajax: {
                type: "GET",
                url: "/api/plate-types/all",
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: (xhr) => {
                    const headers = utils.defaultHeaders();
                    for (const key in headers) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                },
                dataSrc: function (res) {
                    if (res.code == 1000) {
                        var data = [];
                        var counter = 1;
                        res.data.forEach(function (plateType) {
                            data.push({
                                number: counter++, 
                                type: plateType.type, 
                                carQuantity: plateType.carQuantity,
                                status: plateType.status,
                                id: plateType.id,
                            });
                        });

                        return data; // Trả về dữ liệu đã được xử lý
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: res.message || "Error in fetching data",
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message,
                    });
                },
            },
            columns: [
                { data: "number" },
                { data: "type" },
                { data: "carQuantity", class: "text-center" },
                {
                    data: "status",
                    render: function (data, type, row) {
                        if (data == 1) {
                            return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang sử dụng</span></center>';
                        } else if (data == 0) {
                            return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
                        }
                    },
                },
                {
                    data: "id",
                    render: function (data, type, row) {
                        let html = "";
                        if (row.status == 1) {
                            html = `<a class="btn btn-info btn-sm" id="editPlateTypeBtn" data-id="${data}"><i class="fas fa-pencil-alt"></i></a>
                                    <a class="btn btn-warning btn-sm" id="disablePlateTypeBtn" data-id="${data}"><i class="fa-regular fa-circle-xmark fa-lg"></i></a>`;
                        } else if (row.status == 0) {
                            html += `<a class="btn btn-success btn-sm" id="enablePlateTypeBtn" data-id="${data}"><i class="fa-regular fa-circle-check fa-lg"></i></a>`
                        };

                        return '<center>' + html + '</center>';
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
    }, 500);
});

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

$("#data-table").on("click", "#editBtn", async function () {
    let id = $(this).data("id");
    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/models/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
    } catch (e) {
        console.error(e);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(e).message,
        });
        return;
    }

    if (!res) {
        return;
    }

    if (res.code == 1000 && res.data) {
        clear_modal();
        $("#modal_title").text("Chỉnh sửa mẫu xe");

        $("#modal_body").append(`
      <div class="form-group">
          <label>Hãng xe</label>
          <div class="form-group">
              <select id="brand-select" class="form-control select2bs4" style="width: 100%;" data-placeholder="Chọn hãng xe">
              </select>
          </div>
      </div>
  
      <div class="form-group">
        <div class="container mt-3 mb-0">
          <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="mb-0" for="modal_model_name_input">Tên mẫu xe</label>
              <kbd id="char_count" class="mb-0 small">0/100</kbd>
          </div>
        </div>
        <input type="text" class="form-control" id="modal_model_name_input" maxlength="100" placeholder="Nhập tên mẫu xe">
        <p class="font-weight-light pt-3">Lưu ý: Tên mẫu xe tối đa 100 ký tự và không trùng với mẫu đã có.</p>
      </div>
    `);

        $.each(listBrand, function (idx, val) {
            if (val.id == res.data.brand.id)
                $("#brand-select").append(
                    `<option selected value="${val.id}">${val.brand}</option>`
                );
            else
                $("#brand-select").append(
                    `<option value="${val.id}">${val.brand}</option>`
                );
        });

        $("#modal_model_name_input").val(res.data.model);

        // Đếm số ký tự
        utils.set_char_count("#modal_model_name_input", "#char_count");

        $("#modal_footer").append(
            '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
        );
        $("#modal_id").modal("show");

        $("#brand-select").select2({
            allowClear: false,
            theme: "bootstrap",
            closeOnSelect: true,
            language: "vi",
        });

        $("#modal_submit_btn").click(function () {
            let brand = $("#brand-select").val();
            let model = $("#modal_model_name_input").val().trim();

            if (brand == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn hãng xe!",
                });
                return;
            } else if (model.length > 100) {
                Toast.fire({
                    icon: "warning",
                    title: "Tên mẫu xe không được dài hơn 100 ký tự!",
                });
                return;
            } else {
                $.ajax({
                    type: "PUT",
                    url: "/api/models/" + id,
                    headers: utils.defaultHeaders(),
                    contentType: "application/json",
                    data: JSON.stringify({
                        model: model,
                        brand: brand,
                    }),
                    success: function (response) {
                        if (response.code == 1000) {
                            let val = response.data;
                            Toast.fire({
                                icon: "success",
                                title:
                                    "Đã cập nhật mẫu xe<br>" +
                                    val.brand.brand +
                                    " " +
                                    val.model,
                            });
                            $("#modal_id").modal("hide");
                            // Tải lại bảng chức năng
                            dataTable.ajax.reload();
                        } else {
                            Toast.fire({
                                icon: "error",
                                title:
                                    "Đã xảy ra lỗi, chi tiết:<br>" +
                                    response.message,
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr);
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message,
                        });
                        dataTable.ajax.reload();
                    },
                });
            }
        });
    } else {
        Toast.fire({
            icon: "error",
            title: utils.getErrorMessage(res.code),
        });
        return;
    }
});

$("#newBrand_btn").on("click", function () {
    clear_modal();

    $("#modal_title").text("Thêm mới hãng xe");

    $("#modal_body").append(`
    <div class="form-group">
    <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_brand_name_input">Tên hãng xe</label>
            <kbd id="char_count" class="mb-0 small">0/50</kbd>
        </div>
      <input type="text" class="form-control" id="modal_brand_name_input" maxlength="50" placeholder="Nhập tên hãng xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên hãng tối đa 50 ký tự và không trùng với hãng đã có.</p>
    </div>
    
    `);

    // Đếm số ký tự
    var $input = $("#modal_brand_name_input");
    var $charCount = $("#char_count");
    var maxChars = 50;
    $input.on("input", function () {
        var currentLength = $input.val().length;
        $charCount.text(currentLength + "/" + maxChars);
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );
    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {
        let ten = $("#modal_brand_name_input").val();

        if (ten == null || ten.trim() == "") {
            Toast.fire({
                icon: "error",
                title: "Vui lòng điền tên hãng!",
            });
            return;
        } else if (ten.length > 50) {
            Toast.fire({
                icon: "error",
                title: "Tên hãng không được dài hơn 50 ký tự!",
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/brands",
                contentType: "application/json",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    brand: ten,
                }),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm hãng<br>" + ten,
                        });
                        $("#modal_id").modal("hide");
                        return;
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                    // Tải lại bảng chức năng
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

$("#newModel_btn").on("click", function () {
    clear_modal();

    $("#modal_title").text("Thêm mới mẫu xe");

    $("#modal_body").append(`
    <div class="form-group">
        <label>Hãng xe</label>
        <div class="form-group">
            <select id="brand-select" class="form-control select2bs4" style="width: 100%;">
              <option selected disabled> Chọn hãng xe </option>
            </select>
        </div>
    </div>

    <div class="form-group">
      <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_model_name_input">Tên mẫu xe</label>
            <kbd id="char_count" class="mb-0 small">0/100</kbd>
        </div>
      </div>
      <input type="text" class="form-control" id="modal_model_name_input" maxlength="100" placeholder="Nhập tên mẫu xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên mẫu xe tối đa 100 ký tự và không trùng với mẫu đã có.</p>
    </div>
  `);

    // Đếm số ký tự
    var $input = $("#modal_model_name_input");
    var $charCount = $("#char_count");
    var maxChars = 100;
    $input.on("input", function () {
        var currentLength = $input.val().length;
        $charCount.text(currentLength + "/" + maxChars);
    });

    $.ajax({
        type: "GET",
        url: "/api/brands",
        headers: {
            "Content-Type": "application/json",
            Authorization: "",
        },
        success: function (res) {
            if (res.code == 1000) {
                $.each(res.data, function (id, val) {
                    $("#brand-select").append(
                        '<option value="' +
                            val.id +
                            '">' +
                            val.brand +
                            "</option>"
                    );
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
            });
        },
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );
    $("#modal_id").modal("show");

    $("#brand-select").select2({
        placeholder: "Chọn hãng xe",
        allowClear: true,
        // dropdownParent: $('#modal_body'),
        theme: "bootstrap",
        // tokenSeparators: [",", " "],
        closeOnSelect: true,
        language: "vi",
    });

    $("#modal_submit_btn").click(function () {
        let brand = $("#brand-select").val();
        let model = $("#modal_model_name_input").val().trim();

        if (brand == null) {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn hãng xe!",
            });
            return;
        } else if (model.length > 100) {
            Toast.fire({
                icon: "warning",
                title: "Tên mẫu xe không được dài hơn 100 ký tự!",
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/models",
                headers: utils.defaultHeaders(),
                contentType: "application/json",
                data: JSON.stringify({
                    model: model,
                    brand: brand,
                }),
                success: function (res) {
                    if (res.code == 1000) {
                        let val = res.data;
                        Toast.fire({
                            icon: "success",
                            title:
                                "Đã thêm mẫu xe<br>" +
                                val.brand.brand +
                                " " +
                                val.model,
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                    // Tải lại bảng chức năng
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
            $("#modal_id").modal("hide");
        }
    });
});

$("#editBrand_btn").click(function () {
    clear_modal();
    $("#modal_title").text("Sửa tên hãng");
    $("#modal_body").append(`
    <div class="form-group">
        <label>Hãng xe</label>
        <div class="form-group">
            <select id="brand-select" class="form-control select2bs4" style="width: 100%;">
              <option selected disabled> Chọn hãng xe </option>
            </select>
        </div>
    </div>

    <div class="form-group">
       <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_brand_name_input">Tên hãng xe</label>
            <kbd id="char_count" class="mb-0 small">0/50</kbd>
        </div>
    </div>
      <input type="text" class="form-control" id="modal_brand_name_input" maxlength="50" placeholder="Cập nhật tên hãng xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên hãng tối đa 50 ký tự và không trùng với hãng đã có.</p>
    </div>
  `);

    // Đếm số ký tự
    var $input = $("#modal_brand_name_input");
    var $charCount = $("#char_count");
    var maxChars = 50;
    $input.on("input", function () {
        var currentLength = $input.val().length;
        $charCount.text(currentLength + "/" + maxChars);
    });

    $.ajax({
        type: "GET",
        url: "/api/brands",
        headers: {
            "Content-Type": "application/json",
            Authorization: "",
        },
        success: function (res) {
            if (res.code == 1000) {
                $.each(res.data, function (id, val) {
                    $("#brand-select").append(
                        '<option value="' +
                            val.id +
                            '">' +
                            val.brand +
                            "</option>"
                    );
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
            });
        },
    });

    $("#brand-select").on("change", function () {
        let brand = $("#brand-select").val();
        let oldBrandName = $("#brand-select option:selected").text();

        $("#modal_brand_name_input").attr("value", oldBrandName);
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );
    $("#modal_id").modal("show");

    $("#brand-select").select2({
        placeholder: "Chọn hãng xe",
        allowClear: true,
        // dropdownParent: $('#modal_body'),
        theme: "bootstrap",
        // tokenSeparators: [",", " "],
        closeOnSelect: true,
        language: "vi",
    });

    $("#modal_submit_btn").click(function () {
        let id = $("#brand-select").val();
        let brand = $("#modal_brand_name_input").val().trim();

        if (id == null) {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn hãng xe!",
            });
            return;
        } else if (brand.length > 50) {
            Toast.fire({
                icon: "warning",
                title: "Tên hãng xe không được dài hơn 50 ký tự!",
            });
            return;
        } else {
            $.ajax({
                type: "PUT",
                url: "/api/brands?id=" + id,
                contentType: "application/json",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    brand: brand,
                }),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã cập nhật hãng <br>" + res.data.brand,
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                    // Tải lại bảng chức năng
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
            $("#modal_id").modal("hide");
        }
    });
});



$("#plate-type-table").on("click", "#editPlateTypeBtn", async function () {
    let id = $(this).data("id");
    
    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/plate-types/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            Swal.close();
            if (res.code != 1000) {
                Swal.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu",
                    showCancelButton: false,
                    timer: 3000,
                });
                return;
            }
            Swal.fire({
                title: `Chỉnh sửa loại biển số<br>${res.data.type}`,
                input: "text",
                inputAttributes: {
                    autocapitalize: "off",
                },
                inputValue: res.data.type,
                showCancelButton: true,
                cancelButtonText: "Hủy",
                confirmButtonText: "Lưu",
                showLoaderOnConfirm: true,
                preConfirm: async (value) => {
                    try {
                        let response = await $.ajax({
                            type: "PUT",
                            url: "/api/plate-types/"+id,
                            headers: utils.defaultHeaders(),
                            data: JSON.stringify({
                                type: value,
                                status: res.data.status
                            }),
                            dataType: "json"
                        });

                        if (response.code != 1000) {
                            console.warn(response);
                            console.log(response.responseJSON.code);
                            
                            Swal.showValidationMessage(`Lỗi trả về: ${utils.getErrorMessage(response.code)}`);
                            return false;
                        }

                        return response.data;
                    } catch (error) {
                        console.error(error);
                        Swal.showValidationMessage(`
                            Lỗi: ${utils.getXHRInfo(error).message}
                        `);
                    }
                },
                allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: "success",
                        title: `Cập nhật thành công`,
                        html: `Đã cập nhật loại biển số<br><b>${res.data.type}</b>`,
                        showConfirmButton: true,
                        confirmButtonText: "OK"
                    });
                    plateTypeTable.ajax.reload();
                }
            });
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
            });
        },
    });
});


$("#new-plate-type-btn").click(async function () {
    let response;

    Swal.fire({
        title: `Thêm loại biển số mới`,
        input: "text",
        inputAttributes: {
            autocapitalize: "off",
        },
        showCancelButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Thêm",
        showLoaderOnConfirm: true,
        preConfirm: async (value) => {
            try {
                response = await $.ajax({
                    type: "POST",
                    url: "/api/plate-types",
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        type: value,
                        status: 1
                    }),
                    dataType: "json"
                });

                if (response.code != 1000) {
                    console.warn(response);
                    console.log(response.responseJSON.code);
                    
                    Swal.showValidationMessage(`Lỗi: ${utils.getErrorMessage(response.code)}`);
                    return false;
                }

                return response.data;
            } catch (error) {
                console.error(error);
                Swal.showValidationMessage(`
                    Lỗi: ${utils.getXHRInfo(error).message}
                `);
            }
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: `Đã thêm`,
                html: `Đã thêm loại biển số<br><b>${response.data.type}</b>`,
                showConfirmButton: true,
                confirmButtonText: "OK"
            });
            plateTypeTable.ajax.reload();
        }
    });

});


$("#plate-type-table").on("click", "#enablePlateTypeBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#plate-type-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.type;

    Swal.fire({
        title: `Sử dụng loại biển số</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/plate-types/enable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã sử dụng loại biển số</br>" + name,
                        });
                        plateTypeTable.ajax.reload();
                    }
                },
                error: function (xhr, status, error) {
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message,
                    });
                },
            });
        }
    });
});


$("#plate-type-table").on("click", "#disablePlateTypeBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#plate-type-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.type;

    Swal.fire({
        icon: "warning",
        title: `Ngừng sử dụng loại biển số</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/plate-types/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ngừng sử dụng loại biển số</br>" + name,
                        });
                        plateTypeTable.ajax.reload();
                    }
                },
                error: function (xhr, status, error) {
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message,
                    });
                },
            });
        }
    });
});