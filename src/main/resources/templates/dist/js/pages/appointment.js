import * as utils from "/dist/js/utils.js";

// utils.introspect(true);

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

var listAppointment;
const dateRangePicker = $('#reservationtime');
const TIMELINE = $('#timeline');
var serviceOptionList = [];


$(document).ready(function () {
    $("#search-type-select").select2({
        allowClear: false,
        theme: "bootstrap",
        language: "vi",
        closeOnSelect: true,
    });

    // Khởi tạo daterangepicker
    dateRangePicker.daterangepicker({
        timePicker: true,
        timePicker24Hour: true,   // Sử dụng định dạng 24 giờ
        timePickerIncrement: 10,
        autoUpdateInput: false,   // Không tự động cập nhật input cho đến khi nhấn "Chọn"
        maxSpan: {
            days: 31  // Giới hạn không quá 7 ngày
        },
        locale: {
            format: 'HH:mm, DD/MM/YYYY',     // Định dạng ngày giờ tiếng Việt
            separator: ' đến ',              // Dấu phân cách giữa hai ngày
            applyLabel: 'Chọn',              // Nhãn nút "Chọn"
            cancelLabel: 'Hủy',              // Nhãn nút "Hủy"
            fromLabel: 'Từ',
            toLabel: 'Đến',
            customRangeLabel: 'Tùy chọn',
            weekLabel: 'Tuần',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: [
                'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ],
            firstDay: 1  // Bắt đầu tuần từ Thứ 2
        }
    });

    // Truy xuất instance daterangepicker
    const picker = dateRangePicker.data('daterangepicker');

    // Đặt lại giá trị startDate và endDate khi khởi tạo
    const startOfDay = moment().startOf('day');  // 0h hôm nay
    const endOfDay = moment().endOf('day');      // 23:59 hôm nay

    picker.setStartDate(startOfDay);
    picker.setEndDate(endOfDay);

    // Cập nhật input với range mặc định ngay khi khởi tạo
    dateRangePicker.val(
        startOfDay.format('HH:mm, DD/MM/YYYY') +
        ' đến ' +
        endOfDay.format('HH:mm, DD/MM/YYYY')
    );

    // Sự kiện khi nhấn "Chọn"
    dateRangePicker.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(
            picker.startDate.format('HH:mm, DD/MM/YYYY') +
            ' đến ' +
            picker.endDate.format('HH:mm, DD/MM/YYYY')
        );
    });

    // Sự kiện khi nhấn "Hủy" hoặc click ra ngoài
    dateRangePicker.on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });
    
    $.ajax({
        type: "GET",
        url: "/api/services/enable-with-price",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data) {
                serviceOptionList = res.data;
            }
        },
        error: function (xhr, status, error) {
            console.error(utils.getXHRInfo(xhr));
        },
    });
    
    

    return;

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

// $("#data-table").on("click", "#editBtn", async function () {
//     var id = $(this).data("id");

//     if (id == null) {
//         return;
//     }

//     Swal.showLoading();

//     let dataMap = new Map();
//     try {
//         let res = await $.ajax({
//             type: "GET",
//             url: "/api/permissions",
//             dataType: "json",
//             headers: utils.defaultHeaders(),
//         });

//         if (!res) return;
//         if (res.code == 1000 && res.data) {
//             dataMap = new Map();

//             $.each(res.data, function (idx, val) {
//                 const functionKey = JSON.stringify(val.function);
                
//                 if (!dataMap.has(functionKey)) {
//                     dataMap.set(functionKey, {
//                         permissions: []
//                     }) // Init key if not have yet
//                 }

//                 dataMap.get(functionKey).permissions.push({
//                     id: val.id,
//                     name: val.name,
//                     permissionKey: val.permissionKey
//                 });
//             });
//             // console.log(dataMap);
            
//         }
//     } catch (error) {
//         console.error(error);
//         Swal.close();
//         Swal.fire({
//             icon: "error",
//             title: "Đã xảy ra lỗi",
//             text: utils.getXHRInfo(error).message,
//             showCancelButton: false,
//             timer: 2000
//         });
//         return;
//     }

//     $.ajax({
//         type: "GET",
//         url: "/api/roles/" + id,
//         dataType: "json",
//         headers: utils.defaultHeaders(),
//         success: function (res) {
//             Swal.close();
//             if(res.code != 1000) {
//                 Toast.fire({
//                     icon: "error",
//                     title: "Không thể lấy dữ liệu"
//                 });
//                 return;
//             }
//             clear_modal();
//             $("#modal_title").text("Sửa vai trò");
//             $("#modal_body").append(`
//                 <div class="form-group">
//                     <div class="container mt-3 mb-0">
//                         <div class="d-flex justify-content-between align-items-center mb-2">
//                             <label class="mb-0" for="modal-name-input">Tên vai trò</label>
//                             <kbd id="modal-name-counter" class="mb-0 small">0/255</kbd>
//                         </div>
//                     </div>
//                     <input type="text" class="form-control" id="modal-name-input" maxlength="255" placeholder="Nhập tên vai trò">
//                 </div>

