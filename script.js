// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const lazyVideoSources = document.querySelectorAll('video source[data-src]');

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Navigation Toggle =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile nav when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== Deferred Video Loading =====
function loadDeferredVideos() {
    lazyVideoSources.forEach(source => {
        if (source.src) {
            return;
        }

        source.src = source.dataset.src;
        source.removeAttribute('data-src');
        source.parentElement.load();
    });
}

const aboutSection = document.querySelector('.about');

if (aboutSection && lazyVideoSources.length > 0) {
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadDeferredVideos();
                    observer.disconnect();
                }
            });
        }, { rootMargin: '200px 0px' });

        videoObserver.observe(aboutSection);
    } else {
        loadDeferredVideos();
    }
}

// ===== Gallery Filter + Pagination =====
const GALLERY_INITIAL_COUNT = 8;
const GALLERY_LOAD_INCREMENT = 8;
const galleryItemsArr = Array.from(galleryItems);
const galleryLoadMoreBtn = document.getElementById('galleryLoadMore');
let currentGalleryFilter = 'all';
let galleryVisibleCount = GALLERY_INITIAL_COUNT;

function renderGallery() {
    const matching = galleryItemsArr.filter(item =>
        currentGalleryFilter === 'all' || item.dataset.category === currentGalleryFilter
    );

    galleryItemsArr.forEach(item => item.classList.add('hidden'));

    matching.forEach((item, index) => {
        if (index < galleryVisibleCount) {
            item.classList.remove('hidden');
            item.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });

    if (galleryLoadMoreBtn) {
        galleryLoadMoreBtn.style.display = matching.length > galleryVisibleCount ? 'inline-block' : 'none';
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentGalleryFilter = btn.dataset.filter;
        galleryVisibleCount = GALLERY_INITIAL_COUNT;
        renderGallery();
    });
});

if (galleryLoadMoreBtn) {
    galleryLoadMoreBtn.addEventListener('click', () => {
        galleryVisibleCount += GALLERY_LOAD_INCREMENT;
        renderGallery();
    });
}

renderGallery();

// ===== Gallery Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let lightboxIndex = 0;

function visibleGalleryItems() {
    return galleryItemsArr.filter(item => !item.classList.contains('hidden'));
}

function openLightbox(index) {
    const items = visibleGalleryItems();
    if (!items.length) return;

    lightboxIndex = (index + items.length) % items.length;
    const item = items[lightboxIndex];
    const img = item.querySelector('img');
    const title = item.querySelector('h4');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title ? title.textContent : img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

galleryItemsArr.forEach(item => {
    item.addEventListener('click', () => {
        const items = visibleGalleryItems();
        openLightbox(items.indexOf(item));
    });
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', () => openLightbox(lightboxIndex - 1));
if (lightboxNext) lightboxNext.addEventListener('click', () => openLightbox(lightboxIndex + 1));

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
});

// ===== Back to Top =====
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.scrollY > 500);
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Testimonial Slider =====
const testimonialTrack = document.querySelector('.testimonial-track');
const testimonials = document.querySelectorAll('.testimonial');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');
const dotsContainer = document.querySelector('.testimonial-dots');

if (testimonialTrack && testimonials.length > 0 && prevBtn && nextBtn && dotsContainer) {
    let currentSlide = 0;
    const totalSlides = testimonials.length;

    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.testimonial-dots .dot');

    function updateSlider() {
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlider();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Auto-slide every 5 seconds
    let autoSlide = setInterval(nextSlide, 5000);

    // Pause auto-slide on hover
    testimonialTrack.addEventListener('mouseenter', () => clearInterval(autoSlide));
    testimonialTrack.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });
}

// ===== Stats Counter Animation =====
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;
    
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return; // Exit if stats section doesn't exist
    
    const statsSectionTop = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (statsSectionTop < windowHeight - 100) {
        statsAnimated = true;
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateCounter();
        });
    }
}

window.addEventListener('scroll', animateStats);

// ===== Smooth Scroll for All Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards and process steps
document.querySelectorAll('.service-card, .process-step, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ===== Parallax Effect on Hero =====
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-content');
    const scrolled = window.scrollY;
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// ===== EmailJS Contact Form =====
emailjs.init('FkQY2Ii4rpYWSwujD');

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', () => {
    const contactFormEl = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (contactFormEl) {
        contactFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';

            const formData = {
                from_name: document.getElementById('contactName').value,
                from_email: document.getElementById('contactEmail').value,
                message: document.getElementById('contactMessage').value,
                to_email: 'paul@tohukorero.com'
            };

            console.log('Sending email with data:', formData);

            emailjs.send('service_rtncsgq', 'template_zzoq2ji', formData)
                .then(function(response) {
                    console.log('Email sent successfully!', response);
                    formStatus.textContent = 'Message sent successfully!';
                    formStatus.className = 'form-status success';
                    formStatus.style.display = 'block';
                    contactFormEl.reset();
                    setTimeout(function() {
                        formStatus.style.display = 'none';
                    }, 5000);
                })
                .catch(function(error) {
                    console.error('EmailJS error:', error);
                    formStatus.textContent = 'Failed to send message. Please try again.';
                    formStatus.className = 'form-status error';
                    formStatus.style.display = 'block';
                    setTimeout(function() {
                        formStatus.style.display = 'none';
                    }, 5000);
                })
                .finally(function() {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                });
        });
    } else {
        console.warn('Contact form element not found');
    }

    // Trigger initial animations
    updateActiveNav();
    
    // Check if stats are visible on load
    animateStats();
    
    console.log('Z-Axis Customs website loaded successfully!');
});
