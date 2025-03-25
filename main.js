
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
                const headerOffset = 120; // Header yüksekliğinize göre ayarlayın
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
                    } else {
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
            
            const sectionTop = section.offsetTop - 100;
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

// Sayfa yüklendiğinde URL'deki ankor varsa o bölüme git
if (window.location.hash) {
    const initialTargetElement = document.querySelector(window.location.hash);
    if (initialTargetElement) {
        setTimeout(() => {
            window.scrollTo({
                top: initialTargetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 100);
    }
}
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