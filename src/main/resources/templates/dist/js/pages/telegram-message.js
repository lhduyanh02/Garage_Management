import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_USER');

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
var userList = [];
var roleList = [];
var messageList = [];

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

$(document).ready(async function () {
    dataTable = await $("#data-table").DataTable({
        responsive: true,
        lengthChange: true,
        lengthMenu: [ [5, 10, 15, 30, 50, -1], [5, 10, 15, 30, 50, "Tất cả"] ],
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
            { orderable: false, targets: 6 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/telegram-message",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (message) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: message.id,
                            title: message.title,
                            message: message.message,
                            createAt: message.createAt,
                            sendAt: message.sendAt,
                            sender: message.sender,
                            status: message.status,
                            receiverQuantity: message.receiverQuantity
                        });
                    });

                    messageList = data;

                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(res),
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
        },
        columns: [
            { data: null},
            {
                data: "title",
                render: function (data, type, row) {
                    let html = `<b>${data}</b><br>`;
                    html += `<small><i>Số người nhận: ${row.receiverQuantity}</i></small><br>`;
                    html += `<div style="height: 18px; margin-bottom: 0px; overflow: hidden;"><small>${row.message}</small></div>`

                    return html;
                },
            },
            {
                data: "sender", class: "text-center",
                render: function (data, type, row) {
                    let html = data.name;
                    if (data.gender == 0) {
                        html += ' <span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span><br>';
                    } else if (data.gender == 1) {
                        html += ' <span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span><br>';
                    } else{
                        html += ` <span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp;Khác</span></center><br>`
                    }
                    if (data.phone != null) {
                        html += `<small><i>SĐT: ${row.phone}</i></small><br>`;
                    }
                    if (data.accounts && data.accounts.length > 0) {
                        html += `<small><i>Email: ${data.accounts[0].email}</i></small>`;
                    }
                    return html;
                },
            },
            {
                data: "createAt", class: "text-center",
                render: function (data, type, row) {
                    let date = utils.getTimeAsJSON(data);

                    return `${date.hour}:${date.min}, ${date.date}/${date.mon}/${date.year}`
                },
            },
            {
                data: "sendAt", class: "text-center",
                render: function (data, type, row) {
                    if (data !== null) {
                        let date = utils.getTimeAsJSON(data);
    
                        return `${date.hour}:${date.min}, ${date.date}/${date.mon}/${date.year}`;
                    }
                    return "";
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-file-pen"></i> Bản nháp</span></center>';
                    } else if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đã gửi</span></center>';
                    }
                    return "";
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = "";
                    if (row.status == 0) {
                        html += `<a class="btn btn-success btn-sm" id="sendBtn" data-id="${data}"><i class="fas fa-regular fa-paper-plane"></i></a>
                                <a class="btn btn-warning btn-sm" id="editBtn" data-id="${data}" data-toggle="tooltip" data-placement="top" title="Chỉnh sửa tin nhắn"><i class="fas fa-solid fa-pencil"></i></a>  
                                <a class="btn btn-info btn-sm" id="receiverBtn" data-id="${data}" data-toggle="tooltip" data-placement="top" title="Sửa DS người nhận"><i class="fas fa-solid fa-list-ul"></i></a>  
                                <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}"><i class="fas fa-trash"></i></a>`;
                    }
                    if (row.status == 1) {
                        html += `<a class="btn btn-success btn-sm" id="copyBtn" data-id="${data}"><i class="fas fa-regular fa-copy"></i></a>  
                                <a class="btn btn-info btn-sm" id="infoBtn" data-id="${data}"><i class="fas fa-solid fa-circle-info"></i></a>  
                                <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}"><i class="fas fa-trash"></i></a>`;
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
    });

    setTimeout(() => {
        $.ajax({
            type: "GET",
            url: "/api/users/user-has-telegram",
            headers: utils.defaultHeaders(),
            success: function (res) {
                if(res.code==1000){
                    // Chuyển đổi dữ liệu đã lọc thành mảng đối tượng cho DataTable
                    let data = res.data.map((user, index) => ({
                        id: user.id,
                        name: user.name,
                        phone: user.phone,
                        telegramId: user.telegramId,
                        gender: user.gender,
                        status: user.status,
                        address: user.address,
                        roles: user.roles,
                        accounts: user.accounts
                    }));

                    userList = data;
                }
            },
            error: function(xhr, status, error){
                console.error(xhr);
                // Toast.fire({
                //     icon: "error",
                //     title: utils.getXHRInfo(xhr).message
                // });
            }
        });
    }, 1000);
    

    $('.select2').select2({
        allowClear: false,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true,
        width: "100%"
    });

    setTimeout(() => {
        $.ajax({
            type: "GET",
            url: "/api/roles",
            headers: utils.defaultHeaders(),
            dataType: "json",
            success: function (res) {
                if (res.code == 1000) {
                    roleList = res.data;
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr);
            }
        });
    }, 1000);
});

