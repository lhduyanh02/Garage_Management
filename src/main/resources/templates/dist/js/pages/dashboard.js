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
var revenueList = [];

$(async function () {
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

    let thisWeekRevenue = Array(7).fill(0); // Doanh thu tuần này
    let lastWeekRevenue = Array(7).fill(0); // Doanh thu tuần trước
    let thisWeekDateMap = {}; // Map ngày cho tuần này
    let lastWeekDateMap = {}; // Map ngày cho tuần trước
    const weekdays = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]; // Nhãn trục X

    let totalLastWeek = 0;
    let totalThisWeek = 0;

    let res;

    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/daily-revenue" +
                `?start=${moment().startOf('isoWeek').subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss')}` +
                `&end=${moment().endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss')}`,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
    } catch (error) {
        $('#statistics-card').prop('hidden', true);
        console.error(error);
    }

    if (res && res.code === 1000) {
        $('#statistics-card').prop('hidden', false);
        let revenueList = res.data;
    
        // Kiểm tra nếu res.data là một object (Map<LocalDate, Double>)
        if (revenueList && typeof revenueList === "object") {
            // Tính thời gian tuần trước và tuần này
            let startOfLastWeek = moment().startOf('isoWeek').subtract(7, 'days');
            let endOfLastWeek = moment().endOf('isoWeek').subtract(7, 'days');
            let startOfThisWeek = moment().startOf('isoWeek');
            let endOfThisWeek = moment().endOf('isoWeek');
    
            // Duyệt qua Map và phân loại doanh thu theo tuần
            Object.entries(revenueList).forEach(([date, revenue]) => {
                const dayIndex = moment(date).isoWeekday() - 1; // Chỉ số từ 0 đến 6 (Thứ Hai - Chủ Nhật)
    
                // Gán doanh thu vào tuần tương ứng
                if (moment(date).isBetween(startOfLastWeek, endOfLastWeek, 'day', '[]')) {
                    lastWeekRevenue[dayIndex] = revenue;
                    totalLastWeek += revenue;
                    lastWeekDateMap[dayIndex] = moment(date).format('DD/MM/YYYY');
                } else if (moment(date).isBetween(startOfThisWeek, endOfThisWeek, 'day', '[]')) {
                    thisWeekRevenue[dayIndex] = revenue;
                    totalThisWeek += revenue;
                    thisWeekDateMap[dayIndex] = moment(date).format('DD/MM/YYYY');
                }
            });
    
            for (let i = 0; i < 7; i++) {
                const dayOfWeek = moment(startOfThisWeek).add(i, 'days'); // Ngày tuần này
                const dayOfLastWeek = moment(startOfLastWeek).add(i, 'days'); // Ngày tuần trước
            
                // Gán ngày vào map
                thisWeekDateMap[i] = dayOfWeek.format('DD/MM/YYYY');
                lastWeekDateMap[i] = dayOfLastWeek.format('DD/MM/YYYY');
            
                // Doanh thu mặc định là 0 nếu không có dữ liệu
                if (!thisWeekRevenue[i]) {
                    thisWeekRevenue[i] = 0;
                }
                if (!lastWeekRevenue[i]) {
                    lastWeekRevenue[i] = 0;
                }
            }
        } else {
            console.error("Dữ liệu trả về không phải là Map<LocalDate, Double>:", revenueList);
        }
    } else {
        $('#statistics-card').prop('hidden', true);
        console.error(res);
    }

    // Thời gian thống kê
    let startTime = moment().startOf('isoWeek').subtract(7, 'days');
    let endTime = moment().endOf('isoWeek');
    let recapTime = `Thống kê 2 tuần gần nhất (${startTime.format('DD/MM/YYYY')} - ${endTime.format('DD/MM/YYYY')})`;
    $('#recap-time').text(recapTime);

    // Cấu hình dữ liệu cho biểu đồ
    let salesChartData = {
        labels: weekdays, // Dùng Thứ Hai - Chủ Nhật làm nhãn
        datasets: [
            {
                label: "Doanh thu tuần này (VND)",
                backgroundColor: "rgba(60,141,188, 0.7)",
                borderColor: "rgba(60,141,188,0.8)",
                pointRadius: 6,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "rgba(60,141,188,1)",
                data: thisWeekRevenue,
            },
            {
                label: "Doanh thu tuần trước (VND)",
                backgroundColor: "rgba(234, 234, 234, 0.59)",
                borderColor: "rgba(231, 222, 205, 0.91)",
                pointRadius: 6,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "rgba(210, 214, 222, 1)",
                data: lastWeekRevenue,
            },
        ],
    };

    // Cấu hình biểu đồ
    let salesChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
            display: true,
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
                    type: "linear",
                    position: "left",
                    ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                            return utils.formatVNDCurrency(value); // Định dạng giá trị theo VND
                        },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Doanh thu (VND)",
                    },
                },
            ],
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem) {
                    const dayIndex = tooltipItem.index;
                    const datasetIndex = tooltipItem.datasetIndex;
                    const revenue = tooltipItem.yLabel;

                    // Hiển thị ngày từ map tương ứng
                    const date =
                        datasetIndex === 0
                            ? thisWeekDateMap[dayIndex] // Tuần này
                            : lastWeekDateMap[dayIndex]; // Tuần trước

                    return `Ngày: ${date}, Doanh thu: ${utils.formatVNDCurrency(revenue)}`;
                },
            },
        },
    };

    // Vẽ biểu đồ
    let salesChartCanvas = $("#salesChart").get(0).getContext("2d");
    let salesChart = new Chart(salesChartCanvas, {
        type: "line",
        data: salesChartData,
        options: salesChartOptions,
    });

    $('#total-last-week').text(utils.formatVNDCurrency(totalLastWeek));
    $('#total-this-week').text(utils.formatVNDCurrency(totalThisWeek));

    let percent = totalThisWeek / totalLastWeek * 100;

    if (percent > 100) {
        $('#grow-up-percent').css("opacity", "1");
        $('#grow-up-percent').html(`<i class="fas fa-caret-up"></i> ${Math.round(percent-100)}%`)
    }

    let daysOfThisWeek = moment().isoWeekday(); 
    const lastWeekAvg = totalLastWeek/7;
    const thisWeekAvg = totalThisWeek/daysOfThisWeek;

    $('#average-last-week').text(`${utils.formatVNDCurrency(lastWeekAvg)} / ngày`);
    $('#average-this-week').text(`${utils.formatVNDCurrency(thisWeekAvg)} / ngày`);

    let avgPercent = thisWeekAvg / lastWeekAvg * 100;

    if (avgPercent > 100) {
        $('#avg-percent').addClass('text-success');
        $('#avg-percent').html(`<i class="fas fa-caret-up"></i> ${Math.round(avgPercent - 100)}%`)
    } else if (avgPercent < 100) {
        $('#avg-percent').addClass('text-danger');
        $('#avg-percent').html(`<i class="fas fa-caret-down"></i> ${Math.round(100 - avgPercent)}%`)
    } else {
        $('#avg-percent').addClass('text-warning');
        $('#avg-percent').html(`<i class="fas fa-caret-left"></i> ${Math.round(avgPercent-100)}%`)
    }

