import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_CUSTOMER');

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

// Mảng để lưu các option mới
var addressOptions = [];
var dataTable;
var dataTableCard = $("#data-table-card");
var userList = [];
var selectedRows = new Set();

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

$(document).ready(async function () {
    dataTable = await $("#data-table").DataTable({
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
            { orderable: false, targets: [0, 4, 6] }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/users/all-customers",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    userList = res.data;
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (user) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: user.id,
                            name: user.name,
                            phone: user.phone,
                            gender: user.gender,
                            status: user.status,
                            address: user.address,
                            roles: user.roles,
                            cars: user.cars,
                            accounts: user.accounts,
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
                data: null,
                render: function (data, type, row) {
                    let html = row.name;
                    if (row.gender == 0) {
                        html += ' <span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span><br>';
                    } else if (row.gender == 1) {
                        html += ' <span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span><br>';
                    } else{
                        html += ` <span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp;Khác</span></center><br>`
                    }

                    let infoHtml = "<small>";
                    if (row.phone != null) {
                        infoHtml += `<i>SĐT: ${row.phone}</i><br>`;
                    }
                    
                    if (row.address) {
                        infoHtml += `<i>ĐC: ${row.address.address}</i>`;
                    }
                    infoHtml += "</small>";
                    return html + infoHtml;
                },
            },
            {
                data: "cars",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        let html = "";
                        $.each(data , function (idx, val) {
                            if(val.status == 1){
                                html+=` <span class="badge badge-light mb-2">&nbsp;${val.model.brand.brand} ${val.model.model}<br>${val.numPlate}</span><br>`
                            }
                            else if (val.status == 0){
                                html+=` <span class="badge badge-danger mb-2">&nbsp;${val.model.brand.brand} ${val.model.model}<br>${val.numPlate}</span><br>`
                            }
                        });
                        return (
                            '<center>' + html + '</center>'
                        );
                    }
                    return "";
                },
            },
            {
                data: "accounts",
                render: function (data, type, row) {
                    if (data && data.length > 0) {
                        return data[0].email;
                    } else return "";
                },
            },
            {
                data: "roles",
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
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang hoạt động</span></center>';
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
                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`;
                    }
                    if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" id="activateBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>
                             <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    }
                    if (row.status == -1) {
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

    dataTable.on('xhr', function () {
        $('#status-filter').val("all").trigger('change');
        selectedRows = new Set();
        $("#reset-password-btn").prop("disabled", true);
        $("#car-mapping-btn").prop("disabled", true);
    });

    $.ajax({
        type: "GET",
        url: "/api/addresses",
        headers: {  
            "Content-Type": "application/json",
            "Authorization": "",
        },
        success: function (response) {
            if(response.code==1000){
                // Load address lên mảng
                addressOptions = [];
                $.each(response.data, function (idx, val) {
                    addressOptions.push({
                        id: val.id,
                        address: val.address
                    });
                });
            }
        },
        error: function(xhr, status, error){
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
        }
    });

    $('.select2').select2({
        allowClear: false,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true,
        width: "100%"
    });
});

$("#data-table tbody").on("click", "tr", function () {
    $("#reset-password-btn").prop("disabled", true);
    $("#car-mapping-btn").prop("disabled", true);

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
        $("#car-mapping-btn").prop("disabled", false);
        if (data.accounts.length > 0 && data.accounts[0].email) {
            $("#reset-password-btn").prop("disabled", false);
        }
    } else {
        $("#reset-password-btn").prop("disabled", true);
        $("#car-mapping-btn").prop("disabled", true);
    }
});

// Draw table with selected rows in set selectedRows
$(dataTable).on("draw", function () {
    $("#car-mapping-btn").prop("disabled", true);
    $("#reset-password-btn").prop("disabled", true);
    dataTable.rows().every(function () {
        const data = this.data();
        if (selectedRows.has(data.id)) {
            $(this.node()).addClass("selected");
            $("#car-mapping-btn").prop("disabled", false);
            if (data.accounts.length > 0 && data.accounts[0].email) {
                $("#reset-password-btn").prop("disabled", false);
            }
        }
    });
});

$('#status-filter').on('change', applyFilters);

function applyFilters() {
    let targetStatus = $('#status-filter').val();

    let filteredData = userList.filter(function (user) {
        let statusMatch = (targetStatus === "all" || user.status == targetStatus);

        return statusMatch;
    });

    // Chuyển đổi dữ liệu đã lọc thành mảng đối tượng cho DataTable
    let data = filteredData.map((user, index) => ({
        number: index + 1,
        id: user.id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        address: user.address,
        roles: user.roles,
        cars: user.cars,
        accounts: user.accounts
    }));
    
    // Cập nhật DataTable với dữ liệu đã lọc
    $('#data-table').DataTable().clear().rows.add(data).draw();
    
    if (selectedRows) {
        $("#reset-password-btn").prop("disabled", true);
        dataTable.rows().every(function () {
            const data = this.data();
            if (selectedRows.has(data.id)) {
                $(this.node()).addClass("selected");
                $("#car-mapping-btn").prop("disabled", false);
                if (data.accounts.length > 0 && data.accounts[0].email) {
                    $("#reset-password-btn").prop("disabled", false);
                }
            }
        });
    }
}

$("#new-user-btn").click(function () {
    clear_modal();
    $("#modal_title").text("Thêm hồ sơ khách hàng");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="modal_name_input">Họ tên</label>
                <kbd id="modal_name_counter" class="mb-0 small">0/255</kbd>
            </div>
            <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên người dùng">
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="modal_email_input">Email</label>
                <kbd id="modal_email_counter" class="mb-0 small">0/256</kbd>
            </div>
            <input type="text" class="form-control" id="modal_email_input" maxlength="255" placeholder="Nhập email">
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="modal_phone_input">Số điện thoại</label>
                <kbd id="modal_phone_counter" class="mb-0 small">0/50</kbd>
            </div>
            <input type="text" class="form-control" id="modal_phone_input" maxlength="50" placeholder="Nhập số điện thoại"
                data-toggle="tooltip"
                data-placement="top"
                title='Độ dài 6-15 ký tự, bắt đầu bằng "0" hoặc mã vùng'>
        </div>

        <div class="form-group">
            <label>Giới tính</label>
            <div class="form-group">
                <select id="gender-select" class="form-control select2bs4" style="width: 100%;" data-placeholder="Chọn giới tính">
                <option disabled selected> Chọn giới tính </option>
                <option value="-1"> Khác </option>
                <option value="1"> Nam </option>
                <option value="0"> Nữ </option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>Địa chỉ</label>
            <select id="address-select" class="form-control select2bs4" style="width: 100%;"  data-placeholder="Chọn địa chỉ">
            </select>
        </div>
    `);
    
    $('#modal_phone_input').tooltip();

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
        );
    $("#gender-select").select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        language: "vi",
    });

    $('#address-select').empty();
    $("#address-select").select2({
        placeholder: "Chọn địa chỉ",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        minimumInputLength: 2,
        language: "vi",
        ajax: {
            transport: function (params, success, failure) {
                let results = [];

                let keyword = params.data.q || "";

                var filtered = addressOptions.filter(function (option) {
                    let normalizedName = utils.removeVietnameseTones(option.address.toLowerCase()); // Tên đã loại bỏ dấu
                    let termNormalized = utils.removeVietnameseTones(keyword.toLowerCase()); // Searching key đã loại bỏ dấu
                    
                    let nameMatch = normalizedName.includes(termNormalized);
                   
                    return nameMatch;
                });

                // Map data vào Select2 format
                results = filtered.map(function (option) {
                    return {
                        id: option.id,
                        text: option.address
                    };
                });

                // Trả về kết quả
                success({
                    results: results
                });
            },
            delay: 250, // Đặt delay để giảm thiểu số lần gọi tìm kiếm
        }
    });

    utils.set_char_count("#modal_name_input", "#modal_name_counter");
    utils.set_char_count("#modal_phone_input", "#modal_phone_counter");
    utils.set_char_count("#modal_email_input", "#modal_email_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(async function (){
        let name = $("#modal_name_input").val().trim();
        let email = $("#modal_email_input").val().trim();
        let phone = $("#modal_phone_input").val().trim();
        let gender = $("#gender-select").val();
        let address = $("#address-select").val();
        
        if (name == null || name === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền họ tên"
            });
            return;
        }

        if (email != null && !utils.isValidEmail(email)) {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền email hợp lệ"
            });
            return;
        }

        if(!utils.validatePhoneNumber(phone)){
            Toast.fire({
                icon: "warning",
                title: "Số điện thoại chưa hợp lệ"
            });
            return;
        }

        if(phone == ""){
            phone = null;
        }

        if (email == null || email == "") {
            let warning = await Swal.fire({
                title: "Không tạo tài khoản?",
                text: "Email trống đồng nghĩa với việc không tạo tài khoản cho khách hàng này",
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
        } else {
            let warning = await Swal.fire({
                title: "Thêm mới hồ sơ khách hàng này?",
                html: `Một thông báo sẽ được gửi đến email<br><b>${email}</b>` ,
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
        }

        $.ajax({
            type: "POST",
            url: "/api/users/new-customer",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                name: name,
                email: email,
                phone: phone, 
                gender: gender,
                addressId: address,
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if(response.code == 1000){
                    Swal.fire({
                        icon: "success", 
                        title: "Đã thêm!",
                        text: "Thêm mới hồ sơ khách hàng thành công!"
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else {
                    console.error(response);
                    Swal.fire({
                        icon: "error",
                        title: utils.getErrorMessage(response.code),
                    })
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
});

$("#reset-password-btn").click(async function () {
    let id = selectedRows.values().next().value;
    var row = dataTable.rows().data().toArray().find(rowData => rowData.id === id);

    if (!row) {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng chọn tài khoản cần đặt lại"
        });
        return;
    }

    if (!row.accounts.length > 0) {
        Toast.fire({
            icon: "warning",
            title: "Hồ sơ khách hàng chưa có tài khoản!"
        });
        return;
    }
    
    let warning = await Swal.fire({
        title: "Đặt lại mật khẩu khách hàng?",
        html: `Một thông báo sẽ được gửi đến email<br><b>${row.accounts[0].email}</b>`,
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
        url: "/api/accounts/reset-customer-password/" + row.accounts[0].id,
        headers: utils.defaultHeaders(),
        beforeSend: function () {
            Swal.showLoading();
        },
        success: function (response) {
            Swal.close();
            if(response.code == 1000){
                Swal.fire({
                    icon: "success", 
                    title: "Đã đặt lại mật khẩu!",
                    html: `Đã lại mật khẩu cho <b>${row.name}</b><br>Email: <b>${row.accounts[0].email}</b><br>Mật khẩu mặc định là: <i>"password"</i>.`
                });
                $("#modal_id").modal("hide");
                dataTable.ajax.reload();
            } else {
                Swal.close();
                console.error(response);
                Swal.fire({
                    icon: "error",
                    title: utils.getErrorMessage(response.code),
                })
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

$("#car-mapping-btn").click(async function () {
    let id = selectedRows.values().next().value;
    var row = dataTable.rows().data().toArray().find(rowData => rowData.id === id);

    if (!row) {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng chọn khách hàng cần đăng ký"
        });
        return;
    }

    $.ajax({
        type: "GET",
        url: `/api/cars`,
        dataType: "json",
        headers: utils.defaultHeaders(),
        beforeSend: function () {
            Swal.showLoading();
        },
        success: async function (res) {
            if (res.code == 1000) {
                Swal.close();
                clear_modal();
                $("#modal_title").text("Đăng ký quản lý xe cho " + row.name);
                $(".modal-dialog").addClass("modal-xl");
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
                            <button id="remove-mapping-btn" type="button" class="btn btn-outline-danger ml-2 mt-auto mb-3 px-3" hidden>Gỡ</button>
                        </div>
                    </div>
                    <table id="car-table" class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th scope="col" style="text-align: center" width="4%">#</th>
                                <th scope="col" style="text-align: center" width="16%">Biển số</th>
                                <th scope="col" style="text-align: center" width="20%">Mẫu xe</th>
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
                    dom: "lrtip", // (l: length, r: processing, t: table, i: information, p: pagination)

                    columnDefs: [
                        { orderable: false, targets: 0 },
                        {
                            targets: "_all", // Áp dụng cho tất cả các cột
                            className: "text-center, targets: 0", // Căn giữa nội dung của tất cả các cột
                        },
                    ],
                    language: {
                        paginate: {
                            next: "&raquo;",
                            previous: "&laquo;",
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
                        { title: "#", data: null, orderable: false }, // Cột số thứ tự không cho phép sắp xếp
                        {
                            data: "numPlate",
                            render: function (data, type, row) {
                                let html = "";
                                html += `<center>${data}<br> `;

                                if (row.plateType.type.includes("xanh")) {
                                    html += `<span class="badge badge-primary">&nbsp;${row.plateType.type}</span><br>`;
                                } else if (
                                    row.plateType.type.includes("trắng")
                                ) {
                                    html += `<span class="badge badge-light">&nbsp;${row.plateType.type}</span><br>`;
                                } else if (
                                    row.plateType.type.includes("vàng")
                                ) {
                                    html += `<span class="badge badge-warning">&nbsp;${row.plateType.type}</span><br>`;
                                } else if (row.plateType.type.includes("đỏ")) {
                                    html += `<span class="badge badge-danger">&nbsp;${row.plateType.type}</span><br>`;
                                } else {
                                    html += `<span class="badge badge-secondary">&nbsp;${row.plateType.type}</span><br>`;
                                }
                                return html + "</center>";
                            },
                        },
                        {
                            data: "model",
                            render: function (data, type, row) {
                                let html = `<center>${data.brand.brand} ${data.model}</center>`;
                                return html;
                            },
                        },
                        {
                            data: "carDetail",
                            render: function (data, type, row) {
                                let html = "";
                                if (row.color != null) {
                                    html += `<b>Màu:</b> ${row.color} | `;
                                }

                                if (row.createAt != null) {
                                    html += `<b>Khởi tạo:</b> ${utils.formatVNDate(
                                        row.createAt
                                    )}<br>`;
                                }

                                if (data != "") {
                                    html += `<b>Ghi chú: <br></b> ${data.replace(
                                        /\n/g,
                                        "<br>"
                                    )}`;
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

                let selectedCar;

                $("#car-table tbody").on("click", "tr", function () {
                    if ($(this).find("td").hasClass("dataTables_empty")) return;
                    $('#remove-mapping-btn').prop('hidden', true);

                    if ($(this).hasClass("selected")) {
                        $(this).removeClass("selected");
                        $('#remove-mapping-btn').prop('hidden', true);
                        selectedCar = null;
                    } else {
                        $("#car-table tbody tr").removeClass("selected");
                        $(this).addClass("selected");
                        selectedCar = $("#car-table").DataTable().row(this).data();
                        if (row.cars.length > 0) {
                            row.cars.forEach((car, idx) => {
                                if (car.id === selectedCar.id) {
                                    $('#remove-mapping-btn').prop('hidden', false);
                                }
                            });
                        }
                    }
                });

                $("#car-search-input").on("keyup", function () {
                    carTable.search(this.value.trim()).draw();
                });

                $(carTable).on("draw", function () {
                    carTable.rows().every(function () {
                        const data = this.data();
                        if (selectedCar.id === data.id) {
                            $(this.node()).addClass("selected");
                        } else {
                            $(this.node()).removeClass("selected");
                        }
                    });
                });

                $("#car-select-btn").click(async function (e) {
                    if (!selectedCar) {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng chọn lại xe cần đăng ký"
                        });
                        return;
                    }

                    const isDuplicate = row.cars.some(car => car.id === selectedCar.id);
    
                    if (isDuplicate) {
                        await Swal.fire({
                            icon: "warning",
                            title: "Xe đã được đăng ký",
                            html: `Xe <b>${selectedCar.numPlate}</b> đã được đăng ký<br>quản lý cho <b>${row.name}</b> trước đó`
                        });
                        return;
                    }

                    let warning = await Swal.fire({
                        title: "Đăng ký quản lý?",
                        html: `Đăng ký khách hàng <b>${row.name}</b><br>quản lý xe <b>${selectedCar.model.brand.brand} ${selectedCar.model.model} - ${selectedCar.numPlate}</b>`,
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
                        url: "/api/users/car-mapping",
                        headers: utils.defaultHeaders(),
                        data: JSON.stringify({
                            userId: row.id,
                            carId: selectedCar.id
                        }),
                        beforeSend: function () {
                            Swal.showLoading();
                        },
                        success: function (response) {
                            Swal.close();
                            if(response.code == 1000 && response.data == true) {
                                Swal.fire({
                                    icon: "success",
                                    title: "Đăng ký quản lý thành công",
                                });
                                $("#modal_id").modal("hide");
                                dataTable.ajax.reload();
                            }
                            else {
                                console.error(response);
                                Toast.fire({
                                    icon: "error",
                                    title: utils.getErrorMessage(response.code)
                                })
                            }
                        },
                        error: function(xhr, status, error) {
                            Swal.close();
                            console.error(xhr);
                            Toast.fire({
                                icon: "error",
                                title: utils.getXHRInfo(xhr).message
                            })
                        }
                    });
                });

                $("#remove-mapping-btn").click(async function (e) {
                    if (!selectedCar) {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng chọn lại xe cần gỡ quyền quản lý"
                        });
                        return;
                    }

                    const isDuplicate = row.cars.some(car => car.id === selectedCar.id);
    
                    if (!isDuplicate) {
                        await Swal.fire({
                            icon: "warning",
                            title: "Xe không thuộc quản lý",
                            html: `Xe <b>${selectedCar.numPlate}</b> chưa được quản lý bởi<br>khách hàng <b>${row.name}</b>`
                        });
                        return;
                    }

                    let warning = await Swal.fire({
                        title: "Khách hàng ngưng quản lý xe?",
                        html: `Khách hàng <b>${row.name}</b><br>sẽ ngừng quản lý xe <b>${selectedCar.model.brand.brand} ${selectedCar.model.model} - ${selectedCar.numPlate}</b>`,
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
                        url: "/api/users/remove-car-mapping",
                        headers: utils.defaultHeaders(),
                        data: JSON.stringify({
                            userId: row.id,
                            carId: selectedCar.id
                        }),
                        beforeSend: function () {
                            Swal.showLoading();
                        },
                        success: function (response) {
                            Swal.close();
                            if(response.code == 1000 && response.data == true) {
                                Swal.fire({
                                    icon: "success",
                                    title: "Cập nhật thành công!",
                                    html: `Khách hàng <b>${row.name}</b><br>đã ngừng quản lý xe <b>${selectedCar.model.brand.brand} ${selectedCar.model.model} - ${selectedCar.numPlate}</b>`
                                });
                                $("#modal_id").modal("hide");
                                dataTable.ajax.reload();
                            }
                            else {
                                console.error(response);
                                Swal.fire({
                                    icon: "error",
                                    title: "Đã xảy ra lỗi",
                                    text: utils.getErrorMessage(response.code)
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
                            })
                        }
                    });
                });

                $("#modal_id").modal("show");
            } else {
                Swal.close();
                console.error(res);
                Swal.fire({
                    icon: "warning",
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.log(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message,
            });
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
        url: "/api/users/customer/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        beforeSend: function() {
            Swal.showLoading();
        },
        success: function (res) {
            Swal.close();
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu khách hàng"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Cập nhật thông tin khách hàng");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_name_input">Họ tên</label>
                        <kbd id="modal_name_counter" class="mb-0 small">0/255</kbd>
                    </div>
                    <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên người dùng">
                </div>

                <div class="form-group">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_phone_input">Số điện thoại</label>
                        <kbd id="modal_phone_counter" class="mb-0 small">0/50</kbd>
                    </div>
                    <input type="text" class="form-control" id="modal_phone_input" maxlength="50" placeholder="Nhập số điện thoại"
                        data-toggle="tooltip"
                        data-placement="top"
                        title='Độ dài 6-15 ký tự, bắt đầu bằng "0" hoặc mã vùng'>
                </div>

                <div class="form-group">
                    <label>Giới tính</label>
                    <div class="form-group">
                        <select id="gender-select" class="form-control select2bs4" style="width: 100%;">
                        <option value="-1"> Khác </option>
                        <option value="1"> Nam </option>
                        <option value="0"> Nữ </option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Địa chỉ</label>
                    <select id="address-select" class="form-control select2bs4" style="width: 100%;">
                    </select>
                </div>

                <div class="form-group">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_email_input">Email</label>
                        <kbd id="modal_email_counter" class="mb-0 small">0/256</kbd>
                    </div>
                    <input type="text" class="form-control" id="modal_email_input" maxlength="255" placeholder="Nhập email">
                </div>
            `);
            $('[data-toggle="tooltip"]').tooltip();
            $('#address-select').empty();            
            if (res.data.address) {
                $('#address-select').append('<option selected value="' + res.data.address.id + '">' + res.data.address.address + '</option>');
            }

            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
              );
            $("#gender-select").select2({
                placeholder: "Chọn giới tính",
                allowClear: true,
                // dropdownParent: $('#modal_body'),
                theme: "bootstrap",
                // tokenSeparators: [",", " "],
                closeOnSelect: true,
                language: "vi",
            });

            $("#address-select").select2({
                placeholder: "Chọn địa chỉ",
                allowClear: true,
                language: "vi",
                theme: "bootstrap",
                closeOnSelect: true,
                minimumInputLength: 2, // Chỉ tìm kiếm khi có ít nhất 2 ký tự
                ajax: {
                    transport: function (params, success, failure) {
                        let results = [];

                        let keyword = params.data.q || "";

                        // Lọc các address từ addressOptions dựa vào từ khóa người dùng nhập vào
                        var filtered = addressOptions.filter(function (option) {
                            let normalizedName = utils.removeVietnameseTones(option.address.toLowerCase()); // Tên đã loại bỏ dấu
                            let termNormalized = utils.removeVietnameseTones(keyword.toLowerCase()); // Searching key đã loại bỏ dấu
                            
                            let nameMatch = normalizedName.includes(termNormalized);
                        
                            return nameMatch;
                        });

                        // Map data vào Select2 format
                        results = filtered.map(function (option) {
                            return {
                                id: option.id,
                                text: option.address
                            };
                        });

                        // Trả về kết quả
                        success({
                            results: results
                        });
                    },
                    delay: 250, // Đặt delay để giảm thiểu số lần gọi tìm kiếm
                }
            });

            $("#modal_name_input").val(res.data.name);
            $("#modal_phone_input").val(res.data.phone);
            if (res.data.accounts && res.data.accounts.length > 0) {
                $("#modal_email_input").val(res.data.accounts[0].email);
            }
            $("#gender-select").val(res.data.gender).trigger('change');
            
            utils.set_char_count("#modal_name_input", "#modal_name_counter");
            utils.set_char_count("#modal_phone_input", "#modal_phone_counter");
            utils.set_char_count("#modal_email_input", "#modal_email_counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(async function (){
                let name = $("#modal_name_input").val().trim();
                let email = $("#modal_email_input").val().trim();
                let phone = $("#modal_phone_input").val().trim();
                let gender = $("#gender-select").val();
                let address = $("#address-select").val();


                if(!utils.validatePhoneNumber(phone)){
                    Toast.fire({
                        icon: "warning",
                        title: "Số điện thoại chưa hợp lệ"
                    });
                    return;
                }

                if (res.data.accounts && res.data.accounts.length > 0) {
                    if (email == null || email === "" || !utils.isValidEmail(email)) {
                        Toast.fire({
                            icon: "warning",
                            title: "Vui lòng điền email hợp lệ"
                        });
                        return;
                    }

                    if (email != res.data.accounts[0].email) {
                        let warning = await Swal.fire({
                            title: "Tạo tài khoản mới?",
                            html: `Cập nhật thông tin khách hàng và sửa email đăng nhập<br><b>${email}</b>?` ,
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
                    }
                } else {
                    if (email && email !== "") {
                        if (!utils.isValidEmail(email)) {
                            Toast.fire({
                                icon: "warning",
                                title: "Vui lòng điền email hợp lệ"
                            });
                            return;
                        }
                        
                        let warning = await Swal.fire({
                            title: "Tạo tài khoản mới?",
                            html: `Cập nhật thông tin và tạo tài khoản mới<br>với email: <b>${email}</b>?` ,
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
                    } else {
                        let warning = await Swal.fire({
                            title: "Cập nhật thông tin?",
                            html: `Xác nhận cập nhật thông tin khách hàng này?` ,
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
                    }
                }

                if (phone == ""){
                    phone = null;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/users/update-customer/"+id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone, 
                        gender: gender,
                        addressId: address,
                    }),
                    beforeSend: function () {
                        Swal.showLoading();
                    },
                    success: function (response) {
                        Swal.close();
                        if(response.code == 1000){
                            Swal.fire({
                                icon: "success", 
                                title: "Cập nhật thông tin khách hàng thành công"
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        } else {
                            console.error(response);
                            Swal.fire({
                                icon: "error",
                                title: utils.getErrorMessage(response.code),
                            })
                        }
                    },
                    error: function(xhr, status, error) {
                        Swal.close();
                        console.error(xhr);
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message
                        });
                    }
                });
            });

        },
        error: function(xhr, status, error) {
            Swal.close();
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
    let name = rowData.name;

    Swal.fire({
        title: `Xóa hồ sơ khách hàng</br>${name}?`,
        text: "Xóa hồ sơ sẽ xóa tất cả tài khoản được liên kết!",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/users/customer/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: function () {
                    Swal.showLoading();
                },
                success: function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        Swal.fire({
                            icon: "success",
                            title: `Đã xóa ${name}`,
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: res.message,
                        });
                    }
                    dataTable.ajax.reload();
                },
                error: function (xhr, status, error) {
                    Swal.close();
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi",
                        text: utils.getXHRInfo(xhr).message
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
    let email = "";
    if (rowData.accounts && rowData.accounts.length > 0) {
        email = "<br>Email: <b>" + rowData.accounts[0].email+"</b>";
    }

    Swal.fire({
        icon: "warning",
        title: "Khóa hồ sơ khách hàng?",
        html: `Khóa hồ sơ khách hàng <b>${name}</b>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/disable-customer/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: function () {
                    Swal.showLoading();
                },
                success: function (res) {
                    Swal.close();
                    if(res.code == 1000 && res.data == true) {
                        Swal.fire({
                            icon: "success",
                            title: "Đã khóa hồ sơ",
                            html: `Đã khóa hồ sơ khách hàng</br><b>${name}</b>`
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    Swal.close();
                    console.error(xhr);
                    Swal.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});

$("#data-table").on("click", "#activateBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;
    let email = "";
    if (rowData.accounts && rowData.accounts.length > 0) {
        email = "<br>Email: <b>" + rowData.accounts[0].email+"</b>";
    }

    Swal.fire({
        icon: "warning",
        title: "Mở khóa hồ sơ khách hàng?",
        html: `Mở khóa hồ sơ khách hàng <b>${name}</b>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/activate-customer/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: function () {
                    Swal.showLoading();
                },
                success: function (res) {
                    Swal.close();
                    if(res.code == 1000 && res.data == true) {
                        Swal.fire({
                            icon: "success",
                            title: "Đã mở khóa hồ sơ",
                            html: `Đã mở khóa hồ sơ khách hàng</br><b>${name}</b>`
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    Swal.close();
                    console.error(xhr);
                    Swal.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});

