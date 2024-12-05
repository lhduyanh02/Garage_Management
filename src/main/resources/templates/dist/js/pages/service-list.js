import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_SERVICES');

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

var dataTable;
var dataTableCard = $("#data-table-card");

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
            { orderable: false, targets: 4 }, // Vô hiệu hóa sort cho cột Thao tác (index 4)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/services/all-with-price",
            dataType: "json",
            headers: utils.defaultHeaders(),
            beforeSend: xhr => {
                const headers = utils.defaultHeaders(); // Lấy headers từ defaultHeaders()
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key]); // Thiết lập từng header
                }
            },
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (service) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: service.id,
                            name: service.name,
                            description: service.description,
                            status: service.status,
                            optionPrices: service.optionPrices,
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
                data: "name",
                render: function (data, type, row) {
                    let html = "";
                    html += `<b>${data}<br></b>`;
                    if (row.description != "") {
                        console.log(row.description);
                        
                        html += `<i><u>Mô tả:<br></u></i> <div">${row.description.replace(/\n/g, "<br>")}<br></div>`;
                    }

                    return html;
                },
            },
            {
                data: "optionPrices",
                render: function (data, type, row) {
                    if (data.length == 0) {
                        return "<i>Chưa có tùy chọn nào</i>";
                    } else {
                        let html = "";
                        $.each(data, function (idx, val) {
                            if (val.status == 1) {
                                html += `
                                <details>
                                    <summary><b>${
                                        val.name
                                    } <span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang áp dụng</span></b></summary>
                                    <p>
                                        - Giá: ${val.price.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}<br>
                                    </p>
                                </details>
                                `;
                            } else {
                                html += `
                                        <b>${val.name} <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng áp dụng</span><br></b>
                                        - Giá: ${val.price}<br><br>
                                `;
                            }
                        });

                        return html;
                    }
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang sử dụng</span></center>';
                    } else if (data == 0) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-secondary"><i class="fa-solid fa-xmark"></i>&nbsp;Đã xóa</span></center>';
                    }
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
                    } else if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-check fa-lg"></i></a> 
                            <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    }
                    if (row.status == -1) {
                        html = `<a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
                            <i class="fa-solid fa-recycle fa-lg"></i></a>`;
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
            $("#data-table tbody").on(
                "dblclick",
                "td:nth-child(3)",
                function () {
                    var row = $(this).closest("tr");

                    // Tìm tất cả các thẻ <details> trong hàng đó và chuyển đổi trạng thái mở/đóng
                    row.find("details").each(function () {
                        if ($(this).attr("open")) {
                            $(this).removeAttr("open");
                        } else {
                            $(this).attr("open", true);
                        }
                    });
                }
            );
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
        url: "/api/services/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu dịch vụ",
                });
                return;
            }
            var data = res.data;
            clear_modal();
            $("#modal_title").text("Cập nhật dịch vụ");
            $(".modal-dialog").addClass("modal-lg");
            $("#modal_body").append(`
                <form id="modal-form">
                    <div class="form-group">
                        <div class="container mt-3 mb-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="mb-0" for="modal_name_input">Tên dịch vụ</label>
                                <kbd id="modal_name_counter" class="mb-0 small">0/256</kbd>
                            </div>
                        </div>
                        <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên dịch vụ">
                    </div>

                    <div class="form-group">
                        <div class="container mt-3 mb-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="mb-0" for="modal_description_input">Mô tả chi tiết</label>
                                <kbd id="modal_description_counter" class="mb-0 small">0/65000</kbd>
                            </div>
                        </div>
                        <textarea wrap="soft" 
                            class="form-control" 
                            id="modal_description_input" 
                            rows="3" maxlength="65000" 
                            placeholder="Mô tả chi tiết"></textarea>
                    </div>

                    <div class="input_wrap form-group">
                        <label class="mb-0">Danh sách tùy chọn</label>
                        <div id="option-wrapper">
                            <!--<div class="row my-2">
                                <div class="col-md-7">
                                    <select class="form-control select2bs4 option-select" width="100%" data-placeholder="Chọn một option">
                                    </select>
                                </div>

                                <div class="input-group col-md-5">
                                    <input type="text" name="text[]" class="form-control option-price-input" placeholder="Giá">
                                    <div class="input-group-append option-price-input">
                                        <span class="input-group-text">VND</span>
                                    </div>
                                </div>
                            </div>--!>
                        </div>

                        <button type="button" id="add-option-btn" class="btn btn-sm btn-secondary mt-2">Thêm tùy chọn</button>
                    </div>

                    <div class="form-group">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="is-enable-switch" checked>
                            <label class="custom-control-label" for="is-enable-switch">Sử dụng</label>
                        </div>
                    </div>
                </form>
            `);

            $(".select2bs4").select2({
                allowClear: true,
                theme: "bootstrap",
                closeOnSelect: true,
                width: "100%",
                language: "vi",
            });

            $("#modal_name_input").val(data.name);
            $("#modal_description_input").text(data.description);
            $("#is-enable-switch").prop(
                "checked",
                data.status == 1 ? true : false
            );

            utils.set_char_count("#modal_name_input", "#modal_name_counter");
            utils.set_char_count(
                "#modal_description_input",
                "#modal_description_counter"
            );

            var optionList = [];

            $.ajax({
                type: "GET",
                url: "/api/options",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "",
                },
                success: function (response) {
                    if (response.code == 1000) {
                        optionList = [];
                        $.each(response.data, function (idx, val) {
                            optionList.push({
                                id: val.id,
                                text: val.name,
                                isSelected: 0,
                            });
                        });
                        updateIsSelected(optionList);

                        $("#option-wrapper").empty();

                        data.optionPrices.forEach(function (optionPrice) {
                            if (optionPrice.status != 1) {
                                return;
                            }
                            $("#option-wrapper").append(`
                                <div class="row my-2">
                                    <div class="col-md-7">
                                        <select class="form-control select2bs4 option-select option-price-input" required width="100%" data-placeholder="Chọn một option">
                                        </select>
                                    </div>

                                    <div class="input-group col-md-5">
                                        <input type="text" name="text[]" value="${formatCurrent(
                                            optionPrice.price.toString()
                                        )}" required class="form-control option-price-input price-input" placeholder="Giá">
                                        <div class="input-group-append option-price-input">
                                            <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                                                <i class="fa-regular fa-circle-xmark fa-lg"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `);

                            // Initialize select2
                            $(".select2bs4").select2({
                                allowClear: true,
                                theme: "bootstrap",
                                closeOnSelect: true,
                                width: "100%",
                                language: "vi",
                            });

                            var newSelect = $("#option-wrapper")
                                .find(".option-select")
                                .last();

                            optionList.forEach(function (option) {
                                if (option.id == optionPrice.id) {
                                    newSelect.append(
                                        `<option value="${option.id}" selected>${option.text}</option>`
                                    );
                                } else if (option.isSelected == 0) {
                                    newSelect.append(
                                        `<option value="${option.id}">${option.text}</option>`
                                    );
                                } else {
                                    newSelect.append(
                                        `<option disabled value="${option.id}">${option.text}</option>`
                                    );
                                }
                            });

                            newSelect.trigger("change");

                            updateOptions();
                            updateIsSelected(optionList);
                        });

                        $(".price-input").on("input", function () {
                            let inputValue = $(this).val();

                            let formattedValue = formatCurrent(inputValue);

                            $(this).val(formattedValue);
                        });

                        $(document).on("change", ".option-select", function () {
                            updateOptions();
                            updateIsSelected(optionList);
                        });
                    } else {
                        console.error(response);
                        Swal.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi",
                            text: utils.getErrorMessage(response.code)
                        });
                        return;
                    }
                },
            });

            $("#add-option-btn").click(function (e) {
                e.preventDefault();
                updateIsSelected(optionList);

                $("#option-wrapper").append(`
                    <div class="row my-2">
                        <div class="col-md-7">
                            <select class="form-control select2bs4 option-select option-price-input" required width="100%" data-placeholder="Chọn một option">
                            </select>
                        </div>
        
                        <div class="input-group col-md-5">
                            <input type="text" name="text[]" required class="form-control option-price-input price-input" placeholder="Giá">
                            <div class="input-group-append option-price-input">
                                <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                                    <i class="fa-regular fa-circle-xmark fa-lg"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `);

                $(".select2bs4").select2({
                    allowClear: true,
                    theme: "bootstrap",
                    closeOnSelect: true,
                    width: "100%",
                    language: "vi",
                });

                // Thêm các option vào select mới và lọc các tùy chọn đã chọn
                var newSelect = $("#option-wrapper")
                    .find(".option-select")
                    .last();
                optionList.forEach(function (option) {
                    if (option.isSelected == 0) {
                        newSelect.append(
                            `<option value="${option.id}">${option.text}</option>`
                        );
                    } else {
                        newSelect.append(
                            `<option disable value="${option.id}">${option.text}</option>`
                        );
                    }
                });

                $(document).on("input", ".price-input", function () {
                    let inputValue = $(this).val();

                    let formattedValue = formatCurrent(inputValue);

                    $(this).val(formattedValue);
                });

                newSelect.val("").trigger("change");
                updateIsSelected(optionList);
                updateOptions();

                // Xử lý sự kiện thay đổi cho các select
                $(document).on("change", ".option-select", function () {
                    updateOptions();
                    updateIsSelected(optionList);
                });
            });

            $(document).off('click', '#remove-option-btn');
            $(document).on("click", "#remove-option-btn", function (e) {
                var totalRows = $("#option-wrapper .row").length;

                if (totalRows == 1) {
                    Toast.fire({
                        icon: "warning",
                        title: "Không thể xóa! Phải có ít nhất một lựa chọn",
                    });
                    return;
                } else {
                    $(this).closest(".row").remove();

                    updateOptions();
                    updateIsSelected(optionList);
                }
            });

            $("#modal_footer").append(
                '<button type="button" form="modal-form" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
            );

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function () {
                if (!$("#modal-form")[0].checkValidity()) {
                    $("#modal-form")[0].reportValidity();
                    return;
                }

                let name = $("#modal_name_input").val().trim();
                let description = $("#modal_description_input").val().trim();
                let isApply = $("#is-enable-switch").is(":checked") ? 1 : 0;

                if (name == "") {
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng điền tên dịch vụ",
                    });
                    return;
                }

                var optionPrices = [];
                var hasError = false; // Biến cờ để theo dõi lỗi

                // Duyệt qua từng phần tử trong #option-wrapper
                $("#option-wrapper .row").each(function () {
                    var selectedOption = $(this).find(".option-select").val();
                    var priceValue = $(this)
                        .find('input[name="text[]"]')
                        .val()
                        .trim()
                        .replace(/\s+/g, "");

                    if (selectedOption == null) {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng chọn option",
                        });
                        hasError = true; // Đặt cờ lỗi
                        return;
                    }
                    if (priceValue === "") {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng điền giá cho option",
                        });
                        hasError = true; // Đặt cờ lỗi
                        return;
                    }

                    var isValidNumber = /^\d+(\.\d+)?$/.test(priceValue);

                    if (!isValidNumber) {
                        Toast.fire({
                            icon: "warning",
                            title: "Giá hợp lệ chứa số 0-9 và dấu chấm thập phân",
                        });
                        hasError = true; // Đặt cờ lỗi
                        return;
                    }

                    // Kiểm tra giá trị nhập vào có phải là số hay không (double)
                    var priceAsNumber = parseFloat(priceValue);

                    if (isNaN(priceAsNumber) || priceAsNumber < 0) {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng nhập giá hợp lệ (không âm)",
                        });
                        hasError = true; // Đặt cờ lỗi
                        return;
                    }

                    // Thêm cặp giá trị vào mảng
                    optionPrices.push({
                        option: selectedOption,
                        price: priceValue,
                    });
                });

                if (hasError) {
                    return;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/services/" + id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        name: name,
                        description: description,
                        status: isApply,
                        listOptionPrices: optionPrices.map(function (item) {
                            return {
                                optionId: item.option,
                                price: item.price,
                            };
                        }),
                    }),
                    success: function (response) {
                        if (response.code == 1000) {
                            Toast.fire({
                                icon: "success",
                                title: `Cập nhật thành công dịch vụ<br>${name}`,
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        } else if (response.code == 1044) {
                            // Tham chiếu từ ErrorCode
                            Swal.fire({
                                title: `Tên dịch vụ đã tồn tại, xác nhận trùng lặp tên cho<br>${name}?`,
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/services/confirm/" + id,
                                        headers: utils.defaultHeaders(),
                                        data: JSON.stringify({
                                            name: name,
                                            description: description,
                                            status: isApply,
                                            listOptionPrices: optionPrices.map(
                                                function (item) {
                                                    return {
                                                        optionId: item.option,
                                                        price: item.price,
                                                    };
                                                }
                                            ),
                                        }),
                                        success: function (res) {
                                            if (res.code == 1000) {
                                                Toast.fire({
                                                    icon: "success",
                                                    title: `Cập nhật thành công dịch vụ<br>${name}`,
                                                });
                                            }
                                            $("#modal_id").modal("hide");
                                            dataTable.ajax.reload();
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
                        } else {
                            Toast.fire({
                                icon: "warning",
                                title: utils.getErrorMessage(response.code),
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
            });
        },
        error: function (xhr, status, error) {
            let response = utils.getXHRInfo(xhr);
            Toast.fire({
                icon: "error",
                title: response.message,
            });
            $("#modal_id").modal("hide");
        },
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
    let name = rowData.name;

    Swal.fire({
        title: `Xóa dịch vụ</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/services/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${name}`,
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
});

$("#data-table").on("click", "#disableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Ngưng sử dụng dịch vụ</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/services/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ngưng sử dụng</br>" + name,
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function (xhr, status, error) {
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message,
                    });
                    dataTable.ajax.reload();
                },
            });
        }
    });
});

