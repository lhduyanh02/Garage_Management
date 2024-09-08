export function redirect_page(url) {
    // Lấy token từ sessionStorage
    const token = sessionStorage.getItem('token');

    if (!token) {
        alert("token not founded");
        window.location.href("/login")
        return;
    }

    // Gọi API để lấy trang HTML với Bearer Token
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/html'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch the page');
        }
        return response.text(); // Nhận HTML dưới dạng text
    })
    .then(html => {
        const contentDiv = document.getElementById('content'); // Thay thế nội dung bằng HTML mới
        contentDiv.innerHTML = html;

        // Re-execute any scripts included in the fetched HTML
        const scripts = contentDiv.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            document.body.appendChild(newScript);
        });
    })
    .catch(error => {
        console.error('Error fetching the HTML page:', error);
    });
}