import * as utils from "/dist/js/utils.js";

utils.introspect(true);

$(document).ready(async function () {
    let now = new Date();
    let formattedTime = now.getHours().toString().padStart(2, '0') + ':' +
                        now.getMinutes().toString().padStart(2, '0') + ' ' +
                        now.getDate().toString().padStart(2, '0') + '/' +
                        (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
                        now.getFullYear();
                        
    $('#print-at').text(`Print at: ${formattedTime}`);

    let id = utils.getHashParam('invoice');
    if (id == null || id == "") {
        Swal.fire({
            icon: "error",
            title: "Không lấy được ID đơn dịch vụ",
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: "Đóng tab",
        }).then((result) => {
            if (result.isConfirmed) {
                window.close();
            } else {
                window.close();
            }
        });
        return;
    }

    $('#table-details').DataTable({
        dom: "t", // Chỉ hiển thị nội dung bảng (không có thanh tìm kiếm, phân trang)
        autoWidth: false,
        paging: false,
        ordering: false,
        info: false,
        searching: false,
        language: {
            paginate: {
                next: "&raquo;",
                previous: "&laquo;",
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
            loadingRecords: "Đang tải dữ liệu...",
        },
        columns: [
            { data: "number", className: "text-center", width: "5%" },
            {
                data: "serviceName",
                className: "text-left",
                minWidth: "20%",
                render: function (data, type, row) {
                    let html = data + "<br>";
                    html += `<small>${row.optionName}</small>`;
                    return html;
                },
            },
            {
                data: "price",
                className: "text-right",
                width: "15%",
                render: function (data, type, row) {
                    return utils.formatVNDCurrency(data);
                },
            },
            {
                data: "quantity",
                className: "text-center",
                width: "10%",
                render: function (data, type, row) {
                    return data;
                },
            },
            {
                data: "discount",
                className: "text-center",
                width: "15%",
                render: function (data, type, row) {
                    return `${data}%`;
                },
            },
            {
                data: "finalPrice",
                className: "text-right",
                width: "15%",
                render: function (data, type, row) {
                    return utils.formatVNDCurrency(data);
                },
            },
        ],
        headerCallback: function (thead) {
            $(thead).find("th").addClass("text-center"); // Thêm class 'text-center' cho header
        },
    });

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/history/"+id,
            headers: utils.defaultHeaders(),
            dataType: "json",
        });
        if (!res) throw new Error("Error in getting invoice information");
        if (res.code == 1000 && res.data) {
            let invoice = res.data;
            loadInvoiceInfo(invoice);
            loadListDetailsHistory(invoice.details);
        } else {
            throw new Error("Error in getting invoice information");
        }
    } catch (error) {
        console.log(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: "Không thể lấy thông tin hóa đơn",
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: "Đóng tab",
        }).then((result) => {
            if (result.isConfirmed) {
                window.close();
            } else {
                window.close();
            }
        });
        return;
    }

    try{
        let res = await $.ajax({
            type: "POST",
            url: "/api/common-param/list-param",
            headers: utils.defaultHeaders(),
            data: JSON.stringify([
                    "COMPANY_NAME",
                    "FACILITY_NAME",
                    "FACILITY_PHONE_NUMBER",
                    "FACILITY_ADDRESS",
                    "FACILITY_CONTACT_MAIL",
                    "NUMBER_OF_SERVICE_IMAGE"
                ]
            ),
            dataType: "json",
        });
        
        if (!res) throw new Error("Error in getting facility information");
        if (res.code == 1000 && res.data) {
            let data = res.data;
            let COMPANY_NAME = data[0].value;
            let FACILITY_NAME = data[1].value;
            let FACILITY_PHONE = data[2].value;
            let FACILITY_ADDRESS = data[3].value;
            let FACILITY_EMAIL = data[4].value;
            
            $('#facility-name').text(FACILITY_NAME);
            $('#company-name').text(COMPANY_NAME);
            $('#facility-address').html(formatAddress(FACILITY_ADDRESS));
            $('#facility-phone').text(FACILITY_PHONE);
            $('#facility-email').text(FACILITY_EMAIL);
        } else {
            throw new Error("Error in getting facility information");
        }
    } catch (error) {
        console.log(error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: "Không thể lấy thông tin cơ sở",
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: "Đóng tab",
        }).then((result) => {
            if (result.isConfirmed) {
                window.close();
            } else {
                window.close();
            }
        });
        return;
    }

    setTimeout(() => {
        window.print();
    }, 1000);
    
});


