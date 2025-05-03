const validUsers = [
    { email: 'metehantabak@oyun.com', password: 'M1837tabak' },
    { email: 'yasinucan@oyun.com', password: 'admin123' },
    { email: 'fatmacaglar@gmail.com', password: 'Meteyicokseviyorum' },
    { email: 'admin@oyun.com', password: 'aa' }
];

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    const user = validUsers.find(u => u.email === email && u.password === password);

    if (user) {
        errorMessage.style.display = 'none';
        alert('Giriş Başarılı! Hoş geldiniz, ' + email);
        window.location.href = '../Uye/Uye.html';
    } else {
        errorMessage.textContent = 'Hatalı e-posta veya şifre. Tekrar deneyin.';
        errorMessage.style.display = 'block';
    }
});

function closeLoginPage() {
    // Eğer bir önceki sayfa varsa geri git
    if (window.history.length > 1) {
        window.history.go(-1);
    } else {
        // Eğer önceki sayfa yoksa ana sayfaya yönlendir
        window.location.href = '../index.html';
    }
}