//                 <div class="form-group">
//                     <div class="container mt-3 mb-0">
//                         <div class="d-flex justify-content-between align-items-center mb-2">
//                             <label class="mb-0" for="modal-key-input">Mã vai trò</label>
//                             <kbd id="modal-key-counter" class="mb-0 small">0/255</kbd>
//                         </div>
//                     </div>
//                     <input type="text" class="form-control" id="modal-key-input" maxlength="255" placeholder="Nhập mã vai trò">
//                 </div>

//                 <div class="form-group">
//                     <div class="custom-control custom-switch">
//                         <input type="checkbox" class="custom-control-input" id="status-switch">
//                         <label class="custom-control-label" for="status-switch">Sử dụng</label>
//                     </div>
//                 </div>

//                 <div class="rounded border p-2" id="modal-permission-select">
//                 </div>
//             `);

//             let permissionHtml = "";

//             dataMap.forEach((value, key) => { 
//                 const functionInfo = JSON.parse(key);
                
//                 // permissionHtml += `<label class="mt-2 mb-0">${functionInfo.name}</label><br>`;
//                 permissionHtml += `
//                     <div class="custom-control custom-checkbox">
//                         <input class="function-checker custom-control-input custom-control-input-primary" type="checkbox" id="${functionInfo.id}">
//                         <label for="${functionInfo.id}" class="custom-control-label">${functionInfo.name}</label>
//                     </div>`;
//                 let permList = "";
//                 $.each(value.permissions, function (index, perm) {
//                     permList += `
//                     <div class="ml-2 custom-control custom-checkbox">
//                       <input class="permission-checker custom-control-input custom-control-input-primary custom-control-input-outline" type="checkbox" id="${perm.permissionKey}" data-function="${functionInfo.id}" data-id="${perm.id}">
//                       <label for="${perm.permissionKey}" class="custom-control-label font-weight-normal">${perm.name}</label>
//                     </div>`
//                 });
//                 permissionHtml += permList;
//             });
           
//             $('#modal-permission-select').html(permissionHtml);

//             $.each(res.data.permissions, function (idx, val) { 
//                 $(`#${val.permissionKey}`).prop('checked', true);
//             });

//             $('.function-checker').each(function () { 
//                 let id = $(this).attr('id');
//                 let checkedAll = true;
//                 $(`[data-function='${id}']`).each(function () {
//                     if (!$(this).prop('checked')) {
//                         checkedAll = false;
//                     }
//                 });
//                 if (checkedAll) {
//                     $(this).prop('checked', true);
//                 }
//                 else {
//                     $(this).prop('checked', false);
//                 }
//             });

//             $('.permission-checker').change(function () { 
//                 let funcId = $(this).data('function');

//                 let isChecked = $(this).prop('checked');
//                 if (isChecked) {
//                     let checkedAll = true;
//                     $(`[data-function='${funcId}']`).each(function () {
//                         if (!$(this).prop('checked')) {
//                             checkedAll = false;
//                         }
//                     });
//                     if (checkedAll) {
//                         $(`#${funcId}`).prop('checked', true);
//                     }
//                     else {
//                         $(`#${funcId}`).prop('checked', false);
//                     }
//                 } else {
//                     $(`#${funcId}`).prop('checked', false);
//                 }
//             });
            
//             $('.function-checker').click(function () { 
//                 let id = $(this).attr('id');
//                 let isChecked = $(this).prop('checked');

//                 $(`[data-function='${id}']`).prop('checked', isChecked);
//             });

//             $("#modal_footer").append(
//                 '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
//             );

//             $("#modal-name-input").val(res.data.roleName);
//             $("#modal-key-input").val(res.data.roleKey);
//             if (res.data.status == 1) {
//                 $('#status-switch').attr('checked', true);
//             } else {
//                 $('#status-switch').attr('checked', false);
//             }
            
//             utils.set_char_count("#modal-name-input", "#modal-name-counter");
//             utils.set_char_count("#modal-key-input", "#modal-key-counter");

//             $("#modal_id").modal("show");

//             $("#modal_submit_btn").click(function (){
//                 let name = $("#modal-name-input").val().trim();
//                 let key = $("#modal-key-input").val().trim();
//                 let status = $('#status-switch').is(':checked') ? 1 : 0;
//                 let permissionList = [];

//                 $('.permission-checker:checked').each( function () {
//                     let permissionId = $(this).data('id');
//                     permissionList.push(permissionId);   
//                 });

//                 if (name == null || name == "") {
//                     Swal.fire({
//                         icon: "warning",
//                         title: "Vui lòng điền tên vai trò",
//                         showCancelButton: false,
//                         timer: 2000
//                     });
//                     return;
//                 }

