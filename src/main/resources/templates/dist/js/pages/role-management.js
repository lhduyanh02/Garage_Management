import * as utils from "/dist/js/utils.js";

utils.introspectPermission('EDIT_ROLE');

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
            { extend: "print", text: "In" },
            { extend: "colvis", text: "Hiển thị" },
        ],
        columnDefs: [
            { orderable: false, targets: 4 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/roles/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000 && res.data) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (role) {
                        var groupedData = {};
                        role.permissions.forEach(function (permission) {
                            // Lấy tên function hoặc gán 'Chưa phân loại' nếu không có function
                            var functionName = permission.function ? permission.function.name : 'UNCATEGORIZED';
                    
                            // Nếu function chưa tồn tại trong groupedData, khởi tạo mảng rỗng
                            if (!groupedData[functionName]) {
                                groupedData[functionName] = [];
                            }
                    
                            // Thêm permission vào nhóm tương ứng
                            groupedData[functionName].push({
                                id: permission.id,
                                name: permission.name,
                                permissionKey: permission.permissionKey
                            });
                        });
                    
                        // Chuyển groupedData thành một mảng để hiển thị dễ dàng
                        var functions = Object.keys(groupedData).map(function (funcName) {
                            return {
                                functionName: funcName,
                                permissions: groupedData[funcName]
                            };
                        });


                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: role.id,
                            roleName: role.roleName,
                            roleKey: role.roleKey,
                            status: role.status,
                            status: role.status,
                            functions: functions
                        });
                    });

                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(res.code),
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
                    let html = `<label>${row.roleName}</label><br><span class="font-italic font-weight-light">${row.roleKey}</span>`;
                    return html;
                },
            },
            {
                data: "functions",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        let html = "";
                        $.each(data, function (idx, func) {
                            if(func.name != 'UNCATEGORIZED'){
                                let funcName = func.functionName;
                                let permissionsHtml = "";
                                $.each(func.permissions, function (index, permission) { 
                                    if (index != 0) {
                                        permissionsHtml += "<br>";
                                    }
                                    permissionsHtml += "- " + permission.name
                                });


                                html+=`
                                <details>
                                    <summary><b>${funcName}</b></summary>
                                    <p>
                                        ${permissionsHtml}
                                    </p>
                                </details>
                                `
                            }
                        });
                        return html;
                    }
                    return "";
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang sử dụng</span></center>';
                    } else {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
                    } 
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;

                    if (row.status == 1) {
                        html += ` <a class="btn btn-danger btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fa-solid fa-ban"></i></a>`;
                    }
                    if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" id="enableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-check"></i></a>`;
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

