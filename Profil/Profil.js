// Hesap ayarları sayfasını açma fonksiyonu
function openSettings() {
    window.location.href = 'ProfilAyarlari.html';
}

// Avatar seçim modalını aç
function openAvatarSelection() {
    document.getElementById('avatar-modal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
}

// Avatar seçim modalını kapat
function closeAvatarSelection() {
    document.getElementById('avatar-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Sayfa kaydırmayı geri aç
}

/* Avatar seçimi yapıldığında
function selectAvatar(avatarSrc) {
    document.getElementById('selected-avatar').src = avatarSrc;
    
    // Seçilen avatarı localStorage'a kaydet
    localStorage.setItem('selectedAvatar', avatarSrc);
    
    // Modalı kapat
    closeAvatarSelection();
    
    // Kullanıcıya bildirim göster
    showNotification('Avatar başarıyla değiştirildi!');
}*/

function selectAvatar(avatarSrc) {
    const selectedAvatar = document.getElementById('selected-avatar');
    
    if (!selectedAvatar) {
        console.error("'selected-avatar' ID'li eleman bulunamadı!");
        return;
    }
    
    if (!avatarSrc) {
        console.error("Avatar kaynağı belirtilmemiş!");
        return;
    }
    
    // Avatar kaynağının tam URL'sini oluştur (gerekirse)
    if (!avatarSrc.startsWith('http') && !avatarSrc.startsWith('/')) {
        // Göreceli yola dönüştür (örn: img/avatars/avatar1.png)
        avatarSrc = 'img/avatars/' + avatarSrc;
    }
    
    // Avatarı dene ve yükle
    const tempImg = new Image();
    tempImg.onload = function() {
        // Resim başarıyla yüklenirse
        selectedAvatar.src = avatarSrc;
        localStorage.setItem('selectedAvatar', avatarSrc);
        showNotification('Avatar başarıyla değiştirildi!');
        closeAvatarSelection();
    };
    
    tempImg.onerror = function() {
        // Resim yüklenemediyse
        console.error("Avatar resmi yüklenemedi: ", avatarSrc);
        showNotification('Avatar yüklenemedi! Lütfen tekrar deneyin.', 'error');
    };
    
    tempImg.src = avatarSrc;
}

// Bildirim gösterme fonksiyonu
function showNotification(message) {
    // Halihazırda bildirim varsa kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    
    // Bildirimi sayfaya ekle
    document.body.appendChild(notification);
    
    // CSS'i dinamik olarak ekle
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            max-width: 400px;
        }
        
        .notification {
            background-color: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            display: flex;
            position: relative;
            overflow: hidden;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
        }
        
        .notification.success::before {
            background-color: #10b981;
        }
        
        .notification.warning::before {
            background-color: #f59e0b;
        }
        
        .notification.error::before {
            background-color: #ef4444;
        }
        
        .notification.info::before {
            background-color: #3b82f6;
        }
        
        .icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .notification.success .icon {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .notification.warning .icon {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .notification.error .icon {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        .notification.info .icon {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        .content {
            flex-grow: 1;
        }
        
        .title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
            color: #1f2937;
        }
        
        .message {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .close {
            background: none;
            border: none;
            cursor: pointer;
            color: #9ca3af;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .close:hover {
            background-color: #f3f4f6;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sayfa yüklendiğinde daha önce kaydedilmiş avatar varsa göster
document.addEventListener('DOMContentLoaded', function() {
    const savedAvatar = localStorage.getItem('selectedAvatar');
    if (savedAvatar) {
        document.getElementById('selected-avatar').src = savedAvatar;
    }
    
    // Modalın dışına tıklandığında kapatma
    window.onclick = function(event) {
        const modal = document.getElementById('avatar-modal');
        if (event.target === modal) {
            closeAvatarSelection();
        }
    };
});

//Profil Ayarları Değişiklikleri
document.addEventListener('DOMContentLoaded', function() {
    // Profil sayfasındaki DOM elemanlarına referanslar
    const userNameElement = document.querySelector('.detail-value:nth-child(2)');
    const emailElement = document.querySelector('.detail-value:nth-child(4)');
    const fullNameElement = document.querySelector('.detail-value:nth-child(2)');
    
    // Avatar seçimi için modal
    const avatarModal = document.getElementById('avatar-modal');
    const selectedAvatar = document.getElementById('selected-avatar');
    
    // Avatar seçimini localStorage'dan yükle
    loadAvatarFromStorage();
    
    // Kullanıcı bilgilerini localStorage'dan yükle
    loadUserDataToProfile();
    
    // Avatar seçim modalını açma
    window.openAvatarSelection = function() {
        avatarModal.style.display = 'flex';
    };
    
    // Avatar seçim modalını kapatma
    window.closeAvatarSelection = function() {
        avatarModal.style.display = 'none';
    };
    
    // Avatar seçme
    window.selectAvatar = function(avatarSrc) {
        selectedAvatar.src = avatarSrc;
        localStorage.setItem('selectedAvatar', avatarSrc);
        closeAvatarSelection();
    };
    
    // Seçilen avatarı localStorage'dan yükleme
    function loadAvatarFromStorage() {
        const savedAvatar = localStorage.getItem('selectedAvatar');
        if (savedAvatar) {
            selectedAvatar.src = savedAvatar;
        }
    }
    
    // Kullanıcı bilgilerini localStorage'dan yükleyip profil sayfasına yerleştirme
    function loadUserDataToProfile() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (userData) {
            // Tam adı güncelle
            if (userData.firstName && userData.lastName) {
                const fullNameElement = document.querySelector('.detail-value');
                if (fullNameElement) {
                    fullNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
                }
            }
            
            // Kullanıcı adını güncelle
            if (userData.username) {
                const usernameElement = document.querySelector('.detail-row:nth-child(2) .detail-value');
                if (usernameElement) {
                    usernameElement.textContent = userData.username;
                }
            }
            
            // E-posta adresini güncelle
            if (userData.email) {
                const emailElement = document.querySelector('.detail-row:nth-child(3) .detail-value');
                if (emailElement) {
                    emailElement.textContent = userData.email;
                }
            }
            
            // Telefon numarasını göstermek için yeni bir satır ekleyelim (eğer yoksa)
            if (userData.phone) {
                addDetailRowIfNotExists('Telefon:', userData.phone);
            }
            
            // Adresi göstermek için yeni bir satır ekleyelim (eğer yoksa)
            if (userData.address) {
                addDetailRowIfNotExists('Adres:', userData.address);
            }
        }
    }
    
    // Profil detaylarına yeni satır ekleme fonksiyonu
    function addDetailRowIfNotExists(label, value) {
        const profileDetails = document.querySelector('.profile-details');
        
        // Label'ın zaten var olup olmadığını kontrol et
        const existingRow = Array.from(document.querySelectorAll('.detail-label')).find(el => el.textContent === label);
        
        if (!existingRow && profileDetails) {
            const detailRow = document.createElement('div');
            detailRow.className = 'detail-row';
            
            const detailLabel = document.createElement('div');
            detailLabel.className = 'detail-label';
            detailLabel.textContent = label;
            
            const detailValue = document.createElement('div');
            detailValue.className = 'detail-value';
            detailValue.textContent = value;
            
            detailRow.appendChild(detailLabel);
            detailRow.appendChild(detailValue);
            profileDetails.appendChild(detailRow);
        } else if (existingRow) {
            // Eğer varsa, değerini güncelle
            existingRow.nextElementSibling.textContent = value;
        }
    }
    
    // Modalın dışına tıklandığında modalı kapat
    window.onclick = function(event) {
        if (event.target === avatarModal) {
            closeAvatarSelection();
        }
    };
});

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('purchaseTable');
    const headers = table.querySelectorAll('th[data-sort]');
    
    // Mevcut sıralama durumunu takip etmek için bir değişken
    let currentSort = {
        column: null, 
        direction: 'asc'
    };
    
    // Sütun başlıklarına tıklama olaylarını ekleme
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortColumn = header.getAttribute('data-sort');
            
            // Aynı sütuna tekrar tıklandığında sıralama yönünü değiştir
            if (currentSort.column === sortColumn) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = sortColumn;
                currentSort.direction = 'asc';
            }
            
            // Tüm sütun başlıklarından sıralama sınıflarını kaldır
            headers.forEach(h => {
                h.classList.remove('sorting', 'sorting-desc');
            });
            
            // Aktif sütun başlığına sıralama sınıfı ekle
            header.classList.add(currentSort.direction === 'asc' ? 'sorting' : 'sorting-desc');
            
            // Tabloyu sırala
            sortTable(sortColumn, currentSort.direction);
        });
    });
    
    // Tablo sıralama fonksiyonu
    function sortTable(column, direction) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            let aValue, bValue;
            
            switch (column) {
                case 'date':
                    aValue = a.querySelector('td[data-date]').getAttribute('data-date');
                    bValue = b.querySelector('td[data-date]').getAttribute('data-date');
                    break;
                case 'product':
                    aValue = a.querySelector('.item-name').textContent.toLowerCase();
                    bValue = b.querySelector('.item-name').textContent.toLowerCase();
                    break;
                case 'price':
                    aValue = parseFloat(a.querySelector('.price').getAttribute('data-price'));
                    bValue = parseFloat(b.querySelector('.price').getAttribute('data-price'));
                    break;
                case 'status':
                    aValue = a.querySelector('td:nth-child(4)').textContent.toLowerCase();
                    bValue = b.querySelector('td:nth-child(4)').textContent.toLowerCase();
                    break;
            }
            
            // Sıralama yönüne göre karşılaştırma yap
            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        // Tabloyu yeniden oluştur
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        sortedRows.forEach(row => {
            tbody.appendChild(row);
        });
    }
});