//                 if (key == null || key == "") {
//                     Swal.fire({
//                         icon: "warning",
//                         title: "Vui lòng điền mã vai trò",
//                         showCancelButton: false,
//                         timer: 2000
//                     });
//                     return;
//                 }

//                 if (permissionList.length == 0) {
//                     Swal.fire({
//                         icon: "warning",
//                         title: "Vui lòng chọn phân quyền",
//                         showCancelButton: false,
//                         timer: 2000
//                     });
//                     return;
//                 }

//                 $.ajax({
//                     type: "PUT",
//                     url: "/api/roles/"+id,
//                     headers: utils.defaultHeaders(),
//                     data: JSON.stringify({
//                         roleName: name,
//                         roleKey: key, 
//                         status: status,
//                         permissions: permissionList
//                     }),
//                     success: function (response) {
//                         if(response.code == 1000){
//                             Toast.fire({
//                                 icon: "success", 
//                                 title: "Cập nhật thông tin thành công"
//                             });
//                             $("#modal_id").modal("hide");
//                             dataTable.ajax.reload();
//                         }
//                     },
//                     error: function(xhr, status, error) {
//                         console.error(xhr);
//                         Toast.fire({
//                             icon: "error",
//                             title: utils.getXHRInfo(xhr).message
//                         });
//                         dataTable.ajax.reload();
//                     }
//                 });
//             });

//         },
//         error: function(xhr, status, error) {
//             Swal.close();
//             console.error(xhr);
//             Toast.fire({
//                 icon: "error",
//                 title: utils.getXHRInfo(xhr).message
//             });
//             $("#modal_id").modal("hide");
//         }
//     });
// });

// $('#new-role-btn').click(async function () { 
//     let dataMap = new Map();
//     try {
//         let res = await $.ajax({
//             type: "GET",
//             url: "/api/permissions",
//             dataType: "json",
//             headers: utils.defaultHeaders(),
//         });

//         if (!res) return;
//         if (res.code == 1000 && res.data) {
//             dataMap = new Map();

//             $.each(res.data, function (idx, val) {
//                 const functionKey = JSON.stringify(val.function);
                
//                 if (!dataMap.has(functionKey)) {
//                     dataMap.set(functionKey, {
//                         permissions: []
//                     }) // Init key if not have yet
//                 }

//                 dataMap.get(functionKey).permissions.push({
//                     id: val.id,
//                     name: val.name,
//                     permissionKey: val.permissionKey
//                 });
//             });
//             // console.log(dataMap);
            
//         }
//     } catch (error) {
//         console.error(error);
//         Swal.close();
//         Swal.fire({
//             icon: "error",
//             title: "Đã xảy ra lỗi",
//             text: utils.getXHRInfo(error).message,
//             showCancelButton: false,
//             timer: 2000
//         });
//         return;
//     }

//     clear_modal();
//     $("#modal_title").text("Sửa vai trò");
//     $("#modal_body").append(`
//         <div class="form-group">
//             <div class="container mt-3 mb-0">
//                 <div class="d-flex justify-content-between align-items-center mb-2">
//                     <label class="mb-0" for="modal-name-input">Tên vai trò</label>
//                     <kbd id="modal-name-counter" class="mb-0 small">0/255</kbd>
//                 </div>
//             </div>
//             <input type="text" class="form-control" id="modal-name-input" maxlength="255" placeholder="Nhập tên vai trò">
//         </div>

//         <div class="form-group">
//             <div class="container mt-3 mb-0">
//                 <div class="d-flex justify-content-between align-items-center mb-2">
//                     <label class="mb-0" for="modal-key-input">Mã vai trò</label>
//                     <kbd id="modal-key-counter" class="mb-0 small">0/255</kbd>
//                 </div>
//             </div>
//             <input type="text" class="form-control" id="modal-key-input" maxlength="255" placeholder="Nhập mã vai trò">
//         </div>

//         <div class="form-group">
//             <div class="custom-control custom-switch">
//                 <input type="checkbox" class="custom-control-input" id="status-switch" checked>
//                 <label class="custom-control-label" for="status-switch">Sử dụng</label>
//             </div>
//         </div>

//         <div class="rounded border p-2" id="modal-permission-select">
//         </div>
//     `);

//     let permissionHtml = "";

//     dataMap.forEach((value, key) => { 
//         const functionInfo = JSON.parse(key);
        
//         // permissionHtml += `<label class="mt-2 mb-0">${functionInfo.name}</label><br>`;
//         permissionHtml += `
//             <div class="custom-control custom-checkbox">
//                 <input class="function-checker custom-control-input custom-control-input-primary" type="checkbox" id="${functionInfo.id}">
//                 <label for="${functionInfo.id}" class="custom-control-label">${functionInfo.name}</label>
//             </div>`;
//         let permList = "";
//         $.each(value.permissions, function (index, perm) {
//             permList += `
//             <div class="ml-2 custom-control custom-checkbox">
//                 <input class="permission-checker custom-control-input custom-control-input-primary custom-control-input-outline" type="checkbox" id="${perm.permissionKey}" data-function="${functionInfo.id}" data-id="${perm.id}">
//                 <label for="${perm.permissionKey}" class="custom-control-label font-weight-normal">${perm.name}</label>
//             </div>`
//         });
//         permissionHtml += permList;
//     });
    
