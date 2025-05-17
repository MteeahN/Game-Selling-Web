// İstek Listesinden sepete ekleme fonksiyonları
document.addEventListener('DOMContentLoaded', () => {
    // Sepet sayısını güncelle (eğer window.Sepet mevcutsa)
    if (window.Sepet && typeof window.Sepet.sepetSayisiniGuncelle === 'function') {
        window.Sepet.sepetSayisiniGuncelle();
    } else {
        // Yerel bir fonksiyon kullan
        sepetSayisiniGuncelle();
    }
});

    // Sepet sayısını güncelleme fonksiyonu
    function sepetSayisiniGuncelle() {
    const sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    const sepetSayi = document.getElementById('sepet-sayi');
    
    if (sepetSayi) {
        let toplamAdet = 0;
        sepet.forEach(urun => {
            toplamAdet += urun.adet;
        });
        
        sepetSayi.textContent = toplamAdet.toString();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let istekListesi = JSON.parse(localStorage.getItem('istekListesi')) || [];

    const gameList = document.getElementById('game-list');

    if (!gameList) return;

    function istekListesiKartlariniOlustur() {
        if (istekListesi.length === 0) {
            gameList.innerHTML = '<div class="empty-list">İstek listenizde oyun bulunmamaktadır.</div>';
            return;
        }

        gameList.innerHTML = '';

        istekListesi.forEach(oyun => {
            const oyunKart = createOyunKart(oyun);
            gameList.appendChild(oyunKart);
        });
    }

    function createOyunKart(oyun) {
        const kiralamaSuresi = oyun.kiralamaSuresi || 'Haftalık';
        const oncelikSinif = getOncelikSinifi(oyun.oncelik);
        
        // Format para birimi fonksiyonu
        function formatParaBirimi(fiyat) {
            return typeof fiyat === 'number' 
                ? fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0,00';
        }
        
        const satisFiyatiFormatli = formatParaBirimi(oyun.satisFiyati);
        const kiraFiyatiFormatli = formatParaBirimi(oyun.kiraFiyati);
        const formatliTarih = formatEklenmeTarihi(oyun.eklenmeTarihi);
    
        const oyunKart = document.createElement('div');
        oyunKart.className = 'game-card';
        oyunKart.innerHTML = `
            <div class="game-card-image" style="background-image: url('${oyun.img || '/api/placeholder/300/150'}')"></div>
            <div class="game-card-content">
                <div class="game-card-header">
                    <h3>${oyun.ad}</h3>
                    <div class="priority-badge ${oncelikSinif}">${oyun.oncelik || 'Orta'}</div>
                </div>
                <div class="game-card-body">
                    <p><strong>Satın Alma Fiyatı:</strong> <span>₺${satisFiyatiFormatli}</span></p>
                    <p><strong>Kiralama Fiyatı:</strong> <span>₺${kiraFiyatiFormatli}</span></p>
                    <p><strong>Eklenme Tarihi:</strong> <span>${formatliTarih}</span></p>
                </div>
                <div class="game-card-actions">
                    <button class="btn wishlist-buy-btn" data-id="${oyun.id}">Satın Al</button>
                    <button class="btn wishlist-rent-btn" data-id="${oyun.id}">Kirala</button>
                    <button class="btn remove-btn" data-id="${oyun.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        return oyunKart;
    }

    // Event Delegation
    gameList.addEventListener('click', function(e) {
        if (e.target.closest('.wishlist-buy-btn')) {
            handleBuyClick(e.target.closest('.wishlist-buy-btn'));
        } else if (e.target.closest('.wishlist-rent-btn')) {
            handleRentClick(e.target.closest('.wishlist-rent-btn'));
        } else if (e.target.closest('.remove-btn')) {
            handleRemoveClick(e.target.closest('.remove-btn'));
        }
    });

    function handleBuyClick(button) {
        const oyunId = parseInt(button.getAttribute('data-id'));
        const oyun = findGameById(oyunId);
        if (oyun) sepeteEkleFromWishlist(oyun, 'Satın Alma');
    }
    
    function handleRentClick(button) {
        const oyunId = parseInt(button.getAttribute('data-id'));
        const oyun = findGameById(oyunId);
        if (oyun) sepeteEkleFromWishlist(oyun, 'Kiralama');
    }

    function handleRemoveClick(button) {
        const oyunId = parseInt(button.getAttribute('data-id'));
        istekListesindenKaldir(oyunId);
    }

    function findGameById(oyunId) {
        return istekListesi.find(o => o.id === oyunId);
    }

    function getOncelikSinifi(oncelik) {
        switch (oncelik) {
            case 'Yüksek':
                return 'priority-high';
            case 'Düşük':
                return 'priority-low';
            default:
                return 'priority-medium';
        }
    }

    function formatEklenmeTarihi(tarih) {
        if (!tarih) return 'Bilinmiyor';
        const date = new Date(tarih);
        if (isNaN(date.getTime())) return 'Bilinmiyor';
        return date.toLocaleDateString('tr-TR');
    }

    function istekListesindenKaldir(oyunId) {
        istekListesi = istekListesi.filter(oyun => oyun.id !== oyunId);
        localStorage.setItem('istekListesi', JSON.stringify(istekListesi));
        istekListesiKartlariniOlustur();
        bildirimGoster("Oyun istek listenizden kaldırıldı");
    }

    // İstek listesinden sepete ekleme fonksiyonu
    function sepeteEkleFromWishlist(oyun, islemTipi) {
        console.log("İstek listesinden sepete ekleniyor:", oyun);
        
        // Fiyatları temizle ve sayıya çevir
        let satisFiyati = typeof oyun.satisFiyati === 'string' ? oyun.satisFiyati : (oyun.satisFiyati || 0).toString();
        let kiraFiyati = typeof oyun.kiraFiyati === 'string' ? oyun.kiraFiyati : (oyun.kiraFiyati || 0).toString();
        
        // Satış fiyatını düzenle
        let temizSatisFiyati = satisFiyati.replace('₺', '').trim();
        let satisFiyatDeger;

        if (temizSatisFiyati.includes(',') || temizSatisFiyati.includes('.')) {
            temizSatisFiyati = temizSatisFiyati.replace(/\./g, '').replace(',', '.');
            satisFiyatDeger = parseFloat(temizSatisFiyati);
        } else {
            satisFiyatDeger = parseInt(temizSatisFiyati) / 100 || 0;
        }

        if (isNaN(satisFiyatDeger)) satisFiyatDeger = 0;

        // Kiralama fiyatını temizle ve sayıya çevir
        let temizKiraFiyati = kiraFiyati.replace('₺', '').trim();
        let kiraFiyatDeger;

        if (temizKiraFiyati.includes(',') || temizKiraFiyati.includes('.')) {
            temizKiraFiyati = temizKiraFiyati.replace(/\./g, '').replace(',', '.');
            kiraFiyatDeger = parseFloat(temizKiraFiyati);
        } else {
            kiraFiyatDeger = parseInt(temizKiraFiyati) / 100 || 0;
        }

        if (isNaN(kiraFiyatDeger)) kiraFiyatDeger = 0;

        // İşlem tipine göre fiyatı belirle
        const fiyatDeger = islemTipi === 'Satın Alma' ? satisFiyatDeger : kiraFiyatDeger;
        const kiralamaSuresi = oyun.kiralamaSuresi || 'Haftalık';
        
        // Kiralama için süre faktörünü uygula
        let finalFiyat = fiyatDeger;
        if (islemTipi === 'Kiralama' && window.kiralamaSuresiCarpanlari) {
            const sureFaktoru = window.kiralamaSuresiCarpanlari[kiralamaSuresi] || 1.0;
            finalFiyat = kiraFiyatDeger * sureFaktoru;
        }
        
        // Ana pencerede Sepet nesnesi var mı kontrol et
        if (window.Sepet && typeof window.Sepet.sepeteEkle === 'function') {
            console.log("window.Sepet API'si kullanılıyor");
            try {
                // window.Sepet API'sini kullan
                window.Sepet.sepeteEkle(
                    oyun.ad,
                    finalFiyat.toFixed(2),
                    islemTipi,
                    satisFiyatDeger.toFixed(2),
                    kiraFiyatDeger.toFixed(2),
                    kiralamaSuresi
                );
                
                // Sepet panelini aç
                if (typeof window.Sepet.sepetPanelAc === 'function') {
                    window.Sepet.sepetPanelAc();
                }
            } catch (error) {
                console.error("Sepet API hatası:", error);
                // Hata durumunda yedek fonksiyonu kullan
                sepeteEkleDogrudan(
                    oyun.ad,
                    finalFiyat,
                    islemTipi,
                    satisFiyatDeger,
                    kiraFiyatDeger,
                    kiralamaSuresi,
                    oyun.img || 'https://via.placeholder.com/80'
                );
                bildirimGoster(`${oyun.ad} sepete eklendi (${islemTipi})`);
            }
        } else {
            console.log("Doğrudan localStorage'a kaydediliyor");
            // Sepet API'si yoksa doğrudan localStorage'a kaydet
            sepeteEkleDogrudan(
                oyun.ad,
                finalFiyat,
                islemTipi,
                satisFiyatDeger,
                kiraFiyatDeger,
                kiralamaSuresi,
                oyun.img || 'https://via.placeholder.com/80'
            );
            
            // Sepet panelini açmak için
            sepetPanelAc();
        }
        
        bildirimGoster(`${oyun.ad} sepete eklendi (${islemTipi})`);
    }

    // Yedek sepet paneli açma fonksiyonu
    function sepetPanelAc() {
        const sepetPanel = document.getElementById('sepet-panel');
        const overlay = document.getElementById('overlay');
        
        if (sepetPanel && overlay) {
            sepetPanel.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Mevcut sayfada sepetGuncelle fonksiyonu varsa çağır
            if (typeof window.sepetGuncelle === 'function') {
                window.sepetGuncelle();
            }
        } else {
            console.log("Sepet paneli bulunamadı");
        }
    }

    // Oyunları Sıralama
    window.sortGames = function() {
        const sortBy = document.getElementById('sort-by').value;
        istekListesi.sort(getSortFunction(sortBy));
        localStorage.setItem('istekListesi', JSON.stringify(istekListesi));
        istekListesiKartlariniOlustur();
    };

    function getSortFunction(sortBy) {
        const sortFunctions = {
            'name-asc': (a, b) => a.ad.localeCompare(b.ad),
            'name-desc': (a, b) => b.ad.localeCompare(a.ad),
            'price-asc': (a, b) => a.satisFiyati - b.satisFiyati,
            'price-desc': (a, b) => b.satisFiyati - a.satisFiyati,
            'date-asc': (a, b) => new Date(a.eklenmeTarihi) - new Date(b.eklenmeTarihi),
            'date-desc': (a, b) => new Date(b.eklenmeTarihi) - new Date(a.eklenmeTarihi),
            'priority-asc': (a, b) => getPriorityValue(a.oncelik) - getPriorityValue(b.oncelik),
            'priority-desc': (a, b) => getPriorityValue(b.oncelik) - getPriorityValue(a.oncelik),
        };
        return sortFunctions[sortBy] || ((a, b) => 0);
    }

    function getPriorityValue(oncelik) {
        const oncelikSiralama = { 'Az': 1, 'Orta': 2, 'Çok': 3 };
        return oncelikSiralama[oncelik] || 2;
    }

    // İlk başta listeyi oluştur
    istekListesiKartlariniOlustur();
});