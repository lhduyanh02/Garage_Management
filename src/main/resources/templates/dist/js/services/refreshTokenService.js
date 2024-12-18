const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");

    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return cookie.split("=")[1];
        }
    }
    return null; // Return null if the cookie is not found
};

function refreshToken() {
    // console.log("Refresh token");
    
    let token = getCookie("authToken");

    if (token == null) {
        // console.error("Error: Token not found.");
        return;
    }

    let expirationTime = localStorage.getItem("tokenExpirationTime");

    if (expirationTime) {
        const currentTime = Date.now();
        expirationTime = parseInt(expirationTime, 10);

        if ((expirationTime - currentTime) > (3 * 60 * 60 * 1000)) {
            // console.log("Token already refreshed"); 
            return;
        }
    }

    $.ajax({
        type: "POST",
        url: "/api/auth/refreshToken",
        data: JSON.stringify({ token: getCookie("authToken") }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 1000 && res.data.authenticated) {
                console.log("**Token refreshed successfully.**");

                // Lưu thời gian hết hạn vào localStorage (1 ngày)
                const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 1 ngày
                localStorage.setItem("tokenExpirationTime", expirationTime);
            } else {
                console.log("Failed to refresh token.");
            }
        },
        error: function(xhr, status, error) {
            console.error("Error refreshing token:", error);
            console.log(xhr);
        }
    });
}

refreshToken();

setInterval(() => {
    refreshToken();
}, 10*60*1000);