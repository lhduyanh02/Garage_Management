import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_ACCOUNT');

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
var userList = [];

var selectedRows = new Set();

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
            { orderable: false, targets: 5 }, // Vô hiệu hóa sort cho cột Thao tác (index 5)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/accounts/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (account) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: account.id,
                            email: account.email,
                            status: account.status,
                            user: account.user,
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
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        },
        columns: [
            { data: "number" },
            {
                data: "user",
                render: function (data, type, row) {
                    let html = "";
                    html += `${data.name} `;
                    if (data.gender == 1) {
                        html += ` <small><span class="badge badge-info"><i class="fa-solid fa-child-dress"></i>&nbsp;Nam</span></small><br>`;
                    } else if (data.gender == 0) {
                        html += ` <small><span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span></small><br>`;
                    } else {
                        html += "<br>";
                    }

                    if (data.phone) {
                        html += `<small><i>${data.phone}</i></small><br>`;
                    }

                    if (data.address) {
                        html += `<small> ${data.address.address}</small><br>`;
                    }

                    return html;
                },
            },
            { data: "email" },
            {
                data: "user.roles",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        let html = "";
                        $.each(data, function (idx, val) {
                            if (val.status == 1) {
                                html += ` <span class="badge badge-light">&nbsp;${val.roleName}</span></br>`;
                            } else if (val.status == 0) {
                                html += ` <span class="badge badge-danger">&nbsp;${val.roleName}</span></br>`;
                            }
                        });
                        return "<center>" + html + "</center>";
                    }
                    return "";
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang hoạt động</span></center>';
                    } else if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp;Chưa xác thực</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Bị khóa</span></center>';
                    }
                    return "";
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;

                    if (row.status == 1 && row.user.status != 9999) {
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`;
                    }
                    if (row.status == 0 && row.user.status != 9999) {
                        html += ` <a class="btn btn-success btn-sm" id="activateBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>
                            <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    }
                    if (row.status == -1 && row.user.status != 9999) {
                        html += ` <a class="btn btn-success btn-sm" id="activateBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>
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

    $.ajax({
        type: "GET",
        url: "/api/users/with-accounts",
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (response) {
            if (response.code == 1000) {
                userList = response.data;
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

    dataTable.on('xhr', function () {
        selectedRows = new Set();
        $("#reset-password-btn").prop("disabled", true);
    });
});

$("#data-table tbody").on("click", "tr", function () {
    if ($(this).find("td").hasClass("dataTables_empty")) return;
    const data = dataTable.row(this).data();
    const rowId = data.id;

    if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
        selectedRows.delete(rowId);
    } else {
        $("#data-table tbody tr").removeClass("selected");
        selectedRows = new Set();
        $(this).addClass("selected");
        selectedRows.add(rowId);
    }

    if (selectedRows.size > 0) {
        $("#reset-password-btn").prop("disabled", false);
    } else {
        $("#reset-password-btn").prop("disabled", true);
    }
});

// Draw table with selected rows in set selectedRows
$(dataTable).on("draw", function () {
    dataTable.rows().every(function () {
        const data = this.data();
        if (selectedRows.has(data.id)) {
            $(this.node()).addClass("selected");
        }
    });
});

$("#reset-password-btn").click(function () {
    let id = selectedRows.values().next().value;

    Swal.fire({
        title: `Đặt lại mật khẩu cho tài khoản đã chọn?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/accounts/reset-password/"+id,
                headers: utils.defaultHeaders(),
                dataType: "json",
                success: function (response) {
                    if(response.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đặt lại mật khẩu thành công!"
                        })
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
});

