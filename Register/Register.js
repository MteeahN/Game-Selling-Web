document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Form gönderildiğinde çalışacak fonksiyon
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Formun normal gönderimini engelle
        
        // Form verilerini al
        const firstName = document.querySelector('.name').value.trim();
        const lastName = document.querySelector('.last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basit doğrulama işlemleri
        if (firstName === '' || lastName === '' || email === '' || password === '') {
            showError('Lütfen tüm alanları doldurun.');
            return;
        }
        
        // E-posta formatı kontrolü
        if (!isValidEmail(email)) {
            showError('Lütfen geçerli bir e-posta adresi girin.');
            return;
        }
        
        // Şifre uzunluğu kontrolü
        if (password.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        
        // Kayıt işlemi
        registerUser(firstName, lastName, email, password);
    });
    
    // E-posta formatını kontrol eden fonksiyon
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Hata mesajını gösteren fonksiyon
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // 5 saniye sonra hata mesajını gizle
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Başarı mesajını gösteren fonksiyon
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.color = 'green';
        errorMessage.style.display = 'block';
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
            window.location.href = '../Login/Login.html';
        }, 3000);
    }
    
    // Kullanıcı kaydı yapan fonksiyon
    function registerUser(firstName, lastName, email, password) {
        // Normalde burada bir API'ye istek atılır
        // Bu örnekte localStorage kullanarak basit bir kayıt simülasyonu yapıyoruz
        
        // Daha önce kayıt olmuş mu kontrol et
        const users = JSON.parse(localStorage.getItem('dararUsers')) || [];
        const existingUser = users.find(user => user.email === email);
        
        if (existingUser) {
            showError('Bu e-posta adresi zaten kullanılıyor.');
            return;
        }
        
        // Yeni kullanıcıyı ekle
        const newUser = {
            firstName,
            lastName,
            email,
            password, // Gerçek uygulamada şifre hash'lenmeli!
            registerDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('dararUsers', JSON.stringify(users));
        
        // Başarılı kayıt mesajı
        showSuccess('Kayıt işlemi başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        
        // Form alanlarını temizle
        loginForm.reset();
    }
    
    // Kapatma butonunun işlevi
    window.closeLoginPage = function() {
        window.history.back(); // Bir önceki sayfaya dön
        // Alternatif olarak: window.location.href = '../index.html';
    };
});