function loadInvoiceInfo(invoice) {
    let advisor = invoice.advisor;
    let customer = invoice.customer;
    loadCustomerInfo(customer);
    loadAdvisorInfo(advisor);

    let t = utils.getTimeAsJSON(invoice.serviceDate);
    let invoiceIdHtml = "";
    if (invoice.status == 1) {
        invoiceIdHtml = `Invoice #${invoice.id}`;
    } else {
        invoiceIdHtml = `Order #${invoice.id}`;
    }
    $("#invoice-id").html(invoiceIdHtml);
    $("#history-date").text(`${t.hour}:${t.min}, ${t.date}/${t.mon}/${t.year}`);
    $("#odo-info").text(
        invoice.odo != null ? utils.formatCurrent(invoice.odo) : "Không xác định"
    );

    let totalAmount = utils.formatVNDCurrency(invoice.totalAmount);
    let payableAmount = utils.formatVNDCurrency(invoice.payableAmount);

    $("#total-amount-info").text(totalAmount);
    $("#discount-info").text(invoice.discount + " %");
    $("#payable-amount-info").text(payableAmount);
    $("#summary-input").html(invoice.summary.replace(/\n/g, "<br>"));
    $("#diagnose-input").html(invoice.diagnose.replace(/\n/g, "<br>"));

    // loadListDetailsHistory(invoice.details);
}

function loadAdvisorInfo(advisor) {
    if (advisor == null) {
        $("#advisor-name").text("- Không xác định -");
        $("#advisor-contact").html("");
        return;
    }

    let phone = advisor.phone || "";
    let email = advisor.accounts[0] ? advisor.accounts[0].email : "";

    let contactHtml = `<b>Liên hệ: </b>`;
    if (phone !== "") {
        if (email !== "") {
            contactHtml += phone + " - " + email;
        } else {
            contactHtml += phone;
        }
    } else {
        if (email !== "") {
            contactHtml += email;
        } else {
            contactHtml = "";
        }
    }

    $("#advisor-name").html(`<b>Cố vấn DV: </b>${advisor.name}`);
    $("#advisor-contact").html(contactHtml);
}

function loadCustomerInfo(customer) {
    if (customer == null) {
        $("#customer-name").text("Khách vãng lai");
        $("#customer-address").html("");
        $("#customer-phone").html("");
        $("#customer-email").html("");
        return;
    }

    let addressHtml = customer.address
        ? formatAddress(customer.address.address) + "<br>"
        : "";
    let phoneHtml = customer.phone
        ? `<b>SĐT: </b><a href="tel:${customer.phone}" class="text-dark text-decoration-none">${customer.phone}</a><br>`
        : "";
    let mailHtml = customer.accounts[0]
        ? `<b>Email: </b><a href="mailto:${customer.accounts[0].email}" class="text-dark text-decoration-none">${customer.accounts[0].email}</a>`
        : "";

    $("#customer-name").text(customer.name);
    $("#customer-address").html(addressHtml);
    $("#customer-phone").html(phoneHtml);
    $("#customer-email").html(mailHtml);
}

function formatAddress(address) {
    const parts = address.split(",");
    if (parts.length > 2) {
        return `${parts.slice(0, 2).join(", ")},<br>${parts
            .slice(2)
            .join(", ")}`;
    }
    return address;
}

function loadListDetailsHistory(details) {
    $('#table-details').DataTable().clear().draw();
    if (details == null) {
        return;
    }
    if (details.length == 0) {
        return;
    }

    let data = [];
    let counter = 1;
    details.forEach(function (detail) {
        data.push({
            number: counter++, // Số thứ tự tự động tăng
            id: detail.id,
            service: detail.service,
            serviceName: detail.serviceName,
            option: detail.option,
            optionName: detail.optionName,
            price: detail.price,
            discount: detail.discount,
            quantity: detail.quantity,
            finalPrice: detail.finalPrice,
        });
    });

    $('#table-details').DataTable().clear().rows.add(data).draw();
}