$("#data-table").on("click", "#editBtn", function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/accounts/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu tài khoản",
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa thông tin tài khoản");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_email_input">Email</label>
                            <kbd id="modal_email_counter" class="mb-0 small">0/256</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_email_input" maxlength="255" placeholder="Nhập email">
                </div>

                <div class="form-group">
                    <label>Hồ sơ liên kết</label>
                    <div class="form-group">
                        <select id="user-select" class="form-control select2bs4" style="width: 100%;">
                        <option disabled> Chọn 1 hồ sơ liên kết </option>
                        </select>
                    </div>
                </div>
            `);

            $("#user-select").empty();
            if (res.data.user) {
                const phone = res.data.user.phone
                    ? ` - ${res.data.user.phone}`
                    : "";
                $("#user-select").append(
                    '<option selected value="' +
                        res.data.user.id +
                        '">' +
                        res.data.user.name +
                        phone +
                        "</option>"
                );
            }

            (function () {
                // Sử dụng hàm IIFE (Immediately Invoked Function Expression) để tránh truy cập list từ console
                $.ajax({
                    url: "/api/users/is-active",
                    type: "GET",
                    dataType: "json",
                    headers: utils.defaultHeaders(),
                    success: function (response) {
                        let userList = response.data; // Lưu userList trong closure, không phải biến toàn cục

                        // Khởi tạo Select2 sau khi nhận được dữ liệu từ AJAX
                        $("#user-select").select2({
                            allowClear: false,
                            theme: "bootstrap",
                            closeOnSelect: true,
                            language: "vi",
                            minimumInputLength: 2,
                            data: userList.map(function (option) {
                                const phone = option.phone
                                    ? ` - ${option.phone}`
                                    : "";

                                return {
                                    id: option.id,
                                    text: `${option.name}${phone}`,
                                };
                            }),
                            matcher: function (params, data) {
                                if ($.trim(params.term) === "") {
                                    return data;
                                }

                                const searchTerm = params.term.toLowerCase();

                                if (
                                    data.text
                                        .toLowerCase()
                                        .indexOf(searchTerm) > -1
                                ) {
                                    return data;
                                }

                                return null;
                            },
                        });
                    },
                });
            })();

            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
            );

            $("#modal_email_input").val(res.data.email);

            utils.set_char_count("#modal_email_input", "#modal_email_counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function () {
                let email = $("#modal_email_input").val().trim();
                let user = $("#user-select").val();

                if (user == null) {
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng chọn hồ sơ",
                    });
                    return;
                }

                if (email == "") {
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng điền email hợp lệ",
                    });
                    return;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/accounts/" + id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        email: email,
                        userId: user,
                    }),
                    success: function (response) {
                        if (response.code == 1000) {
                            Toast.fire({
                                icon: "success",
                                title: "Cập nhật tài khoản thành công",
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        } else if (response.code == 1067) {
                            // Tham chiếu từ ErrorCode
                            Swal.fire({
                                title: `Hành động này sẽ vô hiệu hóa tất cả tài khoản khác liên kết với hồ sơ này?`,
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/accounts/confirm/" + id,
                                        headers: utils.defaultHeaders(),
                                        data: JSON.stringify({
                                            email: email,
                                            userId: user,
                                        }),
                                        success: function (res) {
                                            if (res.code == 1000) {
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Cập nhật tài khoản thành công",
                                                });
                                            }
                                            $.ajax({
                                                type: "GET",
                                                url: "/api/users/with-accounts",
                                                dataType: "json",
                                                headers: utils.defaultHeaders(),
                                                success: function (resp) {
                                                    if (resp.code == 1000) {
                                                        userList = resp.data;
                                                    }
                                                },
                                                error: function (xhr, status, error) {
                                                    console.error(xhr);
                                                },
                                            });
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
                    },
                });
            });
        },
        error: function (xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
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
    let email = rowData.email;

    Swal.fire({
        title: `Xóa tài khoản</br>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/accounts/hard/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${email}`,
                        });
                        $.ajax({
                            type: "GET",
                            url: "/api/users/with-accounts",
                            dataType: "json",
                            headers: utils.defaultHeaders(),
                            success: function (response) {
                                if (response.code == 1000) {
                                    userList = response.data;
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error(xhr);
                            },
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
    let email = rowData.email;

    Swal.fire({
        title: `Khóa tài khoản</br>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/accounts/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã khóa tài khoản</br>" + email,
                        });
                        $.ajax({
                            type: "GET",
                            url: "/api/users/with-accounts",
                            dataType: "json",
                            headers: utils.defaultHeaders(),
                            success: function (resp) {
                                if (resp.code == 1000) {
                                    userList = resp.data;
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error(xhr);
                            },
                        });
                        dataTable.ajax.reload();
                    }
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

