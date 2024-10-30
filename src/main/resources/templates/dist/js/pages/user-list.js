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
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

// Mảng để lưu các option mới
var addressOptions = [];
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
                next: "Trước",
                previous: "Sau",
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
            { extend: "colvis", text: "Column Visibility" },
        ],
        columnDefs: [
            { orderable: false, targets: 6 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/users",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
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
                            cars: user.cars
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
                    if (row.phone != null) {
                        html += `<small><i>${row.phone}</i></small>`;
                    }
                    return html;
                },
            },
            {
                data: "cars",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        let html = "";
                        $.each(data , function (idx, val) {
                            if(val.status == 1){
                                html+=` <span class="badge badge-light">&nbsp;${val.model.brand.brand} ${val.model.model}<br>${val.numPlate}</span><br>`
                            }
                            else if (val.status == 0){
                                html+=` <span class="badge badge-danger">&nbsp;${val.model.brand.brand} ${val.model.model}<br>${val.numPlate}</span><br>`
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
                data: "address",
                render: function (data, type, row) {
                    if (data != null) {
                        return data.address;
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
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Bị cấm</span></center>';
                    }
                    return "";
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = "";
                    if (row.status != 9999) {
                        html += `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;
                    }
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
                            <i class="fas fa-user-check"></i></a>`;
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
});

$("#data-table").on("click", "#editBtn", function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/users/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu người dùng"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa thông tin người dùng");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_name_input">Họ tên</label>
                            <kbd id="modal_name_counter" class="mb-0 small">0/255</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên người dùng">
                </div>

                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_phone_input">Số điện thoại</label>
                            <kbd id="modal_phone_counter" class="mb-0 small">0/50</kbd>
                        </div>
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
                    <label>Vai trò</label>
                    <select id="roles-select" multiple="multiple" class="form-control select2" style="width: 100%;">
                    </select>
                </div>
            `);
            $('[data-toggle="tooltip"]').tooltip();
            $('#address-select').empty();            
            if (res.data.address) {
                $('#address-select').append('<option selected value="' + res.data.address.id + '">' + res.data.address.address + '</option>');
            }
            $.ajax({
                type: "GET",
                url: "/api/roles",
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (response) {
                    $("#roles-select").empty();
                    $("#roles-select").append(`<option disabled>Chọn các vai trò</option>`);
                    $.each(response.data, function (idx, val) {
                        if(res.data.roles.some(role => role.id === val.id)){
                            $("#roles-select").append(`<option selected value="${val.id}">[${val.roleKey}] ${val.roleName}</option>`);
                        }else {
                            $("#roles-select").append(`<option value="${val.id}">[${val.roleKey}] ${val.roleName}</option>`);
                        }
                    });
                }
            });

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

                        // Lọc các address từ addressOptions dựa vào từ khóa người dùng nhập vào
                        var filtered = addressOptions.filter(function (option) {
                            return option.address.toLowerCase().indexOf(params.data.term.toLowerCase()) > -1;
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

            $('#roles-select').select2({  
                allowClear: false,
                theme: "bootstrap",
                closeOnSelect: false,
                language: "vi",
            })

            $("#modal_name_input").val(res.data.name);
            $("#modal_phone_input").val(res.data.phone);
            
            utils.set_char_count("#modal_name_input", "#modal_name_counter");
            utils.set_char_count("#modal_phone_input", "#modal_phone_counter");

            $("#gender-select").val(res.data.gender).trigger('change');

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                let name = $("#modal_name_input").val().trim();
                let phone = $("#modal_phone_input").val().trim();
                let gender = $("#gender-select").val();
                let address = $("#address-select").val();
                let roles = $("#roles-select").val();

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

                $.ajax({
                    type: "PUT",
                    url: "/api/users/"+id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        name: name,
                        phone: phone, 
                        gender: gender,
                        addressId: address,
                        roleIds: roles
                    }),
                    success: function (response) {
                        if(response.code == 1000){
                            Toast.fire({
                                icon: "success", 
                                title: "Cập nhật thông tin thành công"
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
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
    let name = rowData.name;

    Swal.fire({
        title: `Xóa người dùng</br>${name}?`,
        text: "Xóa người dùng sẽ xóa tất cả tài khoản được liên kết!",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/users/" + id,
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
                    console.error(xhr);
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
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
        title: `Cấm (ban) người dùng</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ban người dùng</br>" + name
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

$("#data-table").on("click", "#activateBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Kích hoạt người dùng</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/activate/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã kích hoạt người dùng</br>"+name
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

$("#new-user-btn").click(function () { 
    
    clear_modal();
    $("#modal_title").text("Thêm hồ sơ người dùng");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_name_input">Họ tên</label>
                    <kbd id="modal_name_counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên người dùng">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_phone_input">Số điện thoại</label>
                    <kbd id="modal_phone_counter" class="mb-0 small">0/50</kbd>
                </div>
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

        <div class="form-group">
            <label>Vai trò</label>
            <select id="roles-select" multiple="multiple" class="form-control select2" style="width: unset;">
            </select>
        </div>

        <div class="form-group">
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="is-active-switch">
                <label class="custom-control-label" for="is-active-switch">Kích hoạt</label>
            </div>
        </div>
    `);
    $('[data-toggle="tooltip"]').tooltip();
    $.ajax({
        type: "GET",
        url: "/api/roles",
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (response) {
            $("#roles-select").empty();
            $("#roles-select").append(`<option disabled> Mặc định là "Khách hàng" </option>`);
            $.each(response.data, function (idx, val) {
                $("#roles-select").append(`<option value="${val.id}">[${val.roleKey}] ${val.roleName}</option>`);
            });
        }
    });

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

                // Lọc các address từ addressOptions dựa vào từ khóa người dùng nhập vào
                var filtered = addressOptions.filter(function (option) {
                    return option.address.toLowerCase().indexOf(params.data.term.toLowerCase()) > -1;
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

    $('#roles-select').select2({
        placeholder: `Mặc định là "Khách hàng"`,  
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: false,
        language: "vi",
    })

    utils.set_char_count("#modal_name_input", "#modal_name_counter");
    utils.set_char_count("#modal_phone_input", "#modal_phone_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let name = $("#modal_name_input").val().trim();
        let phone = $("#modal_phone_input").val().trim();
        let gender = $("#gender-select").val();
        let address = $("#address-select").val();
        let roles = $("#roles-select").val();
        let status = $('#is-active-switch').is(':checked') ? 1 : 0;
        
        if (name == null || name === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền họ tên"
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

        $.ajax({
            type: "POST",
            url: "/api/users",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                name: name,
                phone: phone, 
                gender: gender,
                addressId: address,
                roleIds: roles,
                status: status
            }),
            success: function (response) {
                if(response.code == 1000){
                    Toast.fire({
                        icon: "success", 
                        title: "Thêm mới hồ sơ thành công"
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
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
});


