// Hesap ayarları sayfasını açma fonksiyonu
function openSettings() {
    window.location.href = 'ProfilAyarlari.html';
}

// Profil fotoğrafı değiştirme
document.querySelector('.profile-photo-overlay').addEventListener('click', function() {
    alert('Profil fotoğrafı değiştirme işlevi burada olacak.');
});

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

// Avatar seçimi yapıldığında
function selectAvatar(avatarSrc) {
    document.getElementById('selected-avatar').src = avatarSrc;
    
    // Seçilen avatarı localStorage'a kaydet (opsiyonel)
    localStorage.setItem('selectedAvatar', avatarSrc);
    
    // Modalı kapat
    closeAvatarSelection();
    
    // Kullanıcıya bildirim göster
    showNotification('Avatar başarıyla değiştirildi!');
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
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--turuncu-ana);
            color: var(--gri-koyu);
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: fadeInOut 3s forwards;
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
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
                const fullNameElement = document.querySelector('.detail-value'); // İlk detail-value, genelde Ad Soyad
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