$("#data-table").on("click", "#activateBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let email = rowData.email;
    let userId = rowData.user.id;

    var columnData = dataTable.column(1).data().toArray();
    const count = columnData.filter((item) => item.id === userId).length;

    let question = "";
    if (count > 1) {
        question = `Kích hoạt tài khoản ${email}<br> sẽ vô hiệu hóa các tài khoản khác liên kết đến cùng hồ sơ?`;
    } else {
        question = `Kích hoạt tài khoản</br>${email}?`;
    }

    Swal.fire({
        title: question,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/accounts/active/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã kích hoạt tài khoản</br>" + email,
                        });
                        $.ajax({
                            type: "GET",
                            url: "/api/users/with-accounts",
                            dataType: "json",
                            headers: utils.defaultHeaders(),
                            success: function (resp) {
                                if (resp.code == 1000) {
                                    userList = resp.data;
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error(xhr);
                            },
                        });
                        dataTable.ajax.reload();
                    }
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

$("#new-account-btn").click(function () {
    clear_modal();
    $("#modal_title").text("Thêm tài khoản");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_email_input">Email</label>
                    <kbd id="modal_email_counter" class="mb-0 small">0/256</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_email_input" maxlength="255" placeholder="Nhập email">
        </div>

        <div class="form-group">
            <label>Loại hồ sơ</label>
            <div class="form-group">
                <select id="user-type-select" class="form-control select2bs4" style="width: 100%;">
                <option disabled selected> Chọn phân loại hồ sơ </option>
                <option value="default"> Đang hoạt động, chưa có tài khoản </option>
                <option value="activated"> Đang hoạt động </option>
                <option value="not-active"> Chưa kích hoạt </option>
                <option value="have-no-account"> Chưa có tài khoản </option>
                <option value="all"> Tất cả hồ sơ </option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>Hồ sơ liên kết</label>
            <div class="form-group">
                <select id="user-select" class="form-control select2bs4" style="width: 100%;">
                <option disabled> Chọn 1 hồ sơ liên kết </option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="is-active-switch" checked>
                <label class="custom-control-label" for="is-active-switch">Kích hoạt</label>
            </div>
        </div>
    `);

    $("#user-type-select").select2({
        placeholder: "Chọn phân loại hồ sơ",
        allowClear: true,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true,
    });
                                    
    $("#user-type-select").on("change", function () {
        let selectedValue = $(this).val();

        let filteredUserList = userList.filter((user) => {
            switch (selectedValue) {
                case "default":
                    return user.status === 1 && user.accounts.length === 0;
                case "activated":
                    return user.status === 1;
                case "not-active":
                    return user.status === 0;
                case "have-no-account":
                    return user.accounts.length === 0;
                case "all":
                    return true; // Lấy tất cả người dùng
                default:
                    return true; // Mặc định lấy tất cả
            }
        });

        $("#user-select").empty();
        $("#user-select").select2({
            placeholder: "Tìm kiếm hồ sơ",
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            language: "vi",
            minimumInputLength: 2,
            ajax: {
                transport: function (params, success, failure) {
                    let results = [];

                    // Lấy từ khóa tìm kiếm
                    let term = params.data.q || "";

                    // Lọc userList theo cả name và phone
                    let filteredUsers = filteredUserList.filter((user) => {
                        let normalizedName = utils.removeVietnameseTones(user.name.toLowerCase()); // Tên đã loại bỏ dấu
                        let termNormalized = utils.removeVietnameseTones(term.toLowerCase()); // Searching key đã loại bỏ dấu

                        let nameMatch = normalizedName.includes(termNormalized);
                        let phoneMatch =
                            user.phone && user.phone.includes(term);
                        return nameMatch || phoneMatch;
                    });

                    // Map kết quả vào định dạng mà Select2 yêu cầu
                    results = filteredUsers.map((user) => {
                        return {
                            id: user.id,
                            text: user.name, // Chỉ sử dụng tên ở đây
                            phone: user.phone,
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
                    result += ` <small><span class="badge badge-info">${data.accountCount}</span></small>`;
                }

                return `<div>${result}</div>`;
            },
            templateSelection: function (data) {
                let selection = `${data.text}`;

                if (data.phone != null) {
                    selection += ` - ${data.phone}`;
                }

                if (data.accountCount != null && data.accountCount != 0) {
                    selection += ` <small><span class="badge badge-info">${data.accountCount}</span></small>`;
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
    });

    $("#user-type-select").val("default").trigger("change");

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
    );

    utils.set_char_count("#modal_email_input", "#modal_email_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {
        let email = $("#modal_email_input").val().trim();
        let user = $("#user-select").val();
        let active = $("#is-active-switch").is(":checked") ? 1 : 0;

        if (email == "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền email hợp lệ",
            });
            return;
        }

        if (user == null) {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn hồ sơ",
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/accounts/new-account",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                email: email,
                userId: user,
                status: active,
            }),
            success: function (response) {
                if (response.code == 1000) {
                    Toast.fire({
                        icon: "success",
                        title: "Thêm tài khoản thành công",
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else if (response.code == 1067) {
                    // Tham chiếu từ ErrorCode
                    Swal.fire({
                        title: `Hành động này sẽ vô hiệu hóa tất cả tài khoản khác liên kết với hồ sơ này?`,
                        showDenyButton: false,
                        showCancelButton: true,
                        confirmButtonText: "Đồng ý",
                        cancelButtonText: "Huỷ",
                    }).then((result) => {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {
                            $.ajax({
                                type: "POST",
                                url: "/api/accounts/new-account/confirm/",
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    email: email,
                                    userId: user,
                                    status: active,
                                }),
                                success: function (res) {
                                    if (res.code == 1000) {
                                        Toast.fire({
                                            icon: "success",
                                            title: "Thêm tài khoản thành công",
                                        });
                                    }
                                    $.ajax({
                                        type: "GET",
                                        url: "/api/users/with-accounts",
                                        dataType: "json",
                                        headers: utils.defaultHeaders(),
                                        success: function (resp) {
                                            if (resp.code == 1000) {
                                                userList = resp.data;
                                            }
                                        },
                                        error: function (xhr, status, error) {
                                            console.error(xhr);
                                        },
                                    });
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