//     let dateLabels = [];
//     let revenues = [];

//     try {
//         res = await $.ajax({
//             type: "GET",
//             url: "/api/history/daily-revenue" + `?start=${moment().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss')}&end=${moment().subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss')}`,
//             headers: utils.defaultHeaders(),
//             dataType: "json",
//         });
//     } catch (error) {
//         $('#statistics-card').prop('hidden', true);
//         console.error(error);
//     }

//     if (res && res.code == 1000) {
//         revenueList = [];

//         // Duyệt qua các ngày và doanh thu trong response và lưu vào mảng
//         for (let date in res.data) {
//             revenueList.push({ date: date, revenue: res.data[date] });
//         }

//         // In ra mảng
//         console.log(revenueList);

//         revenueList.forEach(function(item) {
//             // Chuyển ngày từ yyyy-mm-dd sang dd/mm/yyyy
//             const formattedDate = moment(item.date).format('DD/MM/YYYY');
//             // Thêm vào mảng dateLabels
//             dateLabels.push(formattedDate);
    
//             // Định dạng doanh thu thành VND và thêm vào mảng Revenues
//             const formattedRevenue = utils.formatVNDCurrency(item.revenue);
//             revenues.push(item.revenue);
    
//             // Hiển thị ra console để kiểm tra
//             console.log(`Ngày: ${formattedDate}, Doanh thu: ${formattedRevenue}`);
//         });