//     $('#modal-permission-select').html(permissionHtml);

//     $('.permission-checker').change(function () { 
//         let funcId = $(this).data('function');

//         let isChecked = $(this).prop('checked');
//         if (isChecked) {
//             let checkedAll = true;
//             $(`[data-function='${funcId}']`).each(function () {
//                 if (!$(this).prop('checked')) {
//                     checkedAll = false;
//                 }
//             });
//             if (checkedAll) {
//                 $(`#${funcId}`).prop('checked', true);
//             }
//             else {
//                 $(`#${funcId}`).prop('checked', false);
//             }
//         } else {
//             $(`#${funcId}`).prop('checked', false);
//         }
//     });
    
//     $('.function-checker').click(function () { 
//         let id = $(this).attr('id');
//         let isChecked = $(this).prop('checked');

//         $(`[data-function='${id}']`).prop('checked', isChecked);
//     });

//     $("#modal_footer").append(
//         '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
//     );
    
//     utils.set_char_count("#modal-name-input", "#modal-name-counter");
//     utils.set_char_count("#modal-key-input", "#modal-key-counter");

//     $("#modal_id").modal("show");

//     $("#modal_submit_btn").click(function (){
//         let name = $("#modal-name-input").val().trim();
//         let key = $("#modal-key-input").val().trim();
//         let status = $('#status-switch').is(':checked') ? 1 : 0;
//         let permissionList = [];

//         $('.permission-checker:checked').each( function () {
//             let permissionId = $(this).data('id');
//             permissionList.push(permissionId);   
//         });

//         if (name == null || name == "") {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Vui lòng điền tên vai trò",
//                 showCancelButton: false,
//                 timer: 2000
//             });
//             return;
//         }

//         if (key == null || key == "") {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Vui lòng điền mã vai trò",
//                 showCancelButton: false,
//                 timer: 2000
//             });
//             return;
//         }

//         if (permissionList.length == 0) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Vui lòng chọn phân quyền",
//                 showCancelButton: false,
//                 timer: 2000
//             });
//             return;
//         }

//         $.ajax({
//             type: "POST",
//             url: "/api/roles",
//             headers: utils.defaultHeaders(),
//             data: JSON.stringify({
//                 roleName: name,
//                 roleKey: key, 
//                 status: status,
//                 permissions: permissionList
//             }),
//             success: function (response) {
//                 if(response.code == 1000){
//                     Swal.fire({
//                         icon: "success", 
//                         title: `Thêm thành công`,
//                         html: `Thêm mới vai trò <b>${name}</b> thành công!`,
//                         showCancelButton: false,
//                         timer: 2000
//                     });
//                     $("#modal_id").modal("hide");
//                     dataTable.ajax.reload();
//                 }
//             },
//             error: function(xhr, status, error) {
//                 console.error(xhr);
//                 Toast.fire({
//                     icon: "error",
//                     title: utils.getXHRInfo(xhr).message
//                 });
//                 dataTable.ajax.reload();
//             }
//         });
//     });
// });

// $("#data-table").on("click", "#disableBtn", function () {
//     let id = $(this).data("id");

//     if (id == null) {
//         return;
//     }

//     // Lấy hàng hiện tại
//     let row = $(this).closest("tr");
//     let rowData = $("#data-table").DataTable().row(row).data();
//     // Lấy tên từ dữ liệu của hàng
//     let name = rowData.roleName;

//     Swal.fire({
//         title: `Ngưng sử dụng vai trò<br>${name}?`,
//         icon: "warning",
//         showCancelButton: true,
//         showCancelButton: true,
//         confirmButtonText: "Đồng ý",
//         cancelButtonText: "Huỷ",
//         reverseButtons: true
//     }).then((result) => {
//         /* Read more about isConfirmed, isDenied below */
//         if (result.isConfirmed) {
//             $.ajax({
//                 type: "PUT",
//                 url: "/api/roles/disable/" + id,
//                 dataType: "json",
//                 headers: utils.defaultHeaders(),
//                 success: function (res) {
//                     if (res.code == 1000 && res.data) {
//                         Swal.fire({
//                             icon: "success",
//                             title: `Đã vô hiệu hóa vai trò<br><b>${name}</b>`,
//                             showCancelButton: false,
//                             timer: 2000
//                         });
//                         dataTable.ajax.reload();
//                     } else {
//                         console.error(res);
//                         Toast.fire({
//                             icon: "error",
//                             title: utils.getErrorMessage(res.code),
//                         });
//                     }
//                 },
//                 error: function (xhr, status, error) {
//                     console.error(xhr);
//                     Toast.fire({
//                         icon: "error",
//                         title: utils.getXHRInfo(xhr).message
//                     });
//                 },
//             });
//         }
//     });
// });

