$(document).ready(function () {
    alert_hash();
    
    $(window).on('hashchange', function() {
        alert_hash();
    });
    
});

function alert_hash() {
    let path = window.location.href.split("#")[1] || null;

    if (path !== null) {
        console.log(path);  // In ra toàn bộ chuỗi sau dấu thăng
    } else {
        console.log("No path found after #");
    }
}