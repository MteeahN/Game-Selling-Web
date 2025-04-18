
// Basit Dinamik 3D Efekt 
document.addEventListener('DOMContentLoaded', function() {
    const categoryBoxes = document.querySelectorAll('.category-box');
    
    categoryBoxes.forEach(box => {
        box.addEventListener('mousemove', function(e) {
            // Kart üzerindeki fare pozisyonunu hesapla
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // X pozisyonu
            const y = e.clientY - rect.top;  // Y pozisyonu
            
            // Kartın merkezinden olan mesafeyi hesapla
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Fare pozisyonuna göre dönüş açısını ayarla (maksimum ±15 derece)
            const rotateY = ((x - centerX) / centerX) * 10; // X ekseni için dönüş
            const rotateX = -((y - centerY) / centerY) * 10; // Y ekseni için dönüş
            
            // 3D dönüş efektini uygula
            this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        // Fare karttan çıkınca normal haline döndür
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
});

// Sayfalar Arasını Geçiş Animasyonu
document.addEventListener('DOMContentLoaded', function() {
    // Navigasyon bağlantılarını seç
    const navLinks = document.querySelectorAll('.main-nav a');

    // Animasyon çalışırken başka animasyonları engellemek için
    let isAnimating = false;

    // Her bağlantıya tıklama olayı ekle
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Eğer bağlantı bir iç bağlantıysa (#)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement && !isAnimating) {
                    // Aktif bağlantıyı güncelle
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Animasyon çalışıyor işaretçisi
                    isAnimating = true;
                    
                    // Hedef konumu hesapla (header yüksekliğini çıkararak)
                    const headerOffset = 125; // Header yüksekliğinize göre ayarlayın
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    // Başlangıç ve hedef konumları
                    const startPosition = window.pageYOffset;
                    const distance = offsetPosition - startPosition;
                    
                    // Animasyon ayarları
                    let startTime = null;
                    const duration = 1000; // Animasyon süresi (ms)
                    
                    // Özelleştirilmiş easing fonksiyonu (cubic-bezier benzeri)
                    function easeInOutCubic(t) {
                        return t < 0.5 
                            ? 4 * t * t * t 
                            : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    }
                    
                    // Animasyon fonksiyonu
                    function animation(currentTime) {
                        if (startTime === null) startTime = currentTime;
                        const timeElapsed = currentTime - startTime;
                        const progress = Math.min(timeElapsed / duration, 1);
                        const easing = easeInOutCubic(progress);
                        
                        window.scrollTo(0, startPosition + distance * easing);
                        
                        // Animasyon devam ediyor
                        if (timeElapsed < duration) {
                            requestAnimationFrame(animation);
                        } 
                        else {
                            // Animasyon tamamlandı
                            isAnimating = false;
                            
                            // URL'yi güncelle
                            history.pushState(null, null, targetId);
                        }
                    }
                    
                // Animasyonu başlat
                requestAnimationFrame(animation);
                }
            }
        });
    });

    // Sayfa scroll olayını dinle ve aktif bağlantıyı güncelle
    window.addEventListener('scroll', function() {
        if (!isAnimating) {
            const scrollPosition = window.pageYOffset;
            
            // Tüm bölümleri kontrol et ve hangisinin görünür olduğunu belirle
            document.querySelectorAll('section, .main-slider, .subscription-banner, div[id]').forEach(section => {
                if (!section.id) return;
                
                const sectionTop = section.offsetTop - 120;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    // Aktif bağlantıyı güncelle
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    });
});

// Öne Çıkanlar Kaydırma
document.addEventListener('DOMContentLoaded', function() {
    // Tüm oyun kartları bölümlerini seç
    const gameSections = document.querySelectorAll('.game-section-wrapper');

    gameSections.forEach(section => {
        const gameCards = section.querySelector('.game-cards');
        const leftArrow = section.querySelector('.scroll-arrow-left');
        const rightArrow = section.querySelector('.scroll-arrow-right');

        // Kaydırma miktarını hesapla (kartların genişliği + boşluk)
        const scrollAmount = gameCards.querySelector('.game-card').offsetWidth + 15;

        // Sağa kaydırma
        rightArrow.addEventListener('click', () => {
            gameCards.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Sola kaydırma
        leftArrow.addEventListener('click', () => {
            gameCards.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
    });
});

// Istek Listesine Ekleme
document.addEventListener('DOMContentLoaded', function() {
    // İstek listesi işlemleri
    function wishlistInit() {
        // İstek listesini localStorage'dan al
        const getWishlist = () => {
            return JSON.parse(localStorage.getItem('istekListesi')) || [];
        };

        // İstek listesini localStorage'a kaydet
        const saveWishlist = (wishlist) => {
            localStorage.setItem('istekListesi', JSON.stringify(wishlist));
        };

        // Oyunun istek listesinde olup olmadığını kontrol et
        const isInWishlist = (gameId) => {
            const wishlist = getWishlist();
            return wishlist.some(game => game.id === parseInt(gameId));
        };

        // İstek listesine oyun ekle
        const addToWishlist = (gameId, gameName, purchasePrice, rentPrice) => {
            const wishlist = getWishlist();
            
            // Eğer oyun zaten istek listesindeyse, ekleme yapma
            if (isInWishlist(gameId)) {
                return false;
            }
            
            // Yeni oyun ekle
            const newGame = {
                id: parseInt(gameId),
                ad: gameName,
                satisFiyati: parseFloat(purchasePrice),
                kiraFiyati: parseFloat(rentPrice),
                img: "/api/placeholder/300/150",
                oncelik: "Normal",
                eklenmeTarihi: new Date().toISOString().split('T')[0]
            };
            
            wishlist.push(newGame);
            saveWishlist(wishlist);
            return true;
        };

        // İstek listesinden oyun çıkar
        const removeFromWishlist = (gameId) => {
            let wishlist = getWishlist();
            
            // Oyunu filtrele (çıkar)
            wishlist = wishlist.filter(game => game.id !== parseInt(gameId));
            
            saveWishlist(wishlist);
            return true;
        };

        // İstek listesi ikonlarını güncelle
        const updateWishlistIcons = () => {
            const wishlistIcons = document.querySelectorAll('.wishlist-icon');
            
            wishlistIcons.forEach(icon => {
                const gameId = icon.getAttribute('data-id');
                
                if (isInWishlist(gameId)) {
                    icon.classList.add('active');
                    icon.querySelector('i').classList.remove('far');
                    icon.querySelector('i').classList.add('fas');
                } else {
                    icon.classList.remove('active');
                    icon.querySelector('i').classList.remove('fas');
                    icon.querySelector('i').classList.add('far');
                }
            });
        };

        // İstek listesi ikonlarına tıklama olaylarını ekle
        const wishlistIcons = document.querySelectorAll('.wishlist-icon');
        
        wishlistIcons.forEach(icon => {
            icon.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const gameId = this.getAttribute('data-id');
                const gameName = this.getAttribute('data-name');
                const purchasePrice = this.getAttribute('data-purchase');
                const rentPrice = this.getAttribute('data-rent');
                
                if (isInWishlist(gameId)) {
                    // İstek listesinden çıkar
                    if (removeFromWishlist(gameId)) {
                        bildirimGoster(`${gameName} istek listenizden çıkarıldı`);
                    }
                } else {
                    // İstek listesine ekle
                    if (addToWishlist(gameId, gameName, purchasePrice, rentPrice)) {
                        bildirimGoster(`${gameName} istek listenize eklendi`);
                    }
                }
                
                // İkonları güncelle
                updateWishlistIcons();
            });
        });

        // Sayfa yüklendiğinde ikonları güncelle
        updateWishlistIcons();
    }
    
    // Bildirim gösterme fonksiyonu
    window.bildirimGoster = function(mesaj, tip = 'success') {
        const bildirim = document.createElement('div');
        bildirim.className = `bildirim ${tip}`;
        bildirim.textContent = mesaj;
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
    };

    // Kaydırma okları için işlevsellik
    const initScrollArrows = () => {
        const sections = document.querySelectorAll('.game-section-wrapper');
        
        sections.forEach(section => {
            const gameCards = section.querySelector('.game-cards');
            const leftArrow = section.querySelector('.scroll-arrow-left');
            const rightArrow = section.querySelector('.scroll-arrow-right');
            
            if (leftArrow && rightArrow && gameCards) {
                leftArrow.addEventListener('click', () => {
                    gameCards.scrollBy({ left: -230, behavior: 'smooth' });
                });
                
                rightArrow.addEventListener('click', () => {
                    gameCards.scrollBy({ left: 230, behavior: 'smooth' });
                });
            }
        });
    };
    
    // Tüm fonksiyonları başlat
    wishlistInit();
    initScrollArrows();
});

// Mobil
// Mobil menü işlevselliği için JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Menü butonuna tıklama işlevi
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // Overlay ekleme veya kaldırma
        if (menuOverlay) {
            menuOverlay.classList.toggle('active');
        } else {
            // Overlay yoksa oluştur
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay active';
            document.body.appendChild(overlay);
            
            // Overlay'a tıklama ile menüyü kapatma
            overlay.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    });
    
    // Ekran boyutu değiştiğinde kontrol
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Masaüstü boyutuna geçince menüyü ve overlay'ı kapat
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            
            const overlay = document.querySelector('.menu-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    });
});