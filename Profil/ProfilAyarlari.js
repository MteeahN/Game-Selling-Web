// ProfilAyarlari.js

document.addEventListener('DOMContentLoaded', function() {
    // Form elemanlarına referanslar
    const form = document.querySelector('.account-settings form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Geri butonu referansı
    const backButton = document.querySelector('.back-button');
    
    // Geri butonuna olay dinleyicisi ekle
    backButton.addEventListener('click', function() {
        goBackToProfile();
    });
    
    // LocalStorage'dan kayıtlı bilgileri al ve forma doldur
    loadUserDataFromStorage();
    
    // Form gönderildiğinde yapılacak işlemler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Şifre kontrolü
        if (passwordInput.value !== '' && passwordInput.value !== confirmPasswordInput.value) {
            showNotification('Şifreler eşleşmiyor!', 'error');
            return;
        }
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        saveUserDataToStorage();
        
        // Başarı bildirimi göster
        showNotification('Bilgileriniz başarıyla kaydedildi!', 'success');
        
        // 2 saniye sonra profil sayfasına dön
        setTimeout(() => {
            goBackToProfile();
        }, 2000);
    });
    
    // Form verilerini localStorage'a kaydetme fonksiyonu
    function saveUserDataToStorage() {
        const userData = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            username: usernameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
            lastUpdated: new Date().toLocaleString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // LocalStorage'dan verileri yükleme fonksiyonu
    function loadUserDataFromStorage() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (userData) {
            firstNameInput.value = userData.firstName || '';
            lastNameInput.value = userData.lastName || '';
            usernameInput.value = userData.username || '';
            emailInput.value = userData.email || '';
            phoneInput.value = userData.phone || '';
            addressInput.value = userData.address || '';
        }
    }
    
    // Bildirim gösterme fonksiyonu
    function showNotification(message, type) {
        // Eğer zaten bir bildirim varsa, onu kaldır
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Bildirimi göster
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Bildirimi 3 saniye sonra kaldır
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});

// Profil sayfasına geri dönme fonksiyonu - global olarak tanımlıyoruz
function goBackToProfile() {
    window.location.href = 'Profil.html';
}