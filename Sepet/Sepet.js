// Sepet fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const sepetBtn = document.getElementById('sepet-btn');
    const sepetPanel = document.getElementById('sepet-panel');
    const sepetKapat = document.getElementById('sepet-kapat');
    const overlay = document.getElementById('overlay');
    const sepetUrunler = document.getElementById('sepet-urunler');
    const sepetBosMesaj = document.getElementById('sepet-bos-mesaj');
    const sepetOzet = document.getElementById('sepet-ozet');
    const sepetSayi = document.getElementById('sepet-sayi');
    const araToplam = document.getElementById('ara-toplam');
    const indirim = document.getElementById('indirim');
    const toplam = document.getElementById('toplam');
    const odemeBtn = document.getElementById('odeme-btn');

    // Örnek sepet verileri (localStorage'dan gelecek)
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    //localStorage.clear();

    // Ürün butonlarını dinleme fonksiyonu
    function satinAlButonlariniDinle() {
        const satinAlButonlari = document.querySelectorAll('.btn-minimal:not([data-initialized])');
        
        if (satinAlButonlari && satinAlButonlari.length > 0) {
            satinAlButonlari.forEach(button => {
                // Dinleyici eklendiğini işaretle
                button.setAttribute('data-initialized', 'true');
                
                button.addEventListener('click', function(e) {
                    e.preventDefault(); // Varsayılan davranışı engelle
                    
                    // Tıklama yayılımını engelle
                    e.stopPropagation();
                    
                    const urunKart = e.target.closest('.game-card');
                    if (urunKart) {
                        const urunAdi = urunKart.querySelector('.game-title').textContent;
                        const urunFiyat = urunKart.querySelector('.game-price').textContent;
                        const kiralamaTutari = urunKart.querySelector('.game-rent') ? 
                            urunKart.querySelector('.game-rent').textContent.split(':')[1].trim() : '';
                        
                        // Butonun içeriğine göre işlem türünü belirle
                        const islemTipi = button.textContent.includes('Satın Al') ? 'Satın Alma' : 'Kiralama';
                        
                        // Her iki fiyatı da sepette sakla
                        const satisFiyati = urunFiyat;
                        const kiraFiyati = kiralamaTutari;
                        
                        // Sepete ekle
                        sepeteEkle(urunAdi, islemTipi === 'Satın Alma' ? urunFiyat : kiralamaTutari, islemTipi, satisFiyati, kiraFiyati);
                        
                        // Sepeti göster
                        sepetPanelAc();
                        
                        // Console'a bilgi yazdır (debugging amaçlı)
                        console.log(`Ürün eklendi: ${urunAdi}, İşlem: ${islemTipi}`);
                    }
                });
            });
        }
    }

    // Sepet panelini aç
    function sepetPanelAc() {
        if (!sepetPanel || !overlay) return; // Eğer elemanlar tanımlı değilse işlemi durdur

        sepetPanel.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfayı kaydırmayı engelle

        sepetGuncelle();
        sepetSayisiniGuncelle();
    }

    // Sepete ürün ekle - hem satış hem kiralama fiyatını kaydet
    function sepeteEkle(urunAdi, fiyat, islemTipi, satisFiyati, kiraFiyati) {
        // Fiyatı sayıya çevir - Önce düzgün bir formata getir
        // Fiyat formatı temizleme
        let temizFiyat = fiyat.replace('₺', '').trim();
        let fiyatDeger;
        
        // Fiyat formatını kontrol et
        if (temizFiyat.includes(',') || temizFiyat.includes('.')) {
            // Virgül ve noktalı formatta (örn: 1.234,56 veya 1,234.56)
            temizFiyat = temizFiyat.replace(/\./g, '').replace(',', '.');
            fiyatDeger = parseFloat(temizFiyat);
        } else {
            // Sadece rakam varsa, 100'e böl (kuruş için)
            fiyatDeger = parseInt(temizFiyat) / 100;
        }
        
        // Geçerli bir sayı değilse varsayılan değer ver
        if (isNaN(fiyatDeger)) {
            console.error('Geçersiz fiyat değeri:', fiyat);
            fiyatDeger = 0;
        }

        // Satış fiyatını temizle ve sayıya çevir
        let temizSatisFiyati = satisFiyati ? satisFiyati.replace('₺', '').trim() : '0';
        let satisFiyatDeger;
        
        if (temizSatisFiyati.includes(',') || temizSatisFiyati.includes('.')) {
            temizSatisFiyati = temizSatisFiyati.replace(/\./g, '').replace(',', '.');
            satisFiyatDeger = parseFloat(temizSatisFiyati);
        } else {
            satisFiyatDeger = parseInt(temizSatisFiyati) / 100;
        }
        
        if (isNaN(satisFiyatDeger)) satisFiyatDeger = 0;

        // Kiralama fiyatını temizle ve sayıya çevir
        let temizKiraFiyati = kiraFiyati ? kiraFiyati.replace('₺', '').trim() : '0';
        let kiraFiyatDeger;
        
        if (temizKiraFiyati.includes(',') || temizKiraFiyati.includes('.')) {
            temizKiraFiyati = temizKiraFiyati.replace(/\./g, '').replace(',', '.');
            kiraFiyatDeger = parseFloat(temizKiraFiyati);
        } else {
            kiraFiyatDeger = parseInt(temizKiraFiyati) / 100;
        }
        
        if (isNaN(kiraFiyatDeger)) kiraFiyatDeger = 0;

        // Ürün zaten sepette var mı kontrol et (sadece ürün adına göre)
        const mevcutUrun = sepet.find(urun => urun.ad === urunAdi);

        if (mevcutUrun) {
            // Ürün zaten varsa adeti artır
            mevcutUrun.adet += 1;
            console.log(`Mevcut ürün adeti arttırıldı: ${urunAdi}, Yeni adet: ${mevcutUrun.adet}`);
        } 
        else {
            // Yeni ürün ekle - hem kira hem satış fiyatı ile
            sepet.push({
                id: Date.now(), // Benzersiz ID
                ad: urunAdi,
                fiyat: fiyatDeger,
                adet: 1,
                tip: islemTipi,
                satisFiyati: satisFiyatDeger,
                kiraFiyati: kiraFiyatDeger,
                img: '/api/placeholder/80/80' // Placeholder resim
            });
            console.log(`Yeni ürün eklendi: ${urunAdi}, Fiyat: ${fiyatDeger}`);
        }

        // Sepeti kaydet ve güncelle
        localStorage.setItem('sepet', JSON.stringify(sepet));
        sepetGuncelle();
        sepetSayisiniGuncelle();

        // Bildirim göster
        bildirimGoster(`${urunAdi} sepete eklendi!`);
    }

    // İşlem tipini değiştir (satın alma/kiralama)
    function islemTipiDegistir(urunId, yeniTip) {
        const urun = sepet.find(urun => urun.id === urunId);
        if (urun) {
            urun.tip = yeniTip;
            
            // İşlem tipine göre fiyatı güncelle
            if (yeniTip === 'Satın Alma') {
                urun.fiyat = urun.satisFiyati;
            } else if (yeniTip === 'Kiralama') {
                urun.fiyat = urun.kiraFiyati;
            }
            
            localStorage.setItem('sepet', JSON.stringify(sepet));
            sepetGuncelle();
            sepetSayisiniGuncelle();
            bildirimGoster(`"${urun.ad}" ürününün işlem tipi "${yeniTip}" olarak güncellendi`);
        }
    }

    // Sepetten ürün çıkar
    function sepettenCikar(urunId) {
        sepet = sepet.filter(urun => urun.id !== urunId);
        localStorage.setItem('sepet', JSON.stringify(sepet));
        sepetGuncelle();
        bildirimGoster("Ürün sepetten kaldırıldı");
    }

    // Ürün adetini güncelle
    function urunAdetGuncelle(urunId, yeniAdet) {
        const urun = sepet.find(urun => urun.id === urunId);
        
        if (urun) {
            // Eğer adet 0 veya daha az ise ürünü sepetten kaldır
            if (yeniAdet <= 0) {
                sepettenCikar(urunId);
                return;
            }
            
            // Ürün adetini güncelle
            urun.adet = yeniAdet;
            
            // Sepeti localStorage'a kaydet
            localStorage.setItem('sepet', JSON.stringify(sepet));
            
            // Sepet görünümünü güncelle
            sepetGuncelle();
            sepetSayisiniGuncelle();
            
            // Bildirim göster
            bildirimGoster(`${urun.ad} adedi güncellendi (${yeniAdet})`);
        }
    }

