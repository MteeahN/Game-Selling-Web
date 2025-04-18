// İstek Listesinden sepete ekleme fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    // İstek listesindeki oyun kartlarını oluşturma ve butonları dinleme
    function istekListesiKartlariniOlustur() {
        // Burada istek listesi verilerinizi alın ve kartları oluşturun
        // Örnek olarak localStorage'dan istek listesini alıyoruz
        const istekListesi = JSON.parse(localStorage.getItem('istekListesi')) || [];
        const gameList = document.getElementById('game-list');
        
        if (!gameList) return; // Game list elementi yoksa fonksiyondan çık
        
        // İstek listesi boşsa
        if (istekListesi.length === 0) {
            gameList.innerHTML = '<div class="empty-list">İstek listenizde oyun bulunmamaktadır.</div>';
            return;
        }
        
        // İstek listesindeki her oyun için kart oluştur
        gameList.innerHTML = '';
        istekListesi.forEach(oyun => {
            // Öncelik sınıfını belirle
            let oncelikSinif = 'priority-medium'; // Varsayılan orta
            if (oyun.oncelik === 'Çok') {
                oncelikSinif = 'priority-high';
            } else if (oyun.oncelik === 'Az') {
                oncelikSinif = 'priority-low';
            }
            
            // Fiyatları virgülle göster
            const satisFiyatiFormatli = formatParaBirimi(oyun.satisFiyati);
            const kiraFiyatiFormatli = formatParaBirimi(oyun.kiraFiyati);
            
            // Eklenme tarihini GG.AA.YYYY formatına dönüştür
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
                        <button class="btn wishlist-buy-btn" data-id="${oyun.id}" data-price="${oyun.satisFiyati}">Satın Al</button>
                        <button class="btn wishlist-rent-btn" data-id="${oyun.id}" data-price="${oyun.kiraFiyati}">Kirala</button>
                        <button class="btn remove-btn" data-id="${oyun.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            gameList.appendChild(oyunKart);
        });
        
        // Satın alma butonlarını dinle
        const satinAlButonlari = document.querySelectorAll('.wishlist-buy-btn');
        satinAlButonlari.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const oyunId = parseInt(this.getAttribute('data-id'));
                const oyun = istekListesi.find(o => o.id === oyunId);
                
                if (oyun) {
                    // Sepete ekle - Satın alma olarak
                    sepeteEkleFromWishlist(oyun, 'Satın Alma');
                }
            });
        });
        
        // Kiralama butonlarını dinle
        const kiralaButonlari = document.querySelectorAll('.wishlist-rent-btn');
        kiralaButonlari.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const oyunId = parseInt(this.getAttribute('data-id'));
                const oyun = istekListesi.find(o => o.id === oyunId);
                
                if (oyun) {
                    // Sepete ekle - Kiralama olarak
                    sepeteEkleFromWishlist(oyun, 'Kiralama');
                }
            });
        });
        
        // Kaldırma butonlarını dinle
        const kaldirButonlari = document.querySelectorAll('.remove-btn');
        kaldirButonlari.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const oyunId = parseInt(this.getAttribute('data-id'));
                istekListesindenKaldir(oyunId);
            });
        });
    }
    
    // Eklenme tarihini GG.AA.YYYY formatına dönüştüren fonksiyon
    function formatEklenmeTarihi(tarih) {
        if (!tarih) return 'Bilinmiyor';
        
        try {
            const date = new Date(tarih);
            if (isNaN(date.getTime())) return 'Bilinmiyor';
            
            // Gün ve ay için başındaki 0'ları ekle (10'dan küçük değerler için)
            const gun = String(date.getDate()).padStart(2, '0');
            const ay = String(date.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başladığı için +1 ekliyoruz
            const yil = date.getFullYear();
            
            return `${gun}.${ay}.${yil}`;
        } catch (e) {
            console.error('Tarih formatlanırken hata oluştu:', e);
            return 'Bilinmiyor';
        }
    }
    
    // İstek listesinden oyun kaldırma fonksiyonu
    function istekListesindenKaldir(oyunId) {
        let istekListesi = JSON.parse(localStorage.getItem('istekListesi')) || [];
        istekListesi = istekListesi.filter(oyun => oyun.id !== oyunId);
        localStorage.setItem('istekListesi', JSON.stringify(istekListesi));
        
        // Listeyi güncelle
        istekListesiKartlariniOlustur();
        
        // Bildirim göster
        bildirimGoster("Oyun istek listenizden kaldırıldı");
    }
    
    // Fiyat formatı için yardımcı fonksiyon (nokta yerine virgül kullanır)
    function formatParaBirimi(fiyat) {
        return fiyat.toFixed(2).replace('.', ',');
    }
    
    // Fiyat değerini sayısal formata çevirme (virgül veya nokta olabilir)
    function parseFiyat(fiyatStr) {
        // Önce TL işaretini ve boşlukları temizle
        fiyatStr = fiyatStr.replace('₺', '').trim();
        
        // Hem virgül hem nokta kullanımını destekle
        if (fiyatStr.includes(',')) {
            // Virgül varsa, virgülü noktaya çevir
            return parseFloat(fiyatStr.replace(',', '.'));
        } else {
            // Nokta varsa direkt parseFloat kullan
            return parseFloat(fiyatStr);
        }
    }
    
    // İstek listesinden sepete ekleme - işlem tipine göre
    function sepeteEkleFromWishlist(oyun, islemTipi) {
        // Sepet modülündeki sepeteEkle fonksiyonunu kullan
        if (typeof window.sepeteEkle === 'function') {
            // İşlem tipine göre fiyat belirle
            const satisFiyatiFormatli = formatParaBirimi(oyun.satisFiyati);
            const kiraFiyatiFormatli = formatParaBirimi(oyun.kiraFiyati);
            
            const fiyat = islemTipi === 'Satın Alma' ? 
                `₺${satisFiyatiFormatli}` : 
                `₺${kiraFiyatiFormatli}`;
            
            // Sepete ekle
            window.sepeteEkle(
                oyun.ad, 
                fiyat, 
                islemTipi, 
                `₺${satisFiyatiFormatli}`, 
                `₺${kiraFiyatiFormatli}`
            );
            
            // Sepet panelini aç
            if (typeof window.sepetPanelAc === 'function') {
                window.sepetPanelAc();
            }
            
            // Bildirim göster
            bildirimGoster(`${oyun.ad} ${islemTipi.toLowerCase()} olarak sepete eklendi!`);
        } else {
            console.error('sepeteEkle fonksiyonu bulunamadı. Sepet.js dosyasının yüklendiğinden emin olun.');
            bildirimGoster('Sepete eklenirken bir hata oluştu!', 'error');
        }
    }
    
    // Bildirim gösterme fonksiyonu
    function bildirimGoster(mesaj, tip = 'success') {
        // Mevcut bildirim fonksiyonu varsa onu kullan
        if (typeof window.bildirimGoster === 'function') {
            window.bildirimGoster(mesaj);
            return;
        }
        
        // Yoksa kendi bildirim fonksiyonumuzu kullan
        const bildirim = document.createElement('div');
        bildirim.className = `bildirim ${tip}`;
        bildirim.innerHTML = mesaj;
        document.body.appendChild(bildirim);
        
        setTimeout(() => {
            bildirim.classList.add('bildirim-goster');
        }, 10);
        
        setTimeout(() => {
            bildirim.classList.remove('bildirim-goster');
            setTimeout(() => {
                document.body.removeChild(bildirim);
            }, 300);
        }, 3000);
    }
    
    // Oyunları sıralama fonksiyonu
    window.sortGames = function() {
        const sortBy = document.getElementById('sort-by').value;
        let istekListesi = JSON.parse(localStorage.getItem('istekListesi')) || [];
        
        switch (sortBy) {
            case 'name-asc':
                istekListesi.sort((a, b) => a.ad.localeCompare(b.ad));
                break;
            case 'name-desc':
                istekListesi.sort((a, b) => b.ad.localeCompare(a.ad));
                break;
            case 'price-asc':
                istekListesi.sort((a, b) => a.satisFiyati - b.satisFiyati);
                break;
            case 'price-desc':
                istekListesi.sort((a, b) => b.satisFiyati - a.satisFiyati);
                break;
            case 'date-asc':
                istekListesi.sort((a, b) => new Date(a.eklenmeTarihi) - new Date(b.eklenmeTarihi));
                break;
            case 'date-desc':
                istekListesi.sort((a, b) => new Date(b.eklenmeTarihi) - new Date(a.eklenmeTarihi));
                break;
            case 'priority-asc':
                // Öncelik sıralaması: Düşük > Orta > Yüksek
                const oncelikSiralama = { 'Düşük': 1, 'Orta': 2, 'Yüksek': 3 };
                istekListesi.sort((a, b) => oncelikSiralama[a.oncelik] - oncelikSiralama[b.oncelik]);
                break;
            case 'priority-desc':
                // Öncelik sıralaması: Yüksek > Orta > Düşük
                const oncelikSiralamaDesc = { 'Düşük': 3, 'Orta': 2, 'Yüksek': 1 };
                istekListesi.sort((a, b) => oncelikSiralamaDesc[a.oncelik] - oncelikSiralamaDesc[b.oncelik]);
                break;
        }
        
        localStorage.setItem('istekListesi', JSON.stringify(istekListesi));
        istekListesiKartlariniOlustur();
    };
    
    istekListesiKartlariniOlustur();
});