$("#data-table").on("click", "#editBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    Swal.showLoading();

    let dataMap = new Map();
    try {
        let res = await $.ajax({
            type: "GET",
            url: "/api/permissions",
            dataType: "json",
            headers: utils.defaultHeaders(),
        });

        if (!res) return;
        if (res.code == 1000 && res.data) {
            dataMap = new Map();

            $.each(res.data, function (idx, val) {
                const functionKey = JSON.stringify(val.function);
                
                if (!dataMap.has(functionKey)) {
                    dataMap.set(functionKey, {
                        permissions: []
                    }) // Init key if not have yet
                }

                dataMap.get(functionKey).permissions.push({
                    id: val.id,
                    name: val.name,
                    permissionKey: val.permissionKey
                });
            });
            // console.log(dataMap);
            
        }
    } catch (error) {
        console.error(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
            showCancelButton: false,
            timer: 2000
        });
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/roles/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            Swal.close();
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa vai trò");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal-name-input">Tên vai trò</label>
                            <kbd id="modal-name-counter" class="mb-0 small">0/255</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal-name-input" maxlength="255" placeholder="Nhập tên vai trò">
                </div>

                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal-key-input">Mã vai trò</label>
                            <kbd id="modal-key-counter" class="mb-0 small">0/255</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal-key-input" maxlength="255" placeholder="Nhập mã vai trò">
                </div>

                <div class="form-group">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="status-switch">
                        <label class="custom-control-label" for="status-switch">Sử dụng</label>
                    </div>
                </div>

                <div class="rounded border p-2" id="modal-permission-select">
                </div>
            `);

            let permissionHtml = "";

            dataMap.forEach((value, key) => { 
                const functionInfo = JSON.parse(key);
                
                // permissionHtml += `<label class="mt-2 mb-0">${functionInfo.name}</label><br>`;
                permissionHtml += `
                    <div class="custom-control custom-checkbox">
                        <input class="function-checker custom-control-input custom-control-input-primary" type="checkbox" id="${functionInfo.id}">
                        <label for="${functionInfo.id}" class="custom-control-label">${functionInfo.name}</label>
                    </div>`;
                let permList = "";
                $.each(value.permissions, function (index, perm) {
                    permList += `
                    <div class="ml-2 custom-control custom-checkbox">
                      <input class="permission-checker custom-control-input custom-control-input-primary custom-control-input-outline" type="checkbox" id="${perm.permissionKey}" data-function="${functionInfo.id}" data-id="${perm.id}">
                      <label for="${perm.permissionKey}" class="custom-control-label font-weight-normal">${perm.name} (${perm.permissionKey})</label>
                    </div>`
                });
                permissionHtml += permList;
            });
           
            $('#modal-permission-select').html(permissionHtml);

            $.each(res.data.permissions, function (idx, val) { 
                $(`#${val.permissionKey}`).prop('checked', true);
            });

            $('.function-checker').each(function () { 
                let id = $(this).attr('id');
                let checkedAll = true;
                $(`[data-function='${id}']`).each(function () {
                    if (!$(this).prop('checked')) {
                        checkedAll = false;
                    }
                });
                if (checkedAll) {
                    $(this).prop('checked', true);
                }
                else {
                    $(this).prop('checked', false);
                }
            });

            $('.permission-checker').change(function () { 
                let funcId = $(this).data('function');

                let isChecked = $(this).prop('checked');
                if (isChecked) {
                    let checkedAll = true;
                    $(`[data-function='${funcId}']`).each(function () {
                        if (!$(this).prop('checked')) {
                            checkedAll = false;
                        }
                    });
                    if (checkedAll) {
                        $(`#${funcId}`).prop('checked', true);
                    }
                    else {
                        $(`#${funcId}`).prop('checked', false);
                    }
                } else {
                    $(`#${funcId}`).prop('checked', false);
                }
            });
            
            $('.function-checker').click(function () { 
                let id = $(this).attr('id');
                let isChecked = $(this).prop('checked');

                $(`[data-function='${id}']`).prop('checked', isChecked);
            });

            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
            );

            $("#modal-name-input").val(res.data.roleName);
            $("#modal-key-input").val(res.data.roleKey);
            if (res.data.status == 1) {
                $('#status-switch').attr('checked', true);
            } else {
                $('#status-switch').attr('checked', false);
            }
            
            utils.set_char_count("#modal-name-input", "#modal-name-counter");
            utils.set_char_count("#modal-key-input", "#modal-key-counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                let name = $("#modal-name-input").val().trim();
                let key = $("#modal-key-input").val().trim();
                let status = $('#status-switch').is(':checked') ? 1 : 0;
                let permissionList = [];

                $('.permission-checker:checked').each( function () {
                    let permissionId = $(this).data('id');
                    permissionList.push(permissionId);   
                });

                if (name == null || name == "") {
                    Swal.fire({
                        icon: "warning",
                        title: "Vui lòng điền tên vai trò",
                        showCancelButton: false,
                        timer: 2000
                    });
                    return;
                }

                if (key == null || key == "") {
                    Swal.fire({
                        icon: "warning",
                        title: "Vui lòng điền mã vai trò",
                        showCancelButton: false,
                        timer: 2000
                    });
                    return;
                }

                if (permissionList.length == 0) {
                    Swal.fire({
                        icon: "warning",
                        title: "Vui lòng chọn phân quyền",
                        showCancelButton: false,
                        timer: 2000
                    });
                    return;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/roles/"+id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        roleName: name,
                        roleKey: key, 
                        status: status,
                        permissions: permissionList
                    }),
                    success: function (response) {
                        if(response.code == 1000){
                            Swal.fire({
                                icon: "success", 
                                title: "Cập nhật thông tin thành công"
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr);
                        Swal.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi",
                            text: utils.getXHRInfo(xhr).message
                        });
                        dataTable.ajax.reload();
                    }
                });
            });

        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
            $("#modal_id").modal("hide");
        }
    });
});

