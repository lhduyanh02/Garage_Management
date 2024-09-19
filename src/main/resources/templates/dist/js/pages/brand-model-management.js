import * as utils from '/dist/js/utils.js';

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// utils.introspect();

var dataTable;
var dataTableCard = $('#data-table-card');

$(document).ready(function () {
  dataTable = $("#data-table").DataTable({
    responsive: true,
    lengthChange: true,
    autoWidth: false,
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
      { orderable: false, targets: 3 }, // Vô hiệu hóa sort cho cột Thao tác (index 3)
      { className: "text-center", targets: 0 },
    ],
    ajax: {
      type: "GET",
      url: "/api/brands/fetch-model",
      dataType: "json",
      dataSrc: function (res) {
        if (res.code == 1000) {
          var data = [];
          var counter = 1;
          res.data.forEach(function (brandItem) {
            brandItem.models.forEach(function (modelItem) {
              data.push({
                number: counter++, // Số thứ tự tự động tăng
                brand: brandItem.brand, // Hãng xe
                model: modelItem.model, // Mẫu xe
                id: modelItem.id, // ID của model (dùng cho cột Thao tác)
              });
            });
          });

          return data; // Trả về dữ liệu đã được xử lý
        } else {
          Toast.fire({
            icon: "error",
            title: res.message || "Error in fetching data",
          });
        }
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Internal server error",
        });
      },
    },
    columns: [
      { data: "number" },
      { data: "brand" },
      { data: "model" },
      {
        data: "id",
        render: function (data, type, row) {
          return (
            '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
            data +
            '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-success btn-sm" data-id="' +
            data +
            '" id="activeBtn"><i class="fa-solid fa-user-check"></i></a> <a class="btn btn-danger btn-sm" data-id="' +
            data +
            '" id="deleteBtn"><i class="fa-solid fa-trash"></i></a></center>'
          );
        },
      },
    ],
    drawCallback: function (settings) {
      // Số thứ tự không thay đổi khi sort hoặc paginations
      var api = this.api();
      var start = api.page.info().start;
      api
        .column(0, { page: "current" })
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

$('#tableCollapseBtn').click(function (e) { 
    if(dataTableCard.hasClass('collapsed-card')){
        dataTable.ajax.reload();    
    }
});