$('#status-filter').on('change', applyFilters);

function applyFilters() {
    let targetStatus = $('#status-filter').val();
    
    let filteredData = messageList.filter(function (message) {
        return (targetStatus === "all" || message.status == targetStatus);
    });
    
    // Cập nhật DataTable với dữ liệu đã lọc
    $('#data-table').DataTable().clear().rows.add(filteredData).draw();
}

$("#new-message-btn").click(function () { 
    clear_modal();
    $("#modal_title").text("Tạo thông báo mới");
    $(".modal-dialog").addClass("modal-lg");
    
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: false      // Cho phép đóng khi nhấn Escape
    });
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_title_input">Tiêu đề <span class="text-danger">*</span></label>
                    <kbd id="modal_title_counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_title_input" maxlength="255" placeholder="Nhập tiêu đề">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_message_input">Nội dung <span class="text-danger">*</span></label>
                </div>
            </div>
            <textarea id="modal_message_input"></textarea>
        </div>
    `);
    
    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $('#modal_message_input').summernote({
        placeholder: 'Nhập nội dung...',
        height: 200, 
        tooltip: false,
        spellCheck: false,
        toolbar: [
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['view', ['codeview', 'help']],
            ['insert', ['link']],
        ],
        disableDragAndDrop: true,
        callbacks: {
            onPaste: function (e) {
                e.preventDefault(); // Ngăn dán nội dung gốc

                // Lấy văn bản thuần
                let plainText = (e.originalEvent || e).clipboardData.getData('text/plain');

                // Chèn nội dung thuần vào Summernote
                $(this).summernote('pasteHTML', plainText);
            },
            onDrop: function (e) {
                e.preventDefault(); // Ngăn kéo thả gốc

                // Nếu có nội dung thuần, dán vào editor
                let plainText = (e.originalEvent || e).dataTransfer.getData('text/plain');
                if (plainText) {
                    $(this).summernote('pasteHTML', plainText);
                }
            }
        }
    });

    utils.set_char_count("#modal_title_input", "#modal_title_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let title = $("#modal_title_input").val().trim();
        let content = $("#modal_message_input").val().trim().replace(/&nbsp;/g, ' ').trim();
        
        if (title == null || title === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập tiêu đề"
            });
            return;
        }

        if (content == null || content === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập nội dung tin nhắn"
            });
            return;
        }

        content = cleanLinks(content);

        $.ajax({
            type: "POST",
            url: "/api/telegram-message/new-draft",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                title: title,
                message: content,
                receivers: []
            }),
            beforeSend: function() {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if(response.code == 1000){
                    Swal.fire({
                        icon: "success", 
                        title: "Đã tạo bản nháp mới",
                        text: `"${title}"`
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else {
                    console.error(response);
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(response.code)
                    });
                    return;
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


$("#data-table").on("click", "#receiverBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        console.warn("null ID");
        return;
    }

    let res;
    
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/receivers/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
    } catch (e) {
        Swal.close();
        console.error(e);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(e).message
        });
        return;
    }

    if (!res) {
        Swal.isLoading() && Swal.close();
        return;
    }

    clear_modal();
    $("#modal_title").text("Chọn hồ sơ khách hàng");
    $(".modal-dialog").addClass("modal-xl");
    $("#modal_body").append(`
        <div class="row">
            <div class="col-md-4">
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
            <div class="col-md-6">
                <div class="form-group min-height-select">
                    <label>Lọc theo vai trò</label>
                    <select
                      id="modal-role-filter"
                      class="form-control select2" multiple="multiple" data-placeholder="Tất cả vai trò">
                    </select>
                </div>
            </div>
            <div class="col-md-2 d-flex">
                <button id="select-btn" type="button" class="btn btn-outline-primary ml-auto mt-auto mb-3 px-3">Lưu</button>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="custom-control custom-checkbox" style="cursor: pointer;">
                    <input class="custom-control-input custom-control-input-primary custom-control-input-outline" type="checkbox" id="select-all-checkbox">
                    <label for="select-all-checkbox" class="custom-control-label" style="cursor: pointer;">Chọn tất cả</label>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <label class="ml-auto mt-auto">Đã chọn: <span id="count-selected">0</span></label>
            </div>
        </div>

        <div class="table-responsive">
            <table id="user-table" class="table table-bordered table-striped table-hover" style="width:100%">
                <thead>
                    <tr>
                        <th scope="col" style="text-align: center" width="4%">#</th>
                        <th scope="col" style="text-align: center" min-width="15%">Họ tên</th>
                        <th scope="col" style="text-align: center" min-width="25%">Thông tin</th>
                        <th scope="col" style="text-align: center">Telegram ID</th>
                        <th scope="col" style="text-align: center" width="15%">Vai trò</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `);

    let selectedUser = res.data;
    let showUser = [];

    let userTable = $("#user-table").DataTable({
        responsive: true,
        autoFill: true,
        lengthChange: false,
        autoWidth: false,
        buttons: false,
        pageLength: 5,
        searching: true,
        dom: "lrtip", // (l: length, r: processing, t: table, i: information, p: pagination)
        columnDefs: [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 2 },
            { orderable: false, targets: 3 },
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
        data: userList,
        columns: [
            { title: "#", data: null, orderable: false }, // Cột số thứ tự không cho phép sắp xếp
            {
                data: "name",
                render: function (data, type, row) {
                    let html = "";
                    html += `${data}`;

                    if (row.gender == 0) {
                        html +=
                            ' <span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span><br>';
                    } else if (row.gender == 1) {
                        html +=
                            ' <span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span><br>';
                    } else {
                        html += ` <span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp;Khác</span></center><br>`;
                    }

                    if (row.accounts.length > 0) {
                        html += `<small>${row.accounts[0].email}</small>`;
                    }
                    return html;
                },
            },
            {
                data: "address",
                render: function (data, type, row) {
                    let html = "<small>";
                    if (row.phone) {
                        html += `SĐT: ${row.phone}<br>`;
                    }
                    if (data) {
                        html += `ĐC: ${data.address}`;
                    }
                    return html + "</small>";
                },
            },
            {
                data: "telegramId",
                render: function (data, type, row) {
                    let html = `<center>`;
                    if (data) {
                        html += data;
                    }
                    return html + "</center>";
                },
            },
            {
                data: "roles",
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

    if (roleList && roleList.length > 0) {
        roleList.forEach(function (role) {
            $('#modal-role-filter').append(`<option value="${role.id}">[${role.roleKey}] ${role.roleName}</option>`);
        });
    }

    $('#modal-role-filter').on('change', function() {
        const roles = $(this).val();

        if (roles.length == 0) {
            $('#user-table').DataTable().clear().rows.add(userList).draw();
            showUser = userList;
        } 
        else {
            let data = userList.filter(user =>
                user.roles.some(role => roles.includes(role.id))
            );
            showUser = data;
            $('#user-table').DataTable().clear().rows.add(data).draw();
        }        
    });

    $('#modal-role-filter').select2({
        placeholder: "Tất cả vai trò",
        allowClear: true,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: false,
        width: "100%"
    });

    $("#user-table tbody").on("click", "tr", function () {
        if ($(this).find("td").hasClass("dataTables_empty")) return;

        let rowData = $('#user-table').DataTable().row(this).data();

        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
            // Xóa dữ liệu của dòng khỏi mảng
            selectedUser = selectedUser.filter(user => user.id !== rowData.id);
        } else {
            $(this).addClass("selected");
            // Thêm dữ liệu của dòng vào mảng
            selectedUser.push(rowData);
        }
        
        $('#count-selected').text(selectedUser.length);
    });

    if (res && res.data && res.data.length > 0) {
        const resIds = res.data.map(user => user.id); // Lấy danh sách ID từ res.data

        selectedUser = userList.filter(user => resIds.includes(user.id));
        $('#user-table tbody tr').each(function (val) {
            let rowData = $('#user-table').DataTable().row(this).data();
            if (rowData && rowData.id && resIds.includes(rowData.id)) {
                $(this).addClass('selected');
            }
        });
        $('#count-selected').text(selectedUser.length);
    }

    $('#user-table').DataTable().on("draw", function () {
        const resIds = selectedUser.map(user => user.id);
        
        userTable.rows().every(function () {
            const data = this.data();            
            if (resIds.includes(data.id)) {
                $(this.node()).addClass("selected");
            }
        });
    });

    $("#user-search-input").on("input", function () {
        userTable.search(this.value.trim()).draw();
    });

    $("#modal-clear-btn").click(function (e) {
        $("#user-search-input").val("").trigger("input");
    });

    $("#select-btn").click(async function (e) {
        let payload = [];

        if (selectedUser.length == 0) {
            let warning = await Swal.fire({
                title: "Danh sách người nhận trống",
                text: "Xóa danh sách người nhận của tin nhắn này?",
                icon: "warning",
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Hủy",
                reverseButtons: true
            });
            
            if (!warning.isConfirmed) {
                return;
            }

            payload = [];
        }
        else {
            payload = selectedUser.map(function (val) {  
                return val.id;
            });
        }
        
        $.ajax({
            type: "PUT",
            url: "/api/telegram-message/update-receivers/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            data: JSON.stringify(payload),
            beforeSend: function() {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if (response.code == 1000) {
                    Swal.fire({
                        icon: "success",
                        title: "Cập nhật thành công",
                        text: "Đã cập nhật danh sách người nhận"
                    });
                    dataTable.ajax.reload();
                    $("#modal_id").modal("hide");
                } else {
                    console.error(response);
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(response.code)
                    });
                    return;
                }
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

    $('#select-all-checkbox').off();
    $('#select-all-checkbox').on('change', function () {
        const isChecked = $('#select-all-checkbox').is(':checked');
        const selectedIds = selectedUser.map(user => user.id);
        
        if (isChecked) {
            showUser.forEach(function (user) {
                if(!selectedIds.includes(user.id)) {
                    selectedUser.push(user); 
                }
            })

            $('#user-table tbody tr').each(function (){ 
                if (!$(this).find("td").hasClass("dataTables_empty")) {
                    $(this).addClass("selected");
                }
            })
            $('#count-selected').text(selectedUser.length);            
        }
        else {
            // Loại bỏ các phần tử trong showUser khỏi selectedUser
            showUser.forEach(function (user) {
                selectedUser = selectedUser.filter(function (selected) {
                    return selected.id !== user.id;
                });
            });

            $('#user-table tbody tr').each(function () {
                $(this).removeClass('selected');
            });
            $('#count-selected').text(selectedUser.length);   
        }
    });
    
    $("#modal_id").modal("show");
    
    Swal.close();

});


$("#data-table").on("click", "#editBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        console.warn("null ID");
        return;
    }

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/get-message/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }

    Swal.close();
    if (!res) return;

    clear_modal();
    $("#modal_title").text("Cập nhật thông báo");
    $(".modal-dialog").addClass("modal-lg");
    
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_title_input">Tiêu đề <span class="text-danger">*</span></label>
                    <kbd id="modal_title_counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_title_input" maxlength="255" placeholder="Nhập tiêu đề">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_message_input">Nội dung <span class="text-danger">*</span></label>
                </div>
            </div>
            <textarea id="modal_message_input">${res.data.message}</textarea>
        </div>
    `);
    
    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $('#modal_message_input').summernote({
        placeholder: 'Nhập nội dung...',
        height: 200, 
        tooltip: false,
        spellCheck: false,
        toolbar: [
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['view', ['codeview', 'help']],
            ['insert', ['link']],
        ],
        disableDragAndDrop: true,
        callbacks: {
            onPaste: function (e) {
                e.preventDefault(); // Ngăn dán nội dung gốc

                // Lấy văn bản thuần
                let plainText = (e.originalEvent || e).clipboardData.getData('text/plain');

                // Chèn nội dung thuần vào Summernote
                $(this).summernote('pasteHTML', plainText);
            },
            onDrop: function (e) {
                e.preventDefault(); // Ngăn kéo thả gốc

                // Nếu có nội dung thuần, dán vào editor
                let plainText = (e.originalEvent || e).dataTransfer.getData('text/plain');
                if (plainText) {
                    $(this).summernote('pasteHTML', plainText);
                }
            }
        }
    });

    $("#modal_title_input").val(res.data.title);
    utils.set_char_count("#modal_title_input", "#modal_title_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let title = $("#modal_title_input").val().trim();
        let content = $("#modal_message_input").val().trim().replace(/&nbsp;/g, ' ').trim();
        
        if (title == null || title === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập tiêu đề"
            });
            return;
        }

        if (content == null || content === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập nội dung tin nhắn"
            });
            return;
        }

        content = cleanLinks(content);

        $.ajax({
            type: "PUT",
            url: "/api/telegram-message/update-message/" + id,
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                title: title,
                message: content
            }),
            beforeSend: function() {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if(response.code == 1000){
                    Swal.fire({
                        icon: "success", 
                        title: "Cập nhật thành công",
                        text: `"${title}"`
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else {
                    console.error(response);
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(response.code)
                    });
                    return;
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

$("#data-table").on("click", "#deleteBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    // Lấy hàng hiện tại
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let title = rowData.title;

    Swal.fire({
        icon: "warning",
        title: `Xóa tin nhắn?`,
        html: `Xóa tin nhắn <b>"${title}"</b>?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
        reverseButtons: true
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/telegram-message/delete-message/" + id,
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
                            title: `Đã xóa tin nhắn`,
                            html: `<b>"${title}"</b>`
                        });
                        dataTable.ajax.reload();
                    } else {
                        console.error(res);
                        Toast.fire({
                            icon: "error",
                            title: res.message,
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.close();
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

$("#data-table").on("click", "#sendBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let title = rowData.title;
    let quantity = rowData.receiverQuantity;

    if (quantity == 0) {
        Swal.fire({
            icon: "warning",
            title: "Chưa có người nhận",
            text: "Vui lòng thêm người nhận trước khi gửi",
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    Swal.fire({
        icon: "warning",
        title: `Xác nhận gửi thông báo`,
        html: `Gửi thông báo <b>"${title}"</b><br>đến <b>${quantity}</b> người dùng?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
        reverseButtons: true
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "/api/telegram-message/send-message/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                beforeSend: function() {
                    Swal.showLoading();
                },
                success: function (res) {
                    Swal.close();
                    if(res.code == 1000 && res.data == true) {
                        Swal.fire({
                            icon: "success",
                            title: "Đã gửi"
                        });
                        dataTable.ajax.reload();
                    } else {
                        console.error(res);
                        Toast.fire({
                            icon: "error",
                            title: utils.getErrorMessage(res.code)
                        });
                        return;
                    }
                },
                error: function(xhr, status, error){
                    Swal.close();
                    console.error(xhr);
                    Swal.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi",
                        text: utils.getXHRInfo(xhr).message
                    });
                    return;
                }
            });
        }
    });
});