$("#data-table").on("click", "#enableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Áp dụng dịch vụ</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/services/enable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã áp dụng dịch vụ</br>" + name,
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function (xhr, status, error) {
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message,
                    });
                    dataTable.ajax.reload();
                },
            });
        }
    });
});

$("#new-service-btn").click(function () {
    clear_modal();
    $("#modal_title").text("Thêm dịch vụ");
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_body").append(`
        <form id="modal-form">
            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_name_input">Tên dịch vụ</label>
                        <kbd id="modal_name_counter" class="mb-0 small">0/256</kbd>
                    </div>
                </div>
                <input type="text" class="form-control" required id="modal_name_input" maxlength="255" placeholder="Nhập tên dịch vụ">
            </div>

            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_description_input">Mô tả chi tiết</label>
                        <kbd id="modal_description_counter" class="mb-0 small">0/65000</kbd>
                    </div>
                </div>
                <textarea wrap="soft" 
                    class="form-control" 
                    id="modal_description_input" 
                    rows="3" maxlength="65000" 
                    placeholder="Mô tả chi tiết"></textarea>
            </div>

            <div class="input_wrap form-group">
                <label class="mb-0">Danh sách tùy chọn</label>
                <div id="option-wrapper">
                    <div class="row my-2">
                        <div class="col-md-7">
                            <select class="form-control select2bs4 option-select" width="100%" data-placeholder="Chọn một option">
                            </select>
                        </div>

                        <div class="input-group col-md-5">
                            <input type="text" name="text[]" required class="form-control option-price-input price-input" placeholder="Giá">
                            <div class="input-group-append option-price-input">
                                <span class="input-group-text">VND</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" id="add-option-btn" class="btn btn-sm btn-secondary mt-2">Thêm tùy chọn</button>
            </div>

            <div class="form-group">
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="is-enable-switch" checked>
                    <label class="custom-control-label" for="is-enable-switch">Sử dụng</label>
                </div>
            </div>
        </form>
    `);

    $(".select2bs4").select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        width: "100%",
        language: "vi",
    });

    $(".price-input").on("input", function () {
        let inputValue = $(this).val();

        let formattedValue = formatCurrent(inputValue);

        $(this).val(formattedValue);
    });

    utils.set_char_count("#modal_name_input", "#modal_name_counter");
    utils.set_char_count(
        "#modal_description_input",
        "#modal_description_counter"
    );

    var optionList = [];

    $.ajax({
        type: "GET",
        url: "/api/options",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            Authorization: "",
        },
        success: function (response) {
            if (response.code == 1000) {
                optionList = [];
                $.each(response.data, function (idx, val) {
                    optionList.push({
                        id: val.id,
                        text: val.name,
                        isSelected: 0,
                    });
                    $(".option-select").append(
                        `<option value="${val.id}">${val.name}</option>`
                    );
                });
                updateIsSelected(optionList);
            }
        },
    });

    $("#add-option-btn").click(function (e) {
        e.preventDefault();
        updateIsSelected(optionList);

        $("#option-wrapper").append(`
            <div class="row my-2">
                <div class="col-md-7">
                    <select class="form-control select2bs4 option-select option-price-input" required width="100%" data-placeholder="Chọn một option">
                    </select>
                </div>

                <div class="input-group col-md-5">
                    <input type="text" name="text[]" required class="form-control option-price-input price-input" placeholder="Giá">
                    <div class="input-group-append option-price-input">
                        <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>
            `);

        $(".select2bs4").select2({
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            width: "100%",
            language: "vi",
        });

        $(".price-input").on("input", function () {
            let inputValue = $(this).val();

            let formattedValue = formatCurrent(inputValue);

            $(this).val(formattedValue);
        });

        // Thêm các option vào select mới và lọc các tùy chọn đã chọn
        var newSelect = $("#option-wrapper").find(".option-select").last();
        optionList.forEach(function (option) {
            if (option.isSelected == 0) {
                newSelect.append(
                    `<option value="${option.id}">${option.text}</option>`
                );
            } else {
                newSelect.append(
                    `<option disable value="${option.id}">${option.text}</option>`
                );
            }
        });
        newSelect.val("").trigger("change");
        updateIsSelected(optionList);
        updateOptions();

        // Xử lý sự kiện nhấn nút xóa bộ chọn option
        $(document).on("click", "#remove-option-btn", function () {
            $(this).closest(".row").remove();
            // Cập nhật lại các tùy chọn sau khi xóa
            updateOptions();
            updateIsSelected(optionList);
        });

        // Xử lý sự kiện thay đổi cho các select
        $(document).on("change", ".option-select", function () {
            updateOptions();
            updateIsSelected(optionList);
        });
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" form="modal-form" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
    );

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {
        if (!$("#modal-form")[0].checkValidity()) {
            $("#modal-form")[0].reportValidity();
            return;
        }

        let name = $("#modal_name_input").val().trim();
        let description = $("#modal_description_input").val().trim();
        let isApply = $("#is-enable-switch").is(":checked") ? 1 : 0;

        if (name == "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền tên dịch vụ",
            });
            return;
        }

        var optionPrices = [];
        var hasError = false; // Biến cờ để theo dõi lỗi

        // Duyệt qua từng phần tử trong #option-wrapper
        $("#option-wrapper .row").each(function () {
            var selectedOption = $(this).find(".option-select").val();

            var priceValue = $(this)
                .find('input[name="text[]"]')
                .val()
                .trim()
                .replace(/\s+/g, "");

            if (selectedOption == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn option",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            if (priceValue === "") {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng điền giá cho option",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            var isValidNumber = /^\d+$/.test(priceValue);

            if (!isValidNumber) {
                Toast.fire({
                    icon: "warning",
                    title: "Giá chỉ được chứa các số từ 0-9",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            // Kiểm tra giá trị nhập vào có phải là số hay không (double)
            var priceAsNumber = parseFloat(priceValue);

            if (isNaN(priceAsNumber) || priceAsNumber < 0) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng nhập giá hợp lệ (không âm)",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }

            // Thêm cặp giá trị vào mảng
            optionPrices.push({
                option: selectedOption,
                price: priceValue,
            });
        });

        if (hasError) {
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/services",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                name: name,
                description: description,
                status: isApply,
                listOptionPrices: optionPrices.map(function (item) {
                    return {
                        optionId: item.option,
                        price: item.price,
                    };
                }),
            }),
            success: function (response) {
                if (response.code == 1000) {
                    Toast.fire({
                        icon: "success",
                        title: `Thêm thành công dịch vụ<br>${name}`,
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else if (response.code == 1044) {
                    // Tham chiếu từ ErrorCode
                    Swal.fire({
                        icon: "warning",
                        title: "Trùng lặp tên dịch vụ",
                        html: `Tên dịch vụ đã tồn tại, vẫn thêm mới dịch vụ <b>${name}</b>?`,
                        showDenyButton: false,
                        showCancelButton: true,
                        confirmButtonText: "Đồng ý",
                        cancelButtonText: "Huỷ",
                    }).then((result) => {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {
                            $.ajax({
                                type: "POST",
                                url: "/api/services/confirm",
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    name: name,
                                    description: description,
                                    status: isApply,
                                    listOptionPrices: optionPrices.map(
                                        function (item) {
                                            return {
                                                optionId: item.option,
                                                price: item.price,
                                            };
                                        }
                                    ),
                                }),
                                success: function (res) {
                                    if (res.code == 1000) {
                                        Toast.fire({
                                            icon: "success",
                                            title: `Thêm thành công dịch vụ<br>${name}`,
                                        });
                                    }
                                    $("#modal_id").modal("hide");
                                    dataTable.ajax.reload();
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
                } else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code),
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
    });
});

$("#copy-service-btn").click(function () {
    if ($(this).hasClass("btn-info")) {
        Toast.fire({
            icon: "info",
            title: "Vui lòng chọn dịch vụ cần nhân bản",
        });
        $("#data-table tbody tr").css("cursor", "pointer");

        $(this).removeClass("btn-info").addClass("btn-danger").html(`
            <i class="fa-regular fa-circle-xmark mr-1"></i> Hủy
        `);

        // Lắng nghe sự kiện click item trong bảng #data-table
        $("#data-table tbody").on("click", "tr", function () {
            if ($(this).find("td").hasClass("dataTables_empty")) return;
            var rowData = $("#data-table").DataTable().row(this).data();
            var id = rowData.id;

            $("#copy-service-btn")
                .removeClass("btn-danger")
                .addClass("btn-info").html(`
                <i class="fa-regular fa-clone mr-1"></i> Copy dịch vụ
            `);
            $("#data-table tbody tr").css("cursor", "default");
            $("#data-table tbody").off("click", "tr");

            $.ajax({
                type: "GET",
                url: "/api/services/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code != 1000) {
                        Toast.fire({
                            icon: "error",
                            title: "Không thể lấy dữ liệu dịch vụ",
                        });
                        return;
                    }
                    var data = res.data;
                    clear_modal();
                    $("#modal_title").text("Thêm dịch vụ");
                    $(".modal-dialog").addClass("modal-lg");
                    $("#modal_body").append(`
                        <form id="modal-form">
                            <div class="form-group">
                                <div class="container mt-3 mb-0">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label class="mb-0" for="modal_name_input">Tên dịch vụ</label>
                                        <kbd id="modal_name_counter" class="mb-0 small">0/256</kbd>
                                    </div>
                                </div>
                                <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên dịch vụ">
                            </div>
        
                            <div class="form-group">
                                <div class="container mt-3 mb-0">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label class="mb-0" for="modal_description_input">Mô tả chi tiết</label>
                                        <kbd id="modal_description_counter" class="mb-0 small">0/65000</kbd>
                                    </div>
                                </div>
                                <textarea wrap="soft" 
                                    class="form-control" 
                                    id="modal_description_input" 
                                    rows="3" maxlength="65000" 
                                    placeholder="Mô tả chi tiết"></textarea>
                            </div>
        
                            <div class="input_wrap form-group">
                                <label class="mb-0">Danh sách tùy chọn</label>
                                <div id="option-wrapper">
                                    <!--<div class="row my-2">
                                        <div class="col-md-7">
                                            <select class="form-control select2bs4 option-select" width="100%" data-placeholder="Chọn một option">
                                            </select>
                                        </div>
        
                                        <div class="input-group col-md-5">
                                            <input type="text" name="text[]" class="form-control option-price-input" placeholder="Giá">
                                            <div class="input-group-append option-price-input">
                                                <span class="input-group-text">VND</span>
                                            </div>
                                        </div>
                                    </div>--!>
                                </div>
        
                                <button type="button" id="add-option-btn" class="btn btn-sm btn-secondary mt-2">Thêm tùy chọn</button>
                            </div>
        
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="is-enable-switch" checked>
                                    <label class="custom-control-label" for="is-enable-switch">Sử dụng</label>
                                </div>
                            </div>
                        </form>
                    `);

                    $(".select2bs4").select2({
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                        width: "100%",
                        language: "vi",
                    });

                    $("#modal_name_input").val(data.name + " copy");
                    $("#modal_description_input").text(data.description);
                    $("#is-enable-switch").prop(
                        "checked",
                        data.status == 1 ? true : false
                    );

                    utils.set_char_count(
                        "#modal_name_input",
                        "#modal_name_counter"
                    );
                    utils.set_char_count(
                        "#modal_description_input",
                        "#modal_description_counter"
                    );

                    var optionList = [];

                    $.ajax({
                        type: "GET",
                        url: "/api/options",
                        dataType: "json",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "",
                        },
                        success: function (response) {
                            if (response.code == 1000) {
                                optionList = [];
                                $.each(response.data, function (idx, val) {
                                    optionList.push({
                                        id: val.id,
                                        text: val.name,
                                        isSelected: 0,
                                    });
                                });
                                updateIsSelected(optionList);

                                $("#option-wrapper").empty();

                                data.optionPrices.forEach(function (
                                    optionPrice
                                ) {
                                    if (optionPrice.status != 1) {
                                        return;
                                    }
                                    $("#option-wrapper").append(`
                                        <div class="row my-2">
                                            <div class="col-md-7">
                                                <select class="form-control select2bs4 option-select option-price-input" required width="100%" data-placeholder="Chọn một option">
                                                </select>
                                            </div>
        
                                            <div class="input-group col-md-5">
                                                <input type="text" name="text[]" value="${formatCurrent(
                                                    optionPrice.price.toString()
                                                )}" required class="form-control option-price-input price-input" placeholder="Giá">
                                                <div class="input-group-append option-price-input">
                                                    <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                                                        <i class="fa-regular fa-circle-xmark fa-lg"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    `);

                                    // Initialize select2
                                    $(".select2bs4").select2({
                                        allowClear: true,
                                        theme: "bootstrap",
                                        closeOnSelect: true,
                                        width: "100%",
                                        language: "vi",
                                    });

                                    var newSelect = $("#option-wrapper")
                                        .find(".option-select")
                                        .last();

                                    optionList.forEach(function (option) {
                                        if (option.id == optionPrice.id) {
                                            newSelect.append(
                                                `<option value="${option.id}" selected>${option.text}</option>`
                                            );
                                        } else if (option.isSelected == 0) {
                                            newSelect.append(
                                                `<option value="${option.id}">${option.text}</option>`
                                            );
                                        } else {
                                            newSelect.append(
                                                `<option disabled value="${option.id}">${option.text}</option>`
                                            );
                                        }
                                    });

                                    newSelect.trigger("change");

                                    updateOptions();
                                    updateIsSelected(optionList);
                                });

                                $(".price-input").on("input", function () {
                                    let inputValue = $(this).val();

                                    let formattedValue =
                                        formatCurrent(inputValue);

                                    $(this).val(formattedValue);
                                });

                                $(document).on(
                                    "change",
                                    ".option-select",
                                    function () {
                                        updateOptions();
                                        updateIsSelected(optionList);
                                    }
                                );
                            }
                        },
                    });

                    $("#add-option-btn").click(function (e) {
                        e.preventDefault();
                        updateIsSelected(optionList);

                        $("#option-wrapper").append(`
                            <div class="row my-2">
                                <div class="col-md-7">
                                    <select class="form-control select2bs4 option-select option-price-input" required width="100%" data-placeholder="Chọn một option">
                                    </select>
                                </div>
                
                                <div class="input-group col-md-5">
                                    <input type="text" name="text[]" required class="form-control option-price-input price-input" placeholder="Giá">
                                    <div class="input-group-append option-price-input">
                                        <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `);

                        $(".select2bs4").select2({
                            allowClear: true,
                            theme: "bootstrap",
                            closeOnSelect: true,
                            width: "100%",
                            language: "vi",
                        });

                        // Thêm các option vào select mới và lọc các tùy chọn đã chọn
                        var newSelect = $("#option-wrapper")
                            .find(".option-select")
                            .last();
                        optionList.forEach(function (option) {
                            if (option.isSelected == 0) {
                                newSelect.append(
                                    `<option value="${option.id}">${option.text}</option>`
                                );
                            } else {
                                newSelect.append(
                                    `<option disable value="${option.id}">${option.text}</option>`
                                );
                            }
                        });

                        $(document).on("input", ".price-input", function () {
                            let inputValue = $(this).val();

                            let formattedValue = formatCurrent(inputValue);

                            $(this).val(formattedValue);
                        });

                        newSelect.val("").trigger("change");
                        updateIsSelected(optionList);
                        updateOptions();

                        // Xử lý sự kiện thay đổi cho các select
                        $(document).on("change", ".option-select", function () {
                            updateOptions();
                            updateIsSelected(optionList);
                        });
                    });

                    
                    $(document).off('click', '#remove-option-btn');
                    $(document).on("click", "#remove-option-btn", function (e) {
                        var totalRows = $("#option-wrapper .row").length;
        
                        if (totalRows == 1) {
                            Toast.fire({
                                icon: "warning",
                                title: "Không thể xóa! Phải có ít nhất một lựa chọn",
                            });
                            return;
                        } else {
                            $(this).closest(".row").remove();
        
                            updateOptions();
                            updateIsSelected(optionList);
                        }
                    });
                    
                    $("#modal_footer").append(
                        '<button type="button" form="modal-form" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
                    );

                    $("#modal_id").modal("show");

                    $("#modal_submit_btn").click(function () {
                        if (!$("#modal-form")[0].checkValidity()) {
                            $("#modal-form")[0].reportValidity();
                            return;
                        }

                        let name = $("#modal_name_input").val().trim();
                        let description = $("#modal_description_input")
                            .val()
                            .trim();
                        let isApply = $("#is-enable-switch").is(":checked")
                            ? 1
                            : 0;

                        if (name == "") {
                            Toast.fire({
                                icon: "warning",
                                title: "Vui lòng điền tên dịch vụ",
                            });
                            return;
                        }

                        var optionPrices = [];
                        var hasError = false; // Biến cờ để theo dõi lỗi

                        // Duyệt qua từng phần tử trong #option-wrapper
                        $("#option-wrapper .row").each(function () {
                            var selectedOption = $(this)
                                .find(".option-select")
                                .val();
                            var priceValue = $(this)
                                .find('input[name="text[]"]')
                                .val()
                                .trim()
                                .replace(/\s+/g, "");

                            if (selectedOption == null) {
                                Toast.fire({
                                    icon: "warning",
                                    title: "Vui lòng chọn option",
                                });
                                hasError = true; // Đặt cờ lỗi
                                return;
                            }
                            if (priceValue === "") {
                                Toast.fire({
                                    icon: "warning",
                                    title: "Vui lòng điền giá cho option",
                                });
                                hasError = true; // Đặt cờ lỗi
                                return;
                            }

                            var isValidNumber = /^\d+(\.\d+)?$/.test(
                                priceValue
                            );

                            if (!isValidNumber) {
                                Toast.fire({
                                    icon: "warning",
                                    title: "Giá hợp lệ chứa số 0-9 và dấu chấm thập phân",
                                });
                                hasError = true; // Đặt cờ lỗi
                                return;
                            }

                            // Kiểm tra giá trị nhập vào có phải là số hay không (double)
                            var priceAsNumber = parseFloat(priceValue);

                            if (isNaN(priceAsNumber) || priceAsNumber < 0) {
                                Toast.fire({
                                    icon: "warning",
                                    title: "Vui lòng nhập giá hợp lệ (không âm)",
                                });
                                hasError = true; // Đặt cờ lỗi
                                return;
                            }

                            // Thêm cặp giá trị vào mảng
                            optionPrices.push({
                                option: selectedOption,
                                price: priceValue,
                            });
                        });

                        if (hasError) {
                            return;
                        }

                        $.ajax({
                            type: "POST",
                            url: "/api/services",
                            headers: utils.defaultHeaders(),
                            data: JSON.stringify({
                                name: name,
                                description: description,
                                status: isApply,
                                listOptionPrices: optionPrices.map(function (
                                    item
                                ) {
                                    return {
                                        optionId: item.option,
                                        price: item.price,
                                    };
                                }),
                            }),
                            success: function (response) {
                                if (response.code == 1000) {
                                    Toast.fire({
                                        icon: "success",
                                        title: `Thêm thành công dịch vụ<br>${name}`,
                                    });
                                    $("#modal_id").modal("hide");
                                    dataTable.ajax.reload();
                                } else if (response.code == 1044) {
                                    // Tham chiếu từ ErrorCode
                                    Swal.fire({
                                        title: `Tên dịch vụ này đã tồn tại, vẫn thêm mới dịch vụ<br>${name}?`,
                                        showDenyButton: false,
                                        showCancelButton: true,
                                        confirmButtonText: "Đồng ý",
                                        cancelButtonText: "Huỷ",
                                    }).then((result) => {
                                        /* Read more about isConfirmed, isDenied below */
                                        if (result.isConfirmed) {
                                            $.ajax({
                                                type: "POST",
                                                url: "/api/services/confirm",
                                                headers: utils.defaultHeaders(),
                                                data: JSON.stringify({
                                                    name: name,
                                                    description: description,
                                                    status: isApply,
                                                    listOptionPrices:
                                                        optionPrices.map(
                                                            function (item) {
                                                                return {
                                                                    optionId:
                                                                        item.option,
                                                                    price: item.price,
                                                                };
                                                            }
                                                        ),
                                                }),
                                                success: function (res) {
                                                    if (res.code == 1000) {
                                                        Toast.fire({
                                                            icon: "success",
                                                            title: `Thêm thành công dịch vụ<br>${name}`,
                                                        });
                                                    }
                                                    $("#modal_id").modal(
                                                        "hide"
                                                    );
                                                    dataTable.ajax.reload();
                                                },
                                                error: function (
                                                    xhr,
                                                    status,
                                                    error
                                                ) {
                                                    Toast.fire({
                                                        icon: "error",
                                                        title: utils.getXHRInfo(
                                                            xhr
                                                        ).message,
                                                    });
                                                },
                                            });
                                        }
                                    });
                                } else {
                                    Toast.fire({
                                        icon: "warning",
                                        title: utils.getErrorMessage(
                                            response.code
                                        ),
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
                    });
                },
                error: function (xhr, status, error) {
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message,
                    });
                    $("#modal_id").modal("hide");
                },
            });
        });
    } else {
        $(this).removeClass("btn-danger").addClass("btn-info").html(`
            <i class="fa-regular fa-clone mr-1"></i> Copy dịch vụ
        `);

        $("#data-table tbody tr").css("cursor", "default");
        $("#data-table tbody").off("click", "tr");
    }
});

// Các hàm hỗ trợ modal thêm-sửa service
function updateOptions() {
    // Lấy tất cả giá trị đã chọn
    var selectedValues = [];
    $(".option-select").each(function () {
        var val = $(this).val();
        if (val) {
            selectedValues.push(val);
        }
    });

    // Vô hiệu hóa các tùy chọn đã chọn
    $(".option-select").each(function () {
        var currentSelect = $(this);
        var currentVal = currentSelect.val();

        // Vô hiệu hóa các tùy chọn đã được chọn
        currentSelect.find("option").each(function () {
            if (
                selectedValues.includes($(this).val()) &&
                $(this).val() !== currentVal
            ) {
                $(this).attr("disabled", "disabled");
            } else {
                $(this).removeAttr("disabled");
            }
        });
    });
}

function updateIsSelected(optionList) {
    // Đặt lại giá trị isSelected cho tất cả các option về 0
    optionList.forEach(function (option) {
        option.isSelected = 0;
    });

    // Lấy các giá trị đã chọn từ các phần tử .option-select
    $(".option-select").each(function () {
        var selectedValue = $(this).val();

        if (selectedValue) {
            // Tìm option tương ứng trong optionList và cập nhật isSelected
            var selectedOption = optionList.find(
                (option) => option.id == selectedValue
            );
            if (selectedOption) {
                selectedOption.isSelected = 1;
            }
        }
    });
}

function formatCurrent(inputValue) {
    // Xóa các ký tự không phải là số
    inputValue = inputValue.replace(/\D/g, "");

    // Xóa các số 0 đứng đầu trừ khi số là 0 duy nhất
    inputValue = inputValue.replace(/^0+(?=\d)/, "");

    // Thêm dấu cách giữa các nhóm 3 chữ số
    let formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return formattedValue;
}