// Sepet içeriğini güncelle fonksiyonundaki değişiklikler
function sepetGuncelle() {
    // Sepet boşsa veya boş değilse uygun görünüm göster
    if (sepet.length === 0) {
        if (sepetBosMesaj) sepetBosMesaj.style.display = 'flex';
        if (sepetOzet) sepetOzet.style.display = 'none';
        if (sepetUrunler) {
            sepetUrunler.innerHTML = '';
            if (sepetBosMesaj) {
                sepetUrunler.appendChild(sepetBosMesaj);
            }
        }
        if (sepetSayi) sepetSayi.textContent = '0';
    } 
    else {
        if (sepetBosMesaj) sepetBosMesaj.style.display = 'none';
        if (sepetOzet) sepetOzet.style.display = 'block';
        
        // Ürünleri temizle ve yeniden oluştur
        if (sepetUrunler) {
            sepetUrunler.innerHTML = '';
            
            // Toplam ürün sayısını hesapla
            let toplamAdet = 0;
            let toplamTutar = 0;
            
            // Her ürün için sepet öğesi oluştur
            sepet.forEach(urun => {
                const urunElement = document.createElement('div');
                urunElement.className = 'sepet-urun';
                
                // Dropdown yerine tıklanabilir düğme olarak işlem tipi
                urunElement.innerHTML = `
                    <img src="${urun.img}" alt="${urun.ad}" class="sepet-urun-img">
                    <div class="sepet-urun-detay">
                        <div class="sepet-urun-baslik">${urun.ad}</div>
                        <button class="operation-type-button" data-id="${urun.id}" data-tip="${urun.tip}">
                            ${urun.tip}
                        </button>
                        <div class="sepet-urun-fiyat">₺${urun.fiyat.toFixed(2)}</div>
                        <div class="sepet-urun-adet">
                            <button class="adet-btn adet-azalt" data-id="${urun.id}">-</button>
                            <span class="adet-sayi">${urun.adet}</span>
                            <button class="adet-btn adet-artir" data-id="${urun.id}">+</button>
                        </div>
                    </div>
                <button class="sepet-urun-sil" data-id="${urun.id}"><i class="fas fa-trash"></i></button>
                `;
                
                sepetUrunler.appendChild(urunElement);
                
                // Toplam adet ve tutarı güncelle
                toplamAdet += urun.adet;
                toplamTutar += (urun.fiyat * urun.adet);
            });
            
            // Event dinleyicileri ekle
            const silButonlari = sepetUrunler.querySelectorAll('.sepet-urun-sil');
            silButonlari.forEach(btn => {
                btn.addEventListener('click', function() {
                    const urunId = parseInt(this.getAttribute('data-id'));
                    sepettenCikar(urunId);
                });
            });
            
            const azaltButonlari = sepetUrunler.querySelectorAll('.adet-azalt');
            azaltButonlari.forEach(btn => {
                btn.addEventListener('click', function() {
                    const urunId = parseInt(this.getAttribute('data-id'));
                    const urun = sepet.find(u => u.id === urunId);
                    if (urun) {
                        urunAdetGuncelle(urunId, urun.adet - 1);
                    }
                });
            });
            
            const artirButonlari = sepetUrunler.querySelectorAll('.adet-artir');
            artirButonlari.forEach(btn => {
                btn.addEventListener('click', function() {
                    const urunId = parseInt(this.getAttribute('data-id'));
                    const urun = sepet.find(u => u.id === urunId);
                    if (urun) {
                        urunAdetGuncelle(urunId, urun.adet + 1);
                    }
                });
            });
            
            // İşlem tipi butonları için dinleyiciler
            const islemTipiButonlari = sepetUrunler.querySelectorAll('.operation-type-button');
            islemTipiButonlari.forEach(btn => {
                btn.addEventListener('click', function() {
                    const urunId = parseInt(this.getAttribute('data-id'));
                    const suankiTip = this.getAttribute('data-tip');
                    
                    // İşlem tipini değiştir
                    const yeniTip = suankiTip === 'Satın Alma' ? 'Kiralama' : 'Satın Alma';
                    
                    // Butonun görüntüsünü güncelle
                    this.textContent = yeniTip;
                    this.setAttribute('data-tip', yeniTip);
                    
                    // İşlem tipini veritabanında güncelle
                    islemTipiDegistir(urunId, yeniTip);
                });
            });
        }
        
        // Sepet sayısını güncelle
        if (sepetSayi) {
            let toplamAdet = 0;
            sepet.forEach(urun => {
                toplamAdet += urun.adet;
            });
            sepetSayi.textContent = toplamAdet.toString();
        }
        
        // Özet alanını güncelle
        if (araToplam && indirim && toplam) {
            let toplamTutar = 0;
            sepet.forEach(urun => {
                toplamTutar += (urun.fiyat * urun.adet);
            });
            
            araToplam.textContent = `₺${toplamTutar.toFixed(2)}`;
            
            // Örnek indirim hesaplama 
            const indirimTutari = toplamTutar > 1000 ? toplamTutar * 0.1 : 0;
            indirim.textContent = `-₺${indirimTutari.toFixed(2)}`;
            
            // Toplam tutar
            const odenecekTutar = toplamTutar - indirimTutari;
            toplam.textContent = `₺${odenecekTutar.toFixed(2)}`;
        }
    }
}

    // Bildirim göster
    function bildirimGoster(mesaj) {
        const bildirim = document.createElement('div');
        bildirim.className = 'bildirim';
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

    // Sepeti ilk yükleme
    sepetGuncelle();

    // Sepet butonunu dinle
    if (sepetBtn) {
        sepetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sepetPanelAc();
        });
    }

    // Sepet panelini kapat
    if (sepetKapat) {
        sepetKapat.addEventListener('click', function() {
            sepetPanel.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Sayfayı kaydırmayı tekrar etkinleştir
        });
    }

    // Overlay'e tıklandığında sepeti kapat
    if (overlay) {
        overlay.addEventListener('click', function() {
            sepetPanel.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Ödeme butonuna tıklandığında
    if (odemeBtn) {
        odemeBtn.addEventListener('click', function() {
            // Burada ödeme sayfasına yönlendirme olacak
            alert('Ödeme sayfasına yönlendiriliyorsunuz...');
            // window.location.href = "Odeme.html";
        });
    }

    // Ana sayfadaki butonları dinle
    satinAlButonlariniDinle();

    // Global erişime açarak diğer scriptlerin kullanabilmesini sağla
    window.sepetGuncelle = sepetGuncelle;
    window.sepeteEkle = sepeteEkle;
    window.sepettenCikar = sepettenCikar;
    window.urunAdetGuncelle = urunAdetGuncelle;
    window.sepetPanelAc = sepetPanelAc;
    window.islemTipiDegistir = islemTipiDegistir; // Yeni fonksiyonu da ekleyelim
});

// Ana sayfada sepet simgesinin sayısını güncelle
document.addEventListener('DOMContentLoaded', function() {
    // Ana sayfada sepet butonunu güncelle
    const sepetLink = document.querySelector('.user-actions a:last-child');
    if (sepetLink && !sepetLink.hasAttribute('data-initialized')) {
        sepetLink.setAttribute('data-initialized', 'true');
        sepetLink.id = 'sepet-btn';
        
        // Sepet sayısı ekle
        const sepetSayi = document.createElement('span');
        sepetSayi.id = 'sepet-sayi';
        sepetSayi.textContent = '0';
        sepetLink.appendChild(sepetSayi);
        
        // Link davranışını değiştir
        sepetLink.href = '#';
        sepetLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Eğer sepet paneli varsa aç, yoksa sepet.html'e yönlendir
            const sepetPanel = document.getElementById('sepet-panel');
            if (sepetPanel) {
                sepetPanel.classList.add('active');
                document.getElementById('overlay').classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Sepeti güncelle
                const sepetGuncelleFn = window.sepetGuncelle;
                if (typeof sepetGuncelleFn === 'function') {
                    sepetGuncelleFn();
                }
            } 
            else {
                window.location.href = 'Sepet.html';
            }
        });
    }

    // Sepet sayısını localStorage'dan güncelle
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

    // Sayfa yüklendiğinde sepet sayısını güncelle
    sepetSayisiniGuncelle();
    sepetGuncelle();
    
    // LocalStorage değişikliklerini dinle
    window.addEventListener('storage', function(e) {
        if (e.key === 'sepet') {
            sepetSayisiniGuncelle();
        }
    });
    
    // Sepet sayısını güncelleyen fonksiyonu global kapsamda diğer scriptlerin erişimine aç
    window.sepetSayisiniGuncelle = sepetSayisiniGuncelle;
});