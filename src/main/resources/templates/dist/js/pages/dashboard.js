import * as utils from "/dist/js/utils.js";

var token = utils.getCookie("authToken");

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
});

var serviceDataTable;
var serviceList = [];

$(function () {
    "use strict";

    $.ajax({
        url: "/api/users/get-quantity", // Thay đổi URL theo API thực tế của bạn
        type: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        success: function (res) {
            if (res.code == 1000) {
                $("#user_quantity").text(res.data);
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
        },
    });

    $.ajax({
        type: "GET",
        url: "/api/cars/get-quantity",
        headers: utils.noAuthHeaders(),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000) {
                $("#car_quantity").text(res.data);
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
        },
    });

    $.ajax({
        type: "GET",
        url: "/api/history/get-quantity",
        headers: utils.noAuthHeaders(),
        dataType: "json",
        success: function (res) {
            if (res.code == 1000) {
                $("#history_quantity").text(res.data);
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
        },
    });

    serviceDataTable = $("#services-table").DataTable({
        responsive: true,
        lengthChange: true,
        autoWidth: false,
        pageLength: 5, 
        lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "Tất cả"] ],
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
            search: "Tìm kiếm dịch vụ:",
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
            { targets: 0, width: "5%", class: "text-center"},       // Số thứ tự
            { targets: 1, width: "23%" },      // Tên dịch vụ
            { targets: 2,  },      // Tên tùy chọn width: "15%"
            // { targets: 3, width: "10%", class: "text-right" },      // Giá tùy chọn
            { targets: 3, width: "37%" },      // Mô tả
        ],
        ajax: {
            type: "GET",
            url: "/api/services/enable-with-price",
            dataType: "json",
            headers: utils.noAuthHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000 && res.data) {
                    serviceList = res.data;
                    var data = [];
                    var counter = 0;
                    var serviceCounter = 1;
                    res.data.forEach(function (service) {
                        serviceCounter++;
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: service.id,
                            name: service.name,
                            description: service.description,
                            status: service.status,
                            optionPrices: service.optionPrices,
                        });
                    });
                    $('#service_quantity').text(serviceCounter);

                    return data;
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
                    title: utils.getXHRInfo(xhr).message,
                });
            },
        },
        columns: [
            { data: null },
            {
                data: "name",
                render: function (data, type, row) {
                    return `<b>${data}</b>`;
                },
            },
            {
                data: "optionPrices",
                render: function (data, type, row) {
                    let html = "";

                    if (data.length > 0) {
                        html += `<div class="table-responsive">
                        <table class="table mb-0" style="border-collapse: collapse;">`;

                        data.forEach(function (val) {
                            html += `
                            <tr class="row w-100" style="background-color: transparent;">
                                <th class="col-12 col-lg-5 d-inline-block py-1 px-2 px-lg-2 border-0">${val.name}</th>
                                <td class="col-12 col-lg-5 d-inline-block py-1 px-2 px-lg-2 border-0 text-right">${utils.formatVNDCurrency(val.price)}</td>
                            </tr>`
                        });
                        html += `</table></div>`;
                    }

                    return html;
                },
            },
            // {
            //     data: "optionPrice",
            //     render: function (data, type, row) {
            //         if (data) {
            //             if (type === "display" || type === "filter") {
            //                 // Hiển thị số tiền theo định dạng tiền tệ VN
            //                 return data.price.toLocaleString("vi-VN", {
            //                     style: "currency",
            //                     currency: "VND",
            //                 });
            //             }
            //             // Trả về giá trị nguyên gốc cho sorting và searching
            //             return data.price;
            //         }
            //         return "";
            //     },
            // },
            {
                data: "description",
                render: function (data, type, row) {
                    if (data) {
                        return `<div class="d-inline-block">${data.replace("\n","<br>")}</div>`
                    }
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

    

    var salesChartCanvas = $("#salesChart").get(0).getContext("2d");

    var salesChartData = {
        labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
        ],
        datasets: [
            {
                label: "Digital Goods",
                backgroundColor: "rgba(60,141,188, 0.8)",
                borderColor: "rgba(60,141,188,0.8)",
                pointRadius: true,
                pointColor: "#3b8bba",
                pointStrokeColor: "rgba(60,141,188,1)",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(60,141,188,1)",
                data: [28, 48, 40, 19, 86, 27, 90],
            },
            {
                label: "Electronics",
                backgroundColor: "rgba(210, 214, 222, 1)",
                borderColor: "rgba(210, 214, 222, 1)",
                pointRadius: true,
                pointColor: "rgba(210, 214, 222, 1)",
                pointStrokeColor: "#c1c7d1",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [65, 59, 80, 81, 56, 55, 40],
            },
        ],
    };

    var salesChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
            display: false,
        },
        scales: {
            xAxes: [
                {
                    gridLines: {
                        display: false,
                    },
                },
            ],
            yAxes: [
                {
                    gridLines: {
                        display: false,
                    },
                },
            ],
        },
    };

    // This will get the first returned node in the jQuery collection.
    // eslint-disable-next-line no-unused-vars
    var salesChart = new Chart(salesChartCanvas, {
        type: "line",
        data: salesChartData,
        options: salesChartOptions,
    });






    

    //---------------------------
    // - END MONTHLY SALES CHART -
    //---------------------------

    //-------------
    // - PIE CHART -
    //-------------
    // Get context with jQuery - using jQuery's .get() method.
    var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
    var pieData = {
        labels: ["Chrome", "IE", "FireFox", "Safari", "Opera", "Navigator"],
        datasets: [
            {
                data: [700, 500, 400, 600, 300, 100],
                backgroundColor: [
                    "#f56954",
                    "#00a65a",
                    "#f39c12",
                    "#00c0ef",
                    "#3c8dbc",
                    "#d2d6de",
                ],
            },
        ],
    };
    var pieOptions = {
        legend: {
            display: false,
        },
    };
    // Create pie or douhnut chart
    // You can switch between pie and douhnut using the method below.
    // eslint-disable-next-line no-unused-vars
    var pieChart = new Chart(pieChartCanvas, {
        type: "doughnut",
        data: pieData,
        options: pieOptions,
    });

    //-----------------
    // - END PIE CHART -
    //-----------------

    /* jVector Maps
     * ------------
     * Create a world map with markers
     */
    $("#world-map-markers").mapael({
        map: {
            name: "usa_states",
            zoom: {
                enabled: true,
                maxLevel: 10,
            },
        },
    });

    // $('#world-map-markers').vectorMap({
    //   map              : 'world_en',
    //   normalizeFunction: 'polynomial',
    //   hoverOpacity     : 0.7,
    //   hoverColor       : false,
    //   backgroundColor  : 'transparent',
    //   regionStyle      : {
    //     initial      : {
    //       fill            : 'rgba(210, 214, 222, 1)',
    //       'fill-opacity'  : 1,
    //       stroke          : 'none',
    //       'stroke-width'  : 0,
    //       'stroke-opacity': 1
    //     },
    //     hover        : {
    //       'fill-opacity': 0.7,
    //       cursor        : 'pointer'
    //     },
    //     selected     : {
    //       fill: 'yellow'
    //     },
    //     selectedHover: {}
    //   },
    //   markerStyle      : {
    //     initial: {
    //       fill  : '#00a65a',
    //       stroke: '#111'
    //     }
    //   },
    //   markers          : [
    //     {
    //       latLng: [41.90, 12.45],
    //       name  : 'Vatican City'
    //     },
    //     {
    //       latLng: [43.73, 7.41],
    //       name  : 'Monaco'
    //     },
    //     {
    //       latLng: [-0.52, 166.93],
    //       name  : 'Nauru'
    //     },
    //     {
    //       latLng: [-8.51, 179.21],
    //       name  : 'Tuvalu'
    //     },
    //     {
    //       latLng: [43.93, 12.46],
    //       name  : 'San Marino'
    //     },
    //     {
    //       latLng: [47.14, 9.52],
    //       name  : 'Liechtenstein'
    //     },
    //     {
    //       latLng: [7.11, 171.06],
    //       name  : 'Marshall Islands'
    //     },
    //     {
    //       latLng: [17.3, -62.73],
    //       name  : 'Saint Kitts and Nevis'
    //     },
    //     {
    //       latLng: [3.2, 73.22],
    //       name  : 'Maldives'
    //     },
    //     {
    //       latLng: [35.88, 14.5],
    //       name  : 'Malta'
    //     },
    //     {
    //       latLng: [12.05, -61.75],
    //       name  : 'Grenada'
    //     },
    //     {
    //       latLng: [13.16, -61.23],
    //       name  : 'Saint Vincent and the Grenadines'
    //     },
    //     {
    //       latLng: [13.16, -59.55],
    //       name  : 'Barbados'
    //     },
    //     {
    //       latLng: [17.11, -61.85],
    //       name  : 'Antigua and Barbuda'
    //     },
    //     {
    //       latLng: [-4.61, 55.45],
    //       name  : 'Seychelles'
    //     },
    //     {
    //       latLng: [7.35, 134.46],
    //       name  : 'Palau'
    //     },
    //     {
    //       latLng: [42.5, 1.51],
    //       name  : 'Andorra'
    //     },
    //     {
    //       latLng: [14.01, -60.98],
    //       name  : 'Saint Lucia'
    //     },
    //     {
    //       latLng: [6.91, 158.18],
    //       name  : 'Federated States of Micronesia'
    //     },
    //     {
    //       latLng: [1.3, 103.8],
    //       name  : 'Singapore'
    //     },
    //     {
    //       latLng: [1.46, 173.03],
    //       name  : 'Kiribati'
    //     },
    //     {
    //       latLng: [-21.13, -175.2],
    //       name  : 'Tonga'
    //     },
    //     {
    //       latLng: [15.3, -61.38],
    //       name  : 'Dominica'
    //     },
    //     {
    //       latLng: [-20.2, 57.5],
    //       name  : 'Mauritius'
    //     },
    //     {
    //       latLng: [26.02, 50.55],
    //       name  : 'Bahrain'
    //     },
    //     {
    //       latLng: [0.33, 6.73],
    //       name  : 'São Tomé and Príncipe'
    //     }
    //   ]
    // })
});

// lgtm [js/unused-local-variable]
