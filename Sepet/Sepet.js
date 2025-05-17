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

    // Global erişime açarak diğer scriptlerin kullanabilmesini sağla
    window.Sepet = {
        sepetGuncelle: sepetGuncelle,
        sepeteEkle: sepeteEkle,
        sepettenCikar: sepettenCikar,
        urunAdetGuncelle: urunAdetGuncelle,
        sepetPanelAc: sepetPanelAc,
        islemTipiDegistir: islemTipiDegistir,
        kiralamaSuresiDegistir: kiralamaSuresiDegistir,
        sepetSayisiniGuncelle: sepetSayisiniGuncelle,
        bildirimGoster: bildirimGoster,
    };

    // Örnek sepet verileri (localStorage'dan gelecek)
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    //localStorage.clear();

    // Kiralama süresi çarpanları (fiyat faktörleri)
    const kiralamaSuresiCarpanlari = {
        'Haftalık': 1.0,
        'Aylık': 3
    };

    // Satın Al ve Kirala butonlarını dinleme fonksiyonu
    function butonlariDinle() {
        // Tüm buton konteynerlerini seç (henüz initialize edilmemişleri)
        const butonKonteynerleri = document.querySelectorAll('.button-container:not([data-initialized])');
        
        if (butonKonteynerleri && butonKonteynerleri.length > 0) {
            butonKonteynerleri.forEach(konteyner => {
                // Dinleyici eklendiğini işaretle
                konteyner.setAttribute('data-initialized', 'true');
                
                // Satın Al butonu için dinleyici ekle
                const satinAlButonu = konteyner.querySelector('.buy-button');
                if (satinAlButonu) {
                    satinAlButonu.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation(); // Tıklama yayılımını engelle
                        
                        const urunKart = e.target.closest('.game-card');
                        if (urunKart) {
                            const urunAdi = urunKart.querySelector('.game-title').textContent;
                            const urunFiyat = urunKart.querySelector('.game-price').textContent;
                            const kiralamaTutari = urunKart.querySelector('.game-rent') ? 
                                urunKart.querySelector('.game-rent').textContent.split(':')[1].trim() : '';
                            
                            // İşlem tipi olarak "Satın Alma" belirt
                            const islemTipi = 'Satın Alma';
                            
                            // Her iki fiyatı da sepette sakla
                            const satisFiyati = urunFiyat;
                            const kiraFiyati = kiralamaTutari;
                            
                            // Sepete ekle
                            sepeteEkle(urunAdi, satisFiyati, islemTipi, satisFiyati, kiraFiyati, 'Haftalık');
                            
                            // Sepeti göster
                            sepetPanelAc();
                            
                            console.log(`Ürün eklendi: ${urunAdi}, İşlem: ${islemTipi}`);
                        }
                    });
                }
                
                // Kirala butonu için dinleyici ekle
                const kiralaButonu = konteyner.querySelector('.rent-button');
                if (kiralaButonu) {
                    kiralaButonu.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation(); // Tıklama yayılımını engelle
                        
                        const urunKart = e.target.closest('.game-card');
                        if (urunKart) {
                            const urunAdi = urunKart.querySelector('.game-title').textContent;
                            const urunFiyat = urunKart.querySelector('.game-price').textContent;
                            const kiralamaTutari = urunKart.querySelector('.game-rent') ? 
                                urunKart.querySelector('.game-rent').textContent.split(':')[1].trim() : '';
                            
                            // İşlem tipi olarak "Kiralama" belirt
                            const islemTipi = 'Kiralama';
                            
                            // Her iki fiyatı da sepette sakla
                            const satisFiyati = urunFiyat;
                            const kiraFiyati = kiralamaTutari;
                            
                            // Sepete ekle - varsayılan kiralama süresi "Haftalık"
                            sepeteEkle(urunAdi, kiralamaTutari, islemTipi, satisFiyati, kiraFiyati, 'Haftalık');
                            
                            // Sepeti göster
                            sepetPanelAc();
                            
                            console.log(`Ürün eklendi: ${urunAdi}, İşlem: ${islemTipi}`);
                        }
                    });
                }
            });
        }
    }

    // Sayfa yüklendiğinde butonları dinlemeye başla
    butonlariDinle();
    
    // Global erişim için fonksiyonu dışa aktar
    window.butonlariDinle = butonlariDinle;
    
    // Mevcut sepetGuncelle fonksiyonu varsa, yeni fonksiyonla birleştir
    sepetGuncelle();

    // Sepet panelini aç
    function sepetPanelAc() {
        if (!sepetPanel || !overlay) return; // Eğer elemanlar tanımlı değilse işlemi durdur

        sepetPanel.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfayı kaydırmayı engelle

        sepetGuncelle();
        sepetSayisiniGuncelle();
    }

    // Sepete ürün ekle
    function sepeteEkle(urunAdi, fiyat, islemTipi, satisFiyati, kiraFiyati, kiralamaSuresi = 'Haftalık') {
        // Fiyatı sayıya çevir - Önce düzgün bir formata getir
        let temizFiyat = fiyat.replace('₺', '').trim();
        let fiyatDeger;

        // Fiyat formatını kontrol et
        if (temizFiyat.includes(',') || temizFiyat.includes('.')) {
            temizFiyat = temizFiyat.replace(/[^\d,.-]/g, '')  // Sadece rakam, nokta ve virgül bırak
                        .replace(/\./g, '')        // Binlik ayırıcıları kaldır
                        .replace(',', '.');        // Virgülü noktaya çevir
            fiyatDeger = parseFloat(temizFiyat);
        } else {
            fiyatDeger = parseInt(temizFiyat) / 100;
        }

        // Geçerli bir sayı değilse varsayılan değer ver
        if (isNaN(fiyatDeger)) {
            console.error('Geçersiz fiyat değeri:', fiyat);
            fiyatDeger = 0;
        }

        // Satış fiyatını düzenle
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

        // Kiralama için süre faktörünü uygula
        if (islemTipi === 'Kiralama') {
            const sureFaktoru = kiralamaSuresiCarpanlari[kiralamaSuresi] || 1.0;
            fiyatDeger = kiraFiyatDeger * sureFaktoru;
        }

        // DEĞİŞİKLİK: Sadece ürün adına göre kontrol et (işlem tipini kontrol etme)
        const mevcutUrun = sepet.find(urun => urun.ad === urunAdi);

        if (mevcutUrun) {
            // Eğer ürün zaten sepette varsa adeti artır
            mevcutUrun.adet += 1;
            
            // İşlem tipini en son seçilene göre güncelle
            mevcutUrun.tip = islemTipi;
            
            // İşlem tipine göre fiyatı güncelle
            if (islemTipi === 'Satın Alma') {
                mevcutUrun.fiyat = satisFiyatDeger;
            } else { // Kiralama
                const sureFaktoru = kiralamaSuresiCarpanlari[kiralamaSuresi] || 1.0;
                mevcutUrun.fiyat = kiraFiyatDeger * sureFaktoru;
            }
            
            // Kiralama süresini güncelle
            mevcutUrun.kiralamaSuresi = kiralamaSuresi;
            
            console.log(`Mevcut ürün adeti arttırıldı: ${urunAdi}, Yeni adet: ${mevcutUrun.adet}, İşlem: ${islemTipi}`);
        } else {
            sepet.push({
                id: Date.now(),
                ad: urunAdi,
                fiyat: fiyatDeger,
                adet: 1,
                tip: islemTipi,
                satisFiyati: satisFiyatDeger,
                kiraFiyati: kiraFiyatDeger,
                kiralamaSuresi: kiralamaSuresi,
                img: 'https://via.placeholder.com/80' 
            });
            console.log(`Yeni ürün eklendi: ${urunAdi}, Fiyat: ${fiyatDeger}, İşlem: ${islemTipi}`);
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
                // Kiralama süresi faktörünü uygula
                const sureFaktoru = kiralamaSuresiCarpanlari[urun.kiralamaSuresi] || 1.0;
                urun.fiyat = urun.kiraFiyati * sureFaktoru;
            }
            
            localStorage.setItem('sepet', JSON.stringify(sepet));
            sepetGuncelle();
            sepetSayisiniGuncelle();
            bildirimGoster(`"${urun.ad}" ürününün işlem tipi "${yeniTip}" olarak güncellendi`);
        }
    }

    // Kiralama süresini değiştir
    function kiralamaSuresiDegistir(urunId, yeniSure) {
        const urun = sepet.find(urun => urun.id === urunId);
        if (urun && urun.tip === 'Kiralama') {
            urun.kiralamaSuresi = yeniSure;
            
            // Süreye göre fiyatı güncelle
            const sureFaktoru = kiralamaSuresiCarpanlari[yeniSure] || 1.0;
            urun.fiyat = urun.kiraFiyati * sureFaktoru;
            
            localStorage.setItem('sepet', JSON.stringify(sepet));
            sepetGuncelle();
            sepetSayisiniGuncelle();
            bildirimGoster(`"${urun.ad}" ürününün kiralama süresi "${yeniSure}" olarak güncellendi`);
        }
    }

    // Sepetten ürün çıkar
    function sepettenCikar(urunId) {
        sepet = sepet.filter(urun => urun.id !== urunId);
        localStorage.setItem('sepet', JSON.stringify(sepet));
        sepetGuncelle();
        sepetSayisiniGuncelle();
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

    // Sepet içeriğini güncelle fonksiyonu
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
                    
                    // İşlem tipi ve kiralama süresi butonları yan yana olacak
                    let islemTipiVeSureHtml = `
                        <div class="islem-secenekleri">
                            <button class="operation-type-button" data-id="${urun.id}" data-tip="${urun.tip}">
                                ${urun.tip}
                            </button>
                            ${urun.tip === 'Kiralama' ? `
                            <button class="kiralama-suresi-btn" data-id="${urun.id}" data-sure="${urun.kiralamaSuresi}">
                                ${urun.kiralamaSuresi}
                            </button>
                            ` : ''}
                        </div>
                    `;
                    
                    urunElement.innerHTML = `
                        <img src="${urun.img}" alt="${urun.ad}" class="sepet-urun-img">
                        <div class="sepet-urun-detay">
                            <div class="sepet-urun-baslik">${urun.ad}</div>
                            ${islemTipiVeSureHtml}
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
                        
                        // İşlem tipine göre kiralama süresi seçicisini güncelle
                        const urunElement = this.closest('.sepet-urun');
                        const islemSecenekleri = this.closest('.islem-secenekleri');
                        let kiralamaSuresiBtn = islemSecenekleri.querySelector('.kiralama-suresi-btn');
                        
                        if (yeniTip === 'Kiralama') {
                            // Kiralama seçicisi yoksa oluştur
                            if (!kiralamaSuresiBtn) {
                                kiralamaSuresiBtn = document.createElement('button');
                                kiralamaSuresiBtn.className = 'kiralama-suresi-btn';
                                kiralamaSuresiBtn.setAttribute('data-id', urunId);
                                kiralamaSuresiBtn.setAttribute('data-sure', 'Haftalık');
                                kiralamaSuresiBtn.textContent = 'Haftalık';
                                
                                // İşlem tipi butonunun yanına ekle
                                islemSecenekleri.appendChild(kiralamaSuresiBtn);
                                
                                // İşlem seçenekleri konteynerine kiralama aktif sınıfı ekle
                                islemSecenekleri.classList.add('kiralama-active');
                                
                                // Yeni eklenen butona olay dinleyicisi ekle
                                kiralamaSuresiBtn.addEventListener('click', function() {
                                    const urunId = parseInt(this.getAttribute('data-id'));
                                    const mevcutSure = this.getAttribute('data-sure');
                                    
                                    // Tıklandığında süreler arasında geçiş yap
                                    const yeniSure = mevcutSure === 'Haftalık' ? 'Aylık' : 'Haftalık';
                                    
                                    // Butonun metnini ve data-sure özelliğini güncelle
                                    this.textContent = yeniSure;
                                    this.setAttribute('data-sure', yeniSure);
                                    
                                    // Vurgu animasyonu ekle
                                    this.classList.remove('highlight-animation');
                                    void this.offsetWidth; // Reflow tetikleyerek animasyonu sıfırla
                                    this.classList.add('highlight-animation');
                                    
                                    // Süreyi güncelle ve fiyatı değiştir
                                    kiralamaSuresiDegistir(urunId, yeniSure);
                                });
                            } else {
                                // Kiralama seçicisi varsa görünür yap
                                kiralamaSuresiBtn.style.display = 'inline-block';
                                // İşlem seçenekleri konteynerine kiralama aktif sınıfı ekle
                                islemSecenekleri.classList.add('kiralama-active');
                            }
                        } else if (kiralamaSuresiBtn) {
                            // Satın alma seçildiğinde kiralama süresini gizle
                            kiralamaSuresiBtn.style.display = 'none';
                            // İşlem seçenekleri konteynerinden kiralama aktif sınıfını kaldır
                            islemSecenekleri.classList.remove('kiralama-active');
                        }
                    });
                });
                
                // Kiralama süresi butonları için dinleyiciler
                const kiralamaSuresiButonlari = sepetUrunler.querySelectorAll('.kiralama-suresi-btn');
                kiralamaSuresiButonlari.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const urunId = parseInt(this.getAttribute('data-id'));
                        const mevcutSure = this.getAttribute('data-sure');
                        
                        // Tıklandığında süreler arasında geçiş yap
                        const yeniSure = mevcutSure === 'Haftalık' ? 'Aylık' : 'Haftalık';
                        
                        // Butonun metnini ve data-sure özelliğini güncelle
                        this.textContent = yeniSure;
                        this.setAttribute('data-sure', yeniSure);
                        
                        // Süreyi güncelle ve fiyatı değiştir
                        kiralamaSuresiDegistir(urunId, yeniSure);
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
                const INDIRIM_ESIK = 1000;
                const INDIRIM_ORANI = 0.1;
                const indirimTutari = toplamTutar > INDIRIM_ESIK ? toplamTutar * INDIRIM_ORANI : 0;

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
        bildirim.className = 'bildirim-goster';
        bildirim.innerHTML = mesaj;
        document.body.appendChild(bildirim);
        
        setTimeout(() => {
            bildirim.classList.add('bildirim');
        }, 10);
        
        setTimeout(() => {
            bildirim.classList.remove('bildirim');
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
    if (typeof satinAlButonlariniDinle === 'function') {
        satinAlButonlariniDinle();
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
                const sepetGuncelle = window.sepetGuncelle;
                if (typeof sepetGuncelle === 'function') {
                    sepetGuncelle();
                }
            }
        });
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
});