// $("#data-table").on("click", "#enableBtn", function () {
//     let id = $(this).data("id");

//     if (id == null) {
//         return;
//     }

//     // Lấy hàng hiện tại
//     let row = $(this).closest("tr");
//     let rowData = $("#data-table").DataTable().row(row).data();
//     // Lấy tên từ dữ liệu của hàng
//     let name = rowData.roleName;

//     Swal.fire({
//         title: `Sử dụng vai trò<br>${name}?`,
//         icon: "warning",
//         showCancelButton: true,
//         showCancelButton: true,
//         confirmButtonText: "Đồng ý",
//         cancelButtonText: "Huỷ",
//         reverseButtons: true
        
//     }).then((result) => {
//         /* Read more about isConfirmed, isDenied below */
//         if (result.isConfirmed) {
//             $.ajax({
//                 type: "PUT",
//                 url: "/api/roles/enable/" + id,
//                 dataType: "json",
//                 headers: utils.defaultHeaders(),
//                 success: function (res) {
//                     if (res.code == 1000 && res.data) {
//                         Swal.fire({
//                             icon: "success",
//                             title: `Đã mở vai trò<br><b>${name}</b>`,
//                             showCancelButton: false,
//                             timer: 2000
//                         });
//                         dataTable.ajax.reload();
//                     } else {
//                         console.error(res);
//                         Toast.fire({
//                             icon: "error",
//                             title: utils.getErrorMessage(res.code),
//                         });
//                     }
//                 },
//                 error: function (xhr, status, error) {
//                     console.error(xhr);
//                     Toast.fire({
//                         icon: "error",
//                         title: utils.getXHRInfo(xhr).message
//                     });
//                 },
//             });
//         }
//     });
// });

$('#card-submit-btn').click( async function () { 
    loadListAppointment();
});