$("#data-table").on("click", "#infoBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        console.warn("null ID");
        return;
    }

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/receivers/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }
    if (!res) return;
    let receivers = res.data;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/get-message/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            }
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }

    Swal.close();
    if (!res) return;

    clear_modal();
    $("#modal_title").text("Xem chi tiết thông báo");
    $(".modal-dialog").addClass("modal-lg");
    
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_title_input">Tiêu đề <span class="text-danger">*</span></label>
                </div>
            </div>
            <input type="text" class="form-control bg-white" id="modal_title_input" maxlength="255" readonly>
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_message_input">Nội dung <span class="text-danger">*</span></label>
                </div>
            </div>
            <div id="modal_message_input" class="rounded border p-2">${res.data.message.trim()}</div>
        </div>

        <div class="table-responsive">
            <label class="mb-1">Danh sách người nhận</label>
            <table id="user-table" class="table table-bordered table-striped table-hover" style="width:100%">
                <thead>
                    <tr>
                        <th scope="col" style="text-align: center" width="4%">#</th>
                        <th scope="col" style="text-align: center">Người nhận</th>
                        <th scope="col" style="text-align: center" width="20%">Telegram ID</th>
                        <th scope="col" style="text-align: center" width="15%">Vai trò</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `);

    let userInfoTable = $("#user-table").DataTable({
        responsive: true,
        autoFill: true,
        lengthChange: true,
        lengthMenu: [ [5, 10, 15, 30, -1], [5, 10, 15, 30, "Tất cả"] ],
        autoWidth: false,
        buttons: false,
        pageLength: 5,
        searching: true,
        dom: "lrtip", // (l: length, r: processing, t: table, i: information, p: pagination)
        columnDefs: [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 2 },
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
        data: userList,
        columns: [
            { title: "#", data: null, orderable: false }, // Cột số thứ tự không cho phép sắp xếp
            {
                data: "name",
                render: function (data, type, row) {
                    let html = "";
                    html += `${data}`;

                    if (row.gender == 0) {
                        html +=
                            ' <span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp;Nữ</span><br>';
                    } else if (row.gender == 1) {
                        html +=
                            ' <span class="badge badge-info"><i class="fa-solid fa-child-reaching"></i>&nbsp;Nam</span><br>';
                    } else {
                        html += ` <span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp;Khác</span></center><br>`;
                    }

                    if (row.accounts.length > 0) {
                        html += `<small>Email: ${row.accounts[0].email}</small>`;
                    }
                    return html;
                },
            },
            {
                data: "telegramId",
                render: function (data, type, row) {
                    let html = `<center>`;
                    if (data) {
                        html += data;
                    }
                    return html + "</center>";
                },
            },
            {
                data: "roles",
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
    
    $("#modal_footer").append(
        '<button type="button" class="btn btn-outline-primary" id="modal_submit_btn">Đóng</button>'
    );

    $("#modal_title_input").val(res.data.title);
    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        $("#modal_id").modal("hide");
    });
});


$("#data-table").on("click", "#copyBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        console.warn("null ID");
        return;
    }

    Swal.showLoading();

    let res;
    
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/receivers/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }
    if (!res) return;
    let receivers = res.data;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/telegram-message/get-message/" + id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
    } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({
            icon: "error",
            title: utils.getXHRInfo(error).message
        });
        return;
    }

    Swal.close();
    if (!res) return;

    clear_modal();
    $("#modal_title").text("Tạo thông báo mới");
    $(".modal-dialog").addClass("modal-lg");
    
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: false      // Cho phép đóng khi nhấn Escape
    });
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_title_input">Tiêu đề <span class="text-danger">*</span></label>
                    <kbd id="modal_title_counter" class="mb-0 small">0/255</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_title_input" maxlength="255" placeholder="Nhập tiêu đề">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_message_input">Nội dung <span class="text-danger">*</span></label>
                </div>
            </div>
            <textarea id="modal_message_input">${res.data.message}</textarea>
        </div>
    `);
    
    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $('#modal_message_input').summernote({
        placeholder: 'Nhập nội dung...',
        height: 200, 
        tooltip: false,
        spellCheck: false,
        toolbar: [
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['view', ['codeview', 'help']],
            ['insert', ['link']],
        ],
        disableDragAndDrop: true,
        callbacks: {
            onPaste: function (e) {
                e.preventDefault(); // Ngăn dán nội dung gốc

                // Lấy văn bản thuần
                let plainText = (e.originalEvent || e).clipboardData.getData('text/plain');

                // Chèn nội dung thuần vào Summernote
                $(this).summernote('pasteHTML', plainText);
            },
            onDrop: function (e) {
                e.preventDefault(); // Ngăn kéo thả gốc

                // Nếu có nội dung thuần, dán vào editor
                let plainText = (e.originalEvent || e).dataTransfer.getData('text/plain');
                if (plainText) {
                    $(this).summernote('pasteHTML', plainText);
                }
            }
        }
    });

    $("#modal_title_input").val(res.data.title + " (Copy)");
    utils.set_char_count("#modal_title_input", "#modal_title_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let title = $("#modal_title_input").val().trim();
        let content = $("#modal_message_input").val().trim().replace(/&nbsp;/g, ' ').trim();
        
        if (title == null || title === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập tiêu đề"
            });
            return;
        }

        if (content == null || content === ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập nội dung tin nhắn"
            });
            return;
        }

        content = cleanLinks(content);

        $.ajax({
            type: "POST",
            url: "/api/telegram-message/new-draft",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                title: title,
                message: content,
                receivers: receivers.map(user => user.id)
            }),
            beforeSend: function() {
                Swal.showLoading();
            },
            success: function (response) {
                Swal.close();
                if(response.code == 1000){
                    Swal.fire({
                        icon: "success", 
                        title: "Đã tạo bản nháp mới",
                        text: `"${title}"`
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else {
                    console.error(response);
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(response.code)
                    });
                    return;
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

// Hàm xử lý thẻ link trong summernote
function cleanLinks(content) {
    if (!content) return ''; // Nếu nội dung rỗng hoặc null, trả về chuỗi rỗng
  
    let div = document.createElement('div');
    div.innerHTML = content;
  
    let links = div.querySelectorAll('a'); // Lấy tất cả thẻ <a>
    
    links.forEach(link => {
      let href = link.getAttribute('href'); // Lấy giá trị href
      // Xóa tất cả các thuộc tính
      Array.from(link.attributes).forEach(attr => link.removeAttribute(attr.name));
      // Chỉ thêm lại href nếu có
      if (href) {
        link.setAttribute('href', href);
      }
    });
  
    return div.innerHTML; // Trả về nội dung đã làm sạch
}