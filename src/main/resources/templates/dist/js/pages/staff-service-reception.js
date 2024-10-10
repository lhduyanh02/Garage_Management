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

var dataTable;
var historyTable;
var plateTypeSelect = $("#plate-type-select");
    
$(document).ready(function () {
    historyTable = $("#service-history-table").DataTable({
        responsive: true,
        pageLength: 4,
        lengthChange: false,
        autoWidth: false,
        searching: false,
        language: {
            paginate: {
                next: "&raquo;",
                previous: "&laquo;"
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "Không có dữ liệu để hiển thị",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
        },
        buttons: false,
        columnDefs: [
            { orderable: false, targets: 0 }, // Vô hiệu hóa sort cho cột Thao tác (index 4)
            { className: "text-center", targets: 0 },
        ],
        // ajax: {
        //     type: "GET",
        //     url: "/api/services/all-with-price",
        //     dataType: "json",
        //     headers: utils.defaultHeaders(),
        //     dataSrc: function (res) {
        //         if (res.code == 1000) {
        //             var data = [];
        //             var counter = 1;
        //             res.data.forEach(function (service) {
        //                 data.push({
        //                     number: counter++, // Số thứ tự tự động tăng
        //                     id: service.id,
        //                     name: service.name,
        //                     description: service.description,
        //                     status: service.status,
        //                     optionPrices: service.optionPrices,
        //                 });
        //             });

        //             return data; // Trả về dữ liệu đã được xử lý
        //         } else {
        //             Toast.fire({
        //                 icon: "error",
        //                 title: res.message || "Lỗi! Không thể lấy dữ liệu",
        //             });
        //         }
        //     },
        //     error: function (xhr, status, error) {
        //         var message = "Lỗi không xác định";
        //         try {
        //             var response = JSON.parse(xhr.responseText);
        //             if (response.code) {
        //                 message = utils.getErrorMessage(response.code);
        //             }
        //         } catch (e) {
        //             // Lỗi khi parse JSON
        //             console.log("JSON parse error");
        //             message = "Lỗi không xác định";
        //         }
        //         Toast.fire({
        //             icon: "error",
        //             title: message,
        //         });
        //     },
        // },
        // columns: [
        //     { data: "number" },
        //     {
        //         data: "name",
        //         render: function (data, type, row) {
        //             let html = "";
        //             html += `<b>${data}<br></b>`;
        //             if (row.description != "") {
        //                 html += `<i><u>Mô tả:<br></u></i> <div">${row.description.replace("\n", "<br>")}<br></div>`;
        //             }

        //             return html;
        //         },
        //     },
        //     {
        //         data: "optionPrices",
        //         render: function (data, type, row) {
        //             if (data.length == 0) {
        //                 return "<i>Chưa có tùy chọn nào</i>";
        //             } else {
        //                 let html = "";
        //                 $.each(data, function (idx, val) {
        //                     if (val.status == 1) {
        //                         html += `
        //                         <details>
        //                             <summary><b>${
        //                                 val.name
        //                             } <span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang áp dụng</span></b></summary>
        //                             <p>
        //                                 - Giá: ${val.price.toLocaleString(
        //                                     "vi-VN",
        //                                     {
        //                                         style: "currency",
        //                                         currency: "VND",
        //                                     }
        //                                 )}<br>
        //                             </p>
        //                         </details>
        //                         `;
        //                     } else {
        //                         html += `
        //                                 <b>${val.name} <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng áp dụng</span><br></b>
        //                                 - Giá: ${val.price}<br><br>
        //                         `;
        //                     }
        //                 });

        //                 return html;
        //             }
        //         },
        //     },
        //     {
        //         data: "status",
        //         render: function (data, type, row) {
        //             if (data == 1) {
        //                 return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang sử dụng</span></center>';
        //             } else if (data == 0) {
        //                 return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
        //             } else if (data == -1) {
        //                 return '<center><span class="badge badge-secondary"><i class="fa-solid fa-xmark"></i>&nbsp;Đã xóa</span></center>';
        //             }
        //         },
        //     },
        //     {
        //         data: "id",
        //         render: function (data, type, row) {
        //             let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
        //                 <i class="fas fa-pencil-alt"></i></a>`;

        //             if (row.status == 1) {
        //                 html += ` <a class="btn btn-warning btn-sm" style="padding: .25rem 0.4rem;" id="disableBtn" data-id="${data}">
        //                     <i class="fa-regular fa-circle-xmark fa-lg"></i></a>`;
        //             } else if (row.status == 0) {
        //                 html += ` <a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
        //                     <i class="fa-regular fa-circle-check fa-lg"></i></a> 
        //                     <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
        //                     <i class="fas fa-trash"></i></a>`;
        //             }
        //             if (row.status == -1) {
        //                 html = `<a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
        //                     <i class="fa-solid fa-recycle fa-lg"></i></a>`;
        //             }
        //             return "<center>" + html + "</center>";
        //         },
        //     },
        // ],
        // drawCallback: function (settings) {
        //     // Số thứ tự không thay đổi khi sort hoặc paginations
        //     var api = this.api();
        //     var start = api.page.info().start;
        //     api.column(0, { page: "current" })
        //         .nodes()
        //         .each(function (cell, i) {
        //             cell.innerHTML = start + i + 1;
        //         });
        // },
        // initComplete: function () {
        //     this.api()
        //         .buttons()
        //         .container()
        //         .appendTo("#data-table_wrapper .col-md-6:eq(0)");
        //     $('#data-table tbody').on('dblclick', 'td:nth-child(3)', function () {
        //         var row = $(this).closest('tr');
            
        //         // Tìm tất cả các thẻ <details> trong hàng đó và chuyển đổi trạng thái mở/đóng
        //         row.find('details').each(function () {
        //             if ($(this).attr('open')) {
        //                 $(this).removeAttr('open');
        //             } else {
        //                 $(this).attr('open', true);
        //             }
        //         });
        //     });
        // },
    });
});


$("#num-plate-search-input").keydown(function (e) { 
    if (e.keyCode === 13) {
        loadData();
    }

});
  
$("#num-plate-search-btn").click(function (e) { 
    loadData();
});

function loadData() {
    let numPlate = $("#num-plate-search-input").val().trim();

    if (numPlate == ""){
        Toast.fire({
            icon: "warning",
            title: "Hãy biển số bạn cần tìm"
        });
        return;
    }

    

}