import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_PARAM');

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
    $('.reservationtime').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,   // Sử dụng định dạng 24 giờ
        timePickerIncrement: 10,
        autoUpdateInput: false,   // Không tự động cập nhật input cho đến khi nhấn "Chọn"
        // maxSpan: {
        //     days: 31  // Giới hạn không quá 7 ngày
        // },
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

    // Đặt giá trị mặc định ban đầu cho startOfDay và endOfDay
    let startOfDay = moment().subtract(6, 'days').startOf('day');  // 0h hôm nay
    let endOfDay = moment().endOf('day');      // 23:59 hôm nay

    // Truy xuất instance daterangepicker
    const picker = $('.reservationtime').data('daterangepicker');

    picker.setStartDate(startOfDay);
    picker.setEndDate(endOfDay);

    // Cập nhật input với range mặc định ngay khi khởi tạo
    $('.reservationtime').val(
        startOfDay.format('HH:mm, DD/MM/YYYY') +
        ' đến ' +
        endOfDay.format('HH:mm, DD/MM/YYYY')
    );

     // Sự kiện khi nhấn "Chọn"
     $('.reservationtime').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(
            picker.startDate.format('HH:mm, DD/MM/YYYY') +
            ' đến ' +
            picker.endDate.format('HH:mm, DD/MM/YYYY')
        );
    });

    // Sự kiện khi nhấn "Hủy" hoặc click ra ngoài
    $('.reservationtime').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });


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
            url: "/api/common-param/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            beforeSend: xhr => {
                const headers = utils.defaultHeaders(); // Lấy headers từ defaultHeaders()
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key]); // Thiết lập từng header
                }
            },
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

$(document).on('click', '.get-info', async function () {
    let dateRangePicker = $(this).closest('.col-12').find('.reservationtime');
    let infoTag = $(this).closest('.col-12').find('p');

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
        return;
    }

    let res;

    let urlPart= "";
    if ($(this).attr('id') === 'pre-service-get-btn') {
        urlPart = '/pre-service';
    } else if ($(this).attr('id') === 'post-service-get-btn') {
        urlPart = '/post-service';
    }

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/service-images/statistics" + urlPart +`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
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

    Swal.isLoading() && Swal.close();
    if (!res) return;

    if (res.code == 1000) {
        let html = `<b>Số lượng hình:</b> ${res.data.totalImages}<br><b>Dung lượng bộ nhớ:</b> ${res.data.totalSize}MB`;
        $(infoTag).html(html)
    }
    else {
        Swal.close()
        console.error(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code)
        });
    }
});

$(document).on('click', '.delete-images', async function () {
    let dateRangePicker = $(this).closest('.col-12').find('.reservationtime');
    let reloadBtn = $(this).closest('.col-12').find('.get-info');

    let startDate, endDate;
    
    // Định dạng ngày theo dd/MM/yyyy
    let formattedStartDate;
    let formattedEndDate;

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

        formattedStartDate = start.toLocaleDateString('vi-VN');
        formattedEndDate = end.toLocaleDateString('vi-VN');
    } catch (error) {
        // Báo lỗi nếu có ngoại lệ trong quá trình xử lý
        Swal.fire({
            icon: 'error',
            title: 'Lỗi không xác định',
            html: 'Có lỗi xảy ra trong quá trình xử lý thời gian đã chọn!',
            timer: 3000,
            showCancelButton: false
        });
        return;
    }

    let warning = await Swal.fire({
        icon: 'warning',
        title: 'Xóa hình ảnh?',
        html: `Xóa tất cả hình ảnh<br>từ ngày <b>${formattedStartDate}</b> đến ngày <b>${formattedEndDate}</b>?`,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    });

    if (!warning.isConfirmed) {
        return;
    }

    let res;

    let urlPart= "";
    if ($(this).attr('id') === 'pre-service-delete-btn') {
        urlPart = '/clear-pre-service-image';
    } else if ($(this).attr('id') === 'post-service-delete-btn') {
        urlPart = '/clear-post-service-image';
    }

    try {
        res = await $.ajax({
            type: "DELETE",
            url: "/api/service-images" + urlPart +`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
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

    Swal.close();
    if (!res) return;

    if (res.code == 1000 && res.data) {
        await $(reloadBtn).trigger('click');
        Swal.fire({
            icon: "success",
            title: "Đã xóa hình ảnh",
            html: `Đã xóa hình ảnh<br>từ ngày <b>${formattedStartDate}</b> đến ngày <b>${formattedEndDate}</b>`
        });
    }
    else {
        Swal.close
        console.error(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code)
        });
    }
});

$(document).on('click', '#invalidated-token-get-btn', async function () {
    let dateRangePicker = $(this).closest('.col-12').find('.reservationtime');
    let infoTag = $(this).closest('.col-12').find('p');

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
        return;
    }

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/auth/count-invalidated-token"+`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
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

    Swal.isLoading() && Swal.close();
    if (!res) return;

    if (res.code == 1000) {
        let html = `<b>Số lượng token:</b> ${res.data}`;
        $(infoTag).html(html)
    }
    else {
        Swal.close();
        console.error(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code)
        });
    }
});

$(document).on('click', '#invalidated-token-delete-btn', async function () {
    let dateRangePicker = $(this).closest('.col-12').find('.reservationtime');
    let reloadBtn = $(this).closest('.col-12').find('#invalidated-token-get-btn');

    let startDate, endDate;

    // Định dạng ngày theo dd/MM/yyyy
    let formattedStartDate;
    let formattedEndDate;

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

        formattedStartDate = start.toLocaleDateString('vi-VN');
        formattedEndDate = end.toLocaleDateString('vi-VN');
    } catch (error) {
        // Báo lỗi nếu có ngoại lệ trong quá trình xử lý
        Swal.fire({
            icon: 'error',
            title: 'Lỗi không xác định',
            html: 'Có lỗi xảy ra trong quá trình xử lý thời gian đã chọn!',
            timer: 3000,
            showCancelButton: false
        });
        return;
    }

    let warning = await Swal.fire({
        icon: 'warning',
        title: 'Xóa token không hợp lệ?',
        html: `Xóa tất cả token không hợp lệ<br>từ ngày <b>${formattedStartDate}</b> đến ngày <b>${formattedEndDate}</b>?`,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    });

    if (!warning.isConfirmed) {
        return;
    }

    let res;

    try {
        res = await $.ajax({
            type: "DELETE",
            url: "/api/auth/delete-invalidated-token"+`?start=${startDate}&end=${endDate}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
            beforeSend: function() {
                Swal.showLoading();
            },
        });
    } catch (error) {
        Swal.close();
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

    Swal.close();
    if (!res) return;

    if (res.code == 1000 && res.data) {
        await $(reloadBtn).trigger('click');
        Swal.fire({
            icon: "success",
            title: "Đã xóa các token",
            html: `Đã xóa các token không hợp lệ<br>từ ngày <b>${formattedStartDate}</b> đến ngày <b>${formattedEndDate}</b>`
        });
    }
    else {
        Swal.close
        console.error(res);
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getErrorMessage(res.code)
        });
    }
});