async function loadListAppointment() {
    let urlPart = "";
    if($('#search-type-select').val() === "booking-time") {
        urlPart = "/by-time";
    } else if ($('#search-type-select').val() === "create-time") {
        urlPart = "/by-create-time";
    } else {
        Swal.fire({
            title: "Chọn tiêu chí", 
            html: "Vui lòng chọn một tiêu chí tìm kiếm",
            icon: "warning",
            timer: 2000,
            showCancelButton: false,
        });
        return;
    }

    let startDate, endDate;

    try {
        // Lấy giá trị ngày giờ từ picker và kiểm tra định dạng ISO
        startDate = dateRangePicker.data('daterangepicker').startDate.format('YYYY-MM-DDTHH:mm:ss');
        endDate = dateRangePicker.data('daterangepicker').endDate.format('YYYY-MM-DDTHH:mm:ss');

        // Chuyển sang Date để kiểm tra tính hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Nếu ngày không hợp lệ, báo lỗi bằng Swal
        if (isNaN(start) || isNaN(end)) {
            return Swal.fire({
                icon: 'error',
                title: 'Lỗi định dạng',
                html: 'Ngày giờ không hợp lệ. Vui lòng kiểm tra lại!',
                timer: 3000,
                showCancelButton: false
            });
        }

        // Nếu start > end, hoán đổi hai ngày
        if (start > end) {
            [startDate, endDate] = [endDate, startDate];  // Hoán đổi
        }
    } catch (error) {
        // Báo lỗi nếu có ngoại lệ trong quá trình xử lý
        Swal.fire({
            icon: 'error',
            title: 'Lỗi không xác định',
            html: 'Có lỗi xảy ra trong quá trình xử lý thời gian đã chọn!',
            timer: 3000,
            showCancelButton: false
        });
    }

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/appointment"+ urlPart +`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Đã xảy ra lỗi", 
            html: utils.getXHRInfo(error).message,
            icon: "error",
            timer: 3000,
            showCancelButton: false,
        });
        return;
    }

    if (!res) return;

    if (res.code == 1000) {
        TIMELINE.html("");
        // Nhóm lịch hẹn theo ngày
        const groupedAppointments = {};

        res.data.forEach(appointment => {
            const appointmentDate = new Date(appointment.time);
            const dateString = `${appointmentDate.getDate().toString().padStart(2, '0')}/${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`;

            // Nếu ngày chưa tồn tại trong groupedAppointments, khởi tạo mảng
            if (!groupedAppointments[dateString]) {
                groupedAppointments[dateString] = [];
            }

            // Thêm lịch hẹn vào mảng của ngày tương ứng
            groupedAppointments[dateString].push(appointment);
        });

        // Sắp xếp theo thứ tự ngày mới nhất
        const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));

        // Log ra kết quả
        sortedDates.forEach(date => {

            // Sắp xếp các cuộc hẹn trong cùng một ngày theo thời gian mới nhất
            groupedAppointments[date].sort((a, b) => new Date(b.time) - new Date(a.time));

            TIMELINE.append(`
                <div class="time-label">
                    <span class="bg-info">${date}</span>
                </div>
            `);

            groupedAppointments[date].forEach(appointment => {
                const time = utils.getTimeAsJSON(appointment.time);
                let phoneHtml = "";
                let emailHtml = "";
                let detailsHtml = "";

                if (appointment.customer.phone) {
                    phoneHtml = `<b>SĐT: </b><a id="facility-phone" href="tel:${appointment.customer.phone}" class="text-dark hover-underline">${appointment.customer.phone}</a><br>`
                }

                if (appointment.customer.accounts.length> 0) {
                    emailHtml = `<b>Email: </b><a id="facility-email" href="mailto:${appointment.customer.accounts[0].email}" class="text-dark hover-underline">${appointment.customer.accounts[0].email}</a><br>`
                }

                appointment.details.forEach((val, idx) => {
                    let html = "";
                    html += `<b>- ${val.serviceName}</b> ${val.optionName ? `(${val.optionName})` : ""}<br>`
                    detailsHtml += html;
                })

                let footerHtml = "";
                let statusHtml = "";

                if (appointment.status == 0) { // Chưa gọi xác nhận
                    footerHtml = `
                        <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                        <button class="btn btn-primary btn-sm appointment-confirm-btn mr-1" data-id=${appointment.id}>Xác nhận</button>
                        <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                    `;
                    statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chờ xác nhận</span>`
                    if (new Date(appointment.time) < new Date()) { // Quá giờ
                        statusHtml = `<span class="mx-1 badge badge-warning"><i class="fa-regular fa-clock"></i>&nbsp;Chưa xác nhận, đã quá giờ</span>`
                    }
                } else if (appointment.status == 1) { // Đã gọi xác nhận
                    footerHtml = `
                        <button class="btn btn-warning btn-sm appointment-edit-btn mr-1" data-id=${appointment.id}>Chỉnh sửa</button>
                        <button class="btn btn-primary btn-sm appointment-complete-btn mr-1" data-id=${appointment.id}>Đã hoàn thành</button>
                        <button class="btn btn-danger btn-sm appointment-cancel-btn mr-1" data-id=${appointment.id}>Hủy hẹn</button>
                    `;
                    statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận</span>`
                    if (new Date(appointment.time) < new Date()) { // Đã qua giờ hẹn
                        footerHtml += `<button class="btn btn-outline-danger btn-sm appointment-missed-btn" data-id=${appointment.id}>Đã bỏ lỡ</button>`;
                        statusHtml = `<span class="mx-1 badge badge-info"><i class="fa-solid fa-check"></i>&nbsp;Đã xác nhận, đã quá giờ</span>`
                    }
                } else if (appointment.status == 2) { // Đã thi công hoàn tất
                    statusHtml = `<span class="mx-1 badge badge-success"><i class="fa-solid fa-check-double"></i>&nbsp;Đã xác nhận</span>` // fa-regular fa-square-check
                } else if (appointment.status == 3) { // Đã bỏ lỡ
                    statusHtml = `<span class="mx-1 badge badge-secondary"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;Đã bỏ lỡ</span>`
                } else {
                    statusHtml = `<span class="mx-1 badge badge-dark"><i class="fa-solid fa-xmark"></i>&nbsp;Đã hủy hẹn</span>`
                }

                let html = `
                    <div>
                        <i class="fas fa-envelope bg-blue"></i>
                        <div class="timeline-item">
                            <span class="time"><i class="fas fa-clock"></i> ${time.hour}:${time.min}</span>
                            <h3 class="timeline-header">Lịch hẹn của <b>${appointment.customer.name}</b> ${statusHtml}</h3>

                            <div class="timeline-body">
                                <b style="text-decoration: underline">Thông tin khách hàng:</b><br>
                                <div class="px-3">
                                    ${phoneHtml}
                                    ${emailHtml}
                                </div>
                                <br>
                                <i class="fa-regular fa-rectangle-list"></i> <b style="text-decoration: underline">Dịch vụ đã chọn:</b><br>
                                <div class="px-3">${detailsHtml}</div>

                                <br>
                                <b style="text-decoration: underline">Ghi chú:</b><br>
                                <div class="px-3">${appointment.description ? appointment.description : "Không có ghi chú."}</div>
                            </div>
                            <div class="timeline-footer">
                                ${footerHtml}
                            </div>
                        </div>
                    </div>
                `;
                TIMELINE.append(html);
            });
        });

        TIMELINE.append(`<div>
                            <i class="fas fa-clock bg-gray"></i>
                        </div>`)
    }
    else {
        console.error(res);
    }
    Swal.close();
}