$('#new-role-btn').click(async function () { 
    let dataMap = new Map();
    try {
        let res = await $.ajax({
            type: "GET",
            url: "/api/permissions",
            dataType: "json",
            headers: utils.defaultHeaders(),
        });

        if (!res) return;
        if (res.code == 1000 && res.data) {
            dataMap = new Map();

            $.each(res.data, function (idx, val) {
                const functionKey = JSON.stringify(val.function);
                
                if (!dataMap.has(functionKey)) {
                    dataMap.set(functionKey, {
                        permissions: []
                    }) // Init key if not have yet
                }

                dataMap.get(functionKey).permissions.push({
                    id: val.id,
                    name: val.name,
                    permissionKey: val.permissionKey
                });
            });
            // console.log(dataMap);
            
        }
    } catch (error) {
        console.error(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
            showCancelButton: false,
            timer: 2000
        });
        return;
    }

    clear_modal();
    $("#modal_title").text("Sửa vai trò");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal-name-input">Tên vai trò</label>
                    <kbd id="modal-name-counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal-name-input" maxlength="255" placeholder="Nhập tên vai trò">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal-key-input">Mã vai trò</label>
                    <kbd id="modal-key-counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal-key-input" maxlength="255" placeholder="Nhập mã vai trò">
        </div>

        <div class="form-group">
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="status-switch" checked>
                <label class="custom-control-label" for="status-switch">Sử dụng</label>
            </div>
        </div>

        <div class="rounded border p-2" id="modal-permission-select">
        </div>
    `);

    let permissionHtml = "";

    dataMap.forEach((value, key) => { 
        const functionInfo = JSON.parse(key);
        
        // permissionHtml += `<label class="mt-2 mb-0">${functionInfo.name}</label><br>`;
        permissionHtml += `
            <div class="custom-control custom-checkbox">
                <input class="function-checker custom-control-input custom-control-input-primary" type="checkbox" id="${functionInfo.id}">
                <label for="${functionInfo.id}" class="custom-control-label">${functionInfo.name}</label>
            </div>`;
        let permList = "";
        $.each(value.permissions, function (index, perm) {
            permList += `
            <div class="ml-2 custom-control custom-checkbox">
                <input class="permission-checker custom-control-input custom-control-input-primary custom-control-input-outline" type="checkbox" id="${perm.permissionKey}" data-function="${functionInfo.id}" data-id="${perm.id}">
                <label for="${perm.permissionKey}" class="custom-control-label font-weight-normal">${perm.name} (${perm.permissionKey})</label>
            </div>`
        });
        permissionHtml += permList;
    });
    
    $('#modal-permission-select').html(permissionHtml);

    $('.permission-checker').change(function () { 
        let funcId = $(this).data('function');

        let isChecked = $(this).prop('checked');
        if (isChecked) {
            let checkedAll = true;
            $(`[data-function='${funcId}']`).each(function () {
                if (!$(this).prop('checked')) {
                    checkedAll = false;
                }
            });
            if (checkedAll) {
                $(`#${funcId}`).prop('checked', true);
            }
            else {
                $(`#${funcId}`).prop('checked', false);
            }
        } else {
            $(`#${funcId}`).prop('checked', false);
        }
    });
    
    $('.function-checker').click(function () { 
        let id = $(this).attr('id');
        let isChecked = $(this).prop('checked');

        $(`[data-function='${id}']`).prop('checked', isChecked);
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );
    
    utils.set_char_count("#modal-name-input", "#modal-name-counter");
    utils.set_char_count("#modal-key-input", "#modal-key-counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let name = $("#modal-name-input").val().trim();
        let key = $("#modal-key-input").val().trim();
        let status = $('#status-switch').is(':checked') ? 1 : 0;
        let permissionList = [];

        $('.permission-checker:checked').each( function () {
            let permissionId = $(this).data('id');
            permissionList.push(permissionId);   
        });

        if (name == null || name == "") {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng điền tên vai trò",
                showCancelButton: false,
                timer: 2000
            });
            return;
        }

        if (key == null || key == "") {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng điền mã vai trò",
                showCancelButton: false,
                timer: 2000
            });
            return;
        }

        if (permissionList.length == 0) {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng chọn phân quyền",
                showCancelButton: false,
                timer: 2000
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/roles",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                roleName: name,
                roleKey: key, 
                status: status,
                permissions: permissionList
            }),
            success: function (response) {
                if(response.code == 1000){
                    Swal.fire({
                        icon: "success", 
                        title: `Thêm thành công`,
                        html: `Thêm mới vai trò <b>${name}</b> thành công!`,
                        showCancelButton: false,
                        timer: 2000
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                }
            },
            error: function(xhr, status, error) {
                console.error(xhr);
                Swal.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
            }
        });
    });
});

$("#data-table").on("click", "#disableBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    // Lấy hàng hiện tại
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.roleName;

    Swal.fire({
        title: `Ngưng sử dụng vai trò<br>${name}?`,
        icon: "warning",
        showCancelButton: true,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
        reverseButtons: true
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/roles/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data) {
                        Swal.fire({
                            icon: "success",
                            title: `Đã vô hiệu hóa vai trò<br><b>${name}</b>`,
                            showCancelButton: false,
                            timer: 2000
                        });
                        dataTable.ajax.reload();
                    } else {
                        console.error(res);
                        Swal.fire({
                            icon: "error",
                            title: utils.getErrorMessage(res.code),
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error(xhr);
                    Swal.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message
                    });
                },
            });
        }
    });
});

$("#data-table").on("click", "#enableBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    // Lấy hàng hiện tại
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.roleName;

    Swal.fire({
        title: `Sử dụng vai trò<br>${name}?`,
        icon: "warning",
        showCancelButton: true,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
        reverseButtons: true
        
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/roles/enable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data) {
                        Swal.fire({
                            icon: "success",
                            title: `Đã mở vai trò<br><b>${name}</b>`,
                            showCancelButton: false,
                            timer: 2000
                        });
                        dataTable.ajax.reload();
                    } else {
                        console.error(res);
                        Toast.fire({
                            icon: "error",
                            title: utils.getErrorMessage(res.code),
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
            });
        }
    });
});