//         console.log("Date Labels: ", dateLabels);
//         console.log("Date Revenues: ", revenues);
//     }

//     let timeNow = moment();
//     let endTime = utils.getTimeAsJSON(timeNow.subtract(1, 'days'));
//     let startTime = utils.getTimeAsJSON(timeNow.subtract(7, 'days'));
//     let startText = `${startTime.date}/${startTime.mon}/${startTime.year}`;
//     let endText = `${endTime.date}/${endTime.mon}/${endTime.year}`;    

//     let recapTime = `Thống kê 7 ngày gần nhất (${startText} - ${endText})`
//     $('#recap-time').text(recapTime);

//     var salesChartCanvas = $("#salesChart").get(0).getContext("2d");

//     var salesChartData = {
//         labels: dateLabels,
//         datasets: [
//             {
//                 label: "Doanh thu (VND)",
//                 yAxisID: "y1", // Liên kết với trục Y1
//                 backgroundColor: "rgba(60,141,188, 0.7)",
//                 borderColor: "rgba(60,141,188,0.8)",
//                 pointRadius: 6, // Kích thước điểm
//                 pointBackgroundColor: "#ffffff", // Màu nền điểm
//                 pointBorderColor: "rgba(60,141,188,1)", // Màu viền điểm
//                 data: revenues,
//             },
//             {
//                 label: "Electronics (in millions)",
//                 yAxisID: "y2", // Liên kết với trục Y2
//                 backgroundColor: "rgba(234, 234, 234, 0.59)",
//                 borderColor: "rgba(231, 222, 205, 0.91)",
//                 pointRadius: 6, // Kích thước điểm
//                 pointBackgroundColor: "#ffffff", // Màu nền điểm
//                 pointBorderColor: "rgba(210, 214, 222, 1)", // Màu viền điểm
//                 data: [65, 59, 80, 81, 56, 55, 40],
//             },
//         ],
//     };
    
//     var salesChartOptions = {
//         maintainAspectRatio: false,
//         responsive: true,
//         legend: {
//             display: true,
//         },
//         scales: {
//             xAxes: [
//                 {
//                     gridLines: {
//                         display: false,
//                     },
//                 },
//             ],
//             yAxes: [
//                 {
//                     id: "y1", // ID của trục Y1
//                     type: "linear",
//                     position: "left", // Trục bên trái
//                     ticks: {
//                         beginAtZero: true,
//                         callback: function(value) {
//                             // Định dạng giá trị trục Y1 (Doanh thu) thành VND
//                             return utils.formatVNDCurrency(value);
//                         },
//                     },
//                     scaleLabel: {
//                         display: true,
//                         labelString: "Doanh thu (VND)",
//                     },
//                 },
//                 {
//                     id: "y2", // ID của trục Y2
//                     type: "linear",
//                     position: "right", // Trục bên phải
//                     ticks: {
//                         beginAtZero: true,
//                     },
//                     scaleLabel: {
//                         display: true,
//                         labelString: "Electronics (in millions)",
//                     },
//                 },
//             ],
//         },tooltips: {
//             callbacks: {
//                 // Định dạng lại giá trị trong tooltip (khi hover vào điểm)
//                 label: function(tooltipItem) {
//                     var datasetIndex = tooltipItem.datasetIndex;
//                     var value = tooltipItem.yLabel;
                    
//                     // Nếu là doanh thu, định dạng bằng utils.formatVNDCurrency
//                     if (datasetIndex === 0) {
//                         return `Doanh thu ngày: ${utils.formatVNDCurrency(value)}`;
//                     }
    
//                     // Nếu là dữ liệu electronics, bạn có thể định dạng theo kiểu khác nếu cần
//                     return value;
//                 }
//             }
//         },
//     };
    
//     // Tạo biểu đồ
//     var salesChart = new Chart(salesChartCanvas, {
//         type: "line",
//         data: salesChartData,
//         options: salesChartOptions,
//     });
    


return;
    

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



function getLastNDays(n) {
    const labels = [];
    const today = new Date(); // Ngày hiện tại
    today.setDate(today.getDate() - 1); // Lấy ngày hôm qua

    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i); // Lùi lại ngày tương ứng
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(
            date.getMonth() + 1
        ).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`; // Định dạng dd/mm/yy
        labels.push(formattedDate);
    }
    return labels;
}