$(document).on('click', '.appointment-confirm-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Xác nhận đặt hẹn",
        text: "Người dùng đã xác nhận đặt hẹn và các dịch vụ?",
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
        url: "/api/appointment/update-status?appointment=" +id+"&status=1",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Đã cập nhật!",
                    text: "Đã xác nhận đặt hẹn thành công!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xr, status, error) {
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-cancel-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Hủy cuộc hẹn",
        text: "Xác nhận hủy cuộc hẹn này?",
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
        url: "/api/appointment/update-status?appointment=" +id+"&status=4",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Đã hủy cuộc hẹn!",
                    text: "Đã hủy cuộc hẹn thành công!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xr, status, error) {
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-missed-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Cuộc hẹn đã bị bỏ lỡ?",
        text: "Xác nhận khách hàng đã bỏ lỡ cuộc hẹn này?",
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
        url: "/api/appointment/update-status?appointment=" +id+"&status=3",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    text: "Đã cập nhật cuộc hẹn bị bỏ lỡ!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xr, status, error) {
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$(document).on('click', '.appointment-complete-btn', async function () {
    const id = $(this).data('id');

    let warning = await Swal.fire({
        title: "Cuộc hẹn đã diễn ra",
        text: "Xác nhận cuộc hẹn đã diễn ra?",
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
        url: "/api/appointment/update-status?appointment=" +id+"&status=2",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    text: "Đã cập nhật cuộc hẹn đã diễn ra!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xr, status, error) {
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});

// Hàm định dạng option với name bên trái và price bên phải
function formatOption(state) {
    if (!state.id) {
        return state.text;
    }
    const price = $(state.element).data("price");
    return $(
        `<div class="d-flex justify-content-between">
            <span>${state.text}</span>
            <small class="align-text-bottomtext-muted">${price}</small>
        </div>`
    );
}

$(document).on('click', '.appointment-edit-btn', async function () {
    const id = $(this).data('id');

    Swal.showLoading();

    if (serviceOptionList.length == 0) {
        await $.ajax({
            type: "GET",
            url: "/api/services/enable-with-price",
            dataType: "json",
            headers: utils.defaultHeaders(),
            success: function (res) {
                if (res.code == 1000 && res.data) {
                    serviceOptionList = res.data;
                }
            },
            error: function (xhr, status, error) {
                console.error(utils.getXHRInfo(xhr));
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(response.code)
                });
                return;
            },
        });
    }

    let response;
    try {
        response = await $.ajax({
            type: "GET",
            url: "/api/appointment/"+id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });    
    } catch (error) {
        console.error(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(error).message,
        });
        return;
    }

    if (!response) return;

    if (!response.code === 1000) {
        Swal.close();
        console.error(response);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(response.code)
        });
        return;
    }

    let appointment = response.data;

    clear_modal();
    $('#modal_id').modal({
        backdrop: 'static', // Ngăn đóng khi click bên ngoài
        keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $(".modal-dialog").addClass("modal-lg");
    $("#modal_title").text("Chỉnh sửa thông tin đặt hẹn");
    $("#modal_body").append(`
        <div class="form-group">
            <label>Chọn dịch vụ và Tùy chọn (option)</label><br>
            <div id="service-wrapper" class="mt-2">
            </div>
            <button type="button" id="add-service-btn" class="btn btn-sm btn-outline-success">Thêm dịch vụ</button>
        </div>
    `);

    if (appointment.details.length != 0) {
        $.each(appointment.details, function (idx, detail) {
            const newRow = $(`
                <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                    <div class="col-12 col-md-6 mb-1 mb-md-0">
                        <select class="form-control select2bs4 modal-service-select" width="100%" required 
                        data-placeholder="Chọn dịch vụ"></select>
                    </div>
        
                    <div class="col-12 col-md-5 mb-1 mb-md-0">
                        <select class="form-control select2bs4 modal-option-select" width="100%" required 
                        data-placeholder="Chọn option"></select>
                    </div>

                    <div class="col-12 col-md-1 mb-1 mb-md-0 d-flex justify-content-center">
                        <button class="btn btn-sm btn-danger remove-service-btn w-100">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </button>
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
                $serviceSelect.append(
                    `<option value="${val.id}">${val.name}</option>`
                );
            });

            // Thêm sự kiện cho service-select và xử lý option-select
            newRow.find(".modal-service-select").on("change", function () {
                let id = $(this).val();
                const wrapper = $(this).closest(".service-option-wrapper");
                const $optionSelect = wrapper.find(".modal-option-select");
                if (id == null) {
                    $optionSelect.empty();
                    return;
                }

                const listOptionPrices = serviceOptionList.find(
                    (item) => item.id == id
                );
                $optionSelect.empty(); // Đảm bảo xóa các option cũ

                $.each(listOptionPrices.optionPrices, function (idx, val) {
                    const option = new Option(val.name, val.id, false, false);
                    $(option).attr(
                        "data-price",
                        utils.formatVNDCurrency(val.price)
                    );
                    $optionSelect.append(option);
                });
                $optionSelect.val("").trigger("change");

                // Khởi tạo Select2 với template tùy chỉnh cho option
                $optionSelect.select2({
                    templateResult: formatOption,
                    templateSelection: formatOption,
                    width: "100%",
                    theme: "bootstrap",
                });
            });

            $serviceSelect.val(detail.service.id).trigger("change");
            if (detail.option) {
                $optionSelect.val(detail.option.id).trigger("change");
            }
        });
    }

    $("#add-service-btn").click(function (e) {
        const newRow = $(`
            <div class="row my-2 pt-1 pb-2 border-bottom service-option-wrapper">
                <div class="col-12 col-md-6 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-service-select" width="100%" required 
                    data-placeholder="Chọn dịch vụ"></select>
                </div>
    
                <div class="col-12 col-md-5 mb-1 mb-md-0">
                    <select class="form-control select2bs4 modal-option-select" width="100%" required 
                    data-placeholder="Chọn option"></select>
                </div>

                <div class="col-12 col-md-1 mb-1 mb-md-0 d-flex justify-content-center">
                    <button class="btn btn-sm btn-danger remove-service-btn w-100">
                        <i class="fa-regular fa-circle-xmark fa-lg"></i>
                    </button>
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
            $serviceSelect.append(
                `<option value="${val.id}">${val.name}</option>`
            );
        });
        $serviceSelect.val("").trigger("change");

        // Thêm sự kiện cho service-select và xử lý option-select
        newRow.find(".modal-service-select").on("change", function () {
            let id = $(this).val();
            const wrapper = $(this).closest(".service-option-wrapper");
            const $optionSelect = wrapper.find(".modal-option-select");
            if (id == null) {
                $optionSelect.empty();
                return;
            }

            const listOptionPrices = serviceOptionList.find(
                (item) => item.id == id
            );
            $optionSelect.empty(); // Đảm bảo xóa các option cũ

            $.each(listOptionPrices.optionPrices, function (idx, val) {
                const option = new Option(val.name, val.id, false, false);
                $(option).attr(
                    "data-price",
                    utils.formatVNDCurrency(val.price)
                );
                $optionSelect.append(option);
            });
            $optionSelect.val("").trigger("change");

            // Khởi tạo Select2 với template tùy chỉnh cho option
            $optionSelect.select2({
                templateResult: formatOption,
                templateSelection: formatOption,
                width: "100%",
                theme: "bootstrap",
            });
        });
    });

    $("#modal_body").on("click", ".remove-service-btn", function () {
        var totalRows = $("#service-wrapper .row").length;

        if (totalRows == 1) {
            Toast.fire({
                icon: "warning",
                title: "Không thể xóa! Phải có ít nhất một dịch vụ",
            });
            return;
        } else {
            $(this).closest(".row").remove();
        }

        $(this).closest(".row").remove();
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    Swal.close();

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function () {

        let description = $("#modal_description_input").val().trim();

        let serviceOptions = [];
        var hasError = false; // Biến cờ để theo dõi lỗi

        // Duyệt qua từng phần tử trong #service-wrapper
        $("#service-wrapper .row").each(function () {
            var selectedService = $(this).find(".modal-service-select").val();
            var selectedOption = $(this).find(".modal-option-select").val() || null;

            if (selectedService == null) {
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn dịch vụ",
                });
                hasError = true; // Đặt cờ lỗi
                return;
            }
            
            serviceOptions.push({
                serviceId: selectedService,
                optionId: selectedOption,
            });
        });

        if (hasError) {
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/detail/" + selectedInvoice.id,
            headers: utils.defaultHeaders(),
            data: JSON.stringify(
                serviceOptions.map((detail) => ({
                    serviceId: detail.serviceId,
                    optionId: detail.optionId,
                    discount: detail.discount,
                    quantity: detail.quantity,
                }))
            ),
            beforeSend: function () {
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
    });

    return;

    let warning = await Swal.fire({
        title: "Cuộc hẹn đã diễn ra",
        text: "Xác nhận cuộc hẹn đã diễn ra?",
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
        url: "/api/appointment/update-status?appointment=" +id+"&status=2",
        headers: utils.defaultHeaders(),
        dataType: "json",
        beforeSend: function() {
            Swal.showLoading();
        },
        success: async function (res) {
            Swal.close();
            if (res.code == 1000 && res.data) {
                await loadListAppointment();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    text: "Đã cập nhật cuộc hẹn đã diễn ra!",
                    showCancelButton: false,
                    timer: 3000
                });
            } else {
                console.error(res);
                Swal.fire({
                    icon: 'error',
                    title: "Đã xảy ra lỗi",
                    text: utils.getErrorMessage(res.code),
                });
            }
        },
        error: function(xr, status, error) {
            console.error(xhr);
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
            });
        }
    });
});