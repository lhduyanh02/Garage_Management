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
            { extend: "print", text: "In" },
            { extend: "colvis", text: "Hiển thị" },
        ],
        columnDefs: [
            { orderable: false, targets: 4 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/common-param/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000 && res.data) {
                    var data = [];
                    var counter = 1;
                    $.each(res.data, function (idx, val) {
                        data.push({
                            number: counter++,
                            id: val.id,
                            key: val.key,
                            description: val.description,
                            value: val.value,
                        });
                    });
                    return data; // Trả về dữ liệu đã được xử lý
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
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        },
        columns: [
            { data: "number" },
            {
                data: "key",
                render: function (data, type, row) {
                    return data;
                },
            },
            {
                data: "description",
                render: function (data, type, row) {
                    let html = "";
                    html += data ? data : "Không có mô tả";
                    return "<i>" + html + "</i>";
                },
            },
            {
                data: "value",
                render: function (data, type, row) {
                    return data;
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;
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

$("#data-table").on("click", "#editBtn", async function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/common-param?id=" + id,
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
                title: `Chỉnh sửa tham số<br>${res.data.key}`,
                input: "text",
                inputAttributes: {
                    autocapitalize: "off",
                },
                inputValue: res.data.value,
                showCancelButton: true,
                cancelButtonText: "Hủy",
                confirmButtonText: "Lưu",
                showLoaderOnConfirm: true,
                preConfirm: async (value) => {
                    try {
                        console.log(value);
                        
                        let response = await $.ajax({
                            type: "PUT",
                            url: "/api/common-param/"+id,
                            headers: utils.defaultHeaders(),
                            data: JSON.stringify({
                                value: value
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
                        html: `Cập nhật thành công giá trị cho tham số<br><b>${res.data.key}</b>`,
                        showConfirmButton: true,
                        confirmButtonText: "OK"
                    });
                    dataTable.ajax.reload();
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
