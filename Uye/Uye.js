document.addEventListener('DOMContentLoaded', function() {
    // Basit Dinamik 3D Efekt 
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

    // Navigasyon bağlantılarını seç
    const navLinks = document.querySelectorAll('.main-nav a');

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

    //Ana Sayfa Haber Kısmı Kayma
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevArrow = document.querySelector('.slider-arrow.prev');
    const nextArrow = document.querySelector('.slider-arrow.next');
    const progressBar = document.querySelector('.progress-bar');
    const overlay = document.querySelector('.transition-overlay');
    
    const slideCount = slides.length;
    let currentIndex = 0;
    let isAnimating = false;
    let slideInterval;
    let progressInterval;
    const slideDuration = 10000; // 10 saniye
    
    // İlerleme çubuğu için değişkenler
    let progressValue = 0;
    let lastUpdated = Date.now();
    let isPaused = false;
    
    // İlk slide aktif olarak ayarla
    slides[0].classList.add('current');
    activateSlideContent(slides[0]);
    
    // Slide içeriğini aktifleştir ve animasyonla göster
    function activateSlideContent(slide) {
        // Slide içindeki başlık ve metin elementleri
        const heading = slide.querySelector('h2, h3, .slide-title');
        const text = slide.querySelector('p, .slide-text');
        const button = slide.querySelector('button, .slide-button, .cta-button');
        
        // Elementleri sırayla animasyonla göster
        if (heading) {
            heading.style.opacity = '0';
            heading.style.transform = 'translateY(20px)';
            setTimeout(() => {
                heading.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                heading.style.opacity = '1';
                heading.style.transform = 'translateY(0)';
            }, 300);
        }
        
        if (text) {
            text.style.opacity = '0';
            text.style.transform = 'translateY(20px)';
            setTimeout(() => {
                text.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                text.style.opacity = '1';
                text.style.transform = 'translateY(0)';
            }, 500);
        }
        
        if (button) {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            setTimeout(() => {
                button.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 700);
        }
    }
    
    // Slide içeriğini deaktifleştir ve animasyonla gizle
    function deactivateSlideContent(slide) {
        const elements = slide.querySelectorAll('h2, h3, p, button, .slide-title, .slide-text, .slide-button, .cta-button');
        
        elements.forEach(element => {
            element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
        });
    }
    
    // İlerleme çubuğunu başlat
    function startProgressBar() {
        // Önceki ilerleme durumunu temizle
        clearInterval(progressInterval);
        
        lastUpdated = Date.now();
        
        progressInterval = setInterval(() => {
            if (!isPaused) {
                const now = Date.now();
                const elapsed = now - lastUpdated;
                lastUpdated = now;
                
                // İlerlemeyi güncelle (100'e bölünmüş değer olarak)
                progressValue += (elapsed / slideDuration) * 100;
                progressBar.style.width = `${progressValue}%`;
                
                if (progressValue >= 100) {
                    progressValue = 0;
                    clearInterval(progressInterval);
                    nextSlide();
                }
            }
        }, 50);
    }
    
    // İlerleme çubuğunu sıfırla
    function resetProgressBar() {
        progressValue = 0;
        progressBar.style.width = '0%';
    }
    
    // Geliştirilmiş geçiş efekti animasyonu
    function animateTransition() {
        return new Promise(resolve => {
            // Overlay'i iki katmanlı yap: dış katman ve iç katman
            if (!document.querySelector('.overlay-inner')) {
                const innerOverlay = document.createElement('div');
                innerOverlay.className = 'overlay-inner';
                overlay.appendChild(innerOverlay);
            }
            
            const innerOverlay = document.querySelector('.overlay-inner');
            
            // Ana overlay animasyonu
            overlay.style.transition = 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)';
            overlay.style.transform = 'translateX(0)';
            
            // İç overlay animasyonu (ana overlayin arkasından gelir)
            setTimeout(() => {
                innerOverlay.style.transition = 'transform 1s cubic-bezier(0.77, 0, 0.175, 1)';
                innerOverlay.style.transform = 'translateX(0)';
            }, 200);
            
            setTimeout(() => {
                // Ana overlay sağa çıkar
                overlay.style.transform = 'translateX(100%)';
                
                // İç overlay da takip eder
                setTimeout(() => {
                    innerOverlay.style.transform = 'translateX(100%)';
                    
                    setTimeout(() => {
                        // Resetle
                        overlay.style.transition = 'none';
                        overlay.style.transform = 'translateX(-100%)';
                        innerOverlay.style.transition = 'none';
                        innerOverlay.style.transform = 'translateX(-100%)';
                        resolve();
                    }, 1200);
                }, 100);
            }, 700);
        });
    }
    
    // Slide değiştirme fonksiyonu
    async function goToSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Önceki aktif slide
        const currentSlide = slides[currentIndex];
        
        // İçeriği animasyonla gizle
        deactivateSlideContent(currentSlide);
        
        // Yeni slide
        currentIndex = index;
        const nextSlide = slides[currentIndex];
        
        // Dot'ları güncelle
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
        
        // Yeni slide hazırlığı
        nextSlide.style.opacity = '0';
        
        // Kısa bir bekleme sonrası geçiş efekti
        setTimeout(async () => {
            // Geçiş efekti animasyonu başlat
            await animateTransition();
            
            // Önceki slide'ı güncelle
            currentSlide.classList.remove('current');
            currentSlide.classList.add('previous');
            
            // Yeni slide'ı aktifleştir
            nextSlide.classList.remove('previous');
            nextSlide.classList.add('current');
            
            // Yeni slide'ı fade in
            nextSlide.style.transition = 'opacity 0.5s ease';
            nextSlide.style.opacity = '1';
            
            // İçeriği animasyonla göster
            activateSlideContent(nextSlide);
            
            // İlerleme çubuğunu sıfırla ve başlat
            resetProgressBar();
            startProgressBar();
            
            setTimeout(() => {
                isAnimating = false;
            }, 1200);
        }, 300);
    }
    
    function nextSlide() {
        const nextIndex = (currentIndex + 1) % slideCount;
        goToSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        goToSlide(prevIndex);
    }
    
    // Başlangıçta ilerleme çubuğunu başlat
    startProgressBar();
    
    // Noktalara tıklama olayı
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            if (isAnimating) return;
            
            clearInterval(slideInterval);
            const index = parseInt(this.dataset.index);
            
            if (index !== currentIndex) {
                goToSlide(index);
            } else {
                // Aynı noktaya tıklandıysa, sadece ilerleme çubuğunu sıfırla
                resetProgressBar();
                startProgressBar();
            }
        });
    });
    
    // Ok tuşlarına tıklama olayı
    nextArrow.addEventListener('click', function() {
        if (isAnimating) return;
        nextSlide();
    });
    
    prevArrow.addEventListener('click', function() {
        if (isAnimating) return;
        prevSlide();
    });
    
    // Slider üzerine gelindiğinde ilerlemeyi durdur
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', function() {
        isPaused = true;
    });
    
    // Slider üzerinden ayrılınca ilerlemeyi kaldığı yerden devam ettir
    sliderContainer.addEventListener('mouseleave', function() {
        isPaused = false;
        lastUpdated = Date.now(); // Son güncelleme zamanını sıfırla
    });
});