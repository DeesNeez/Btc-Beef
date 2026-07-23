/**
 * BTC Beef site interactions.
 * Original template foundation: BootstrapMade Yummy v1.3.0.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('#header');
  const navLinks = document.querySelectorAll('#navbar a');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Header and active navigation state
   */
  const updateHeader = () => {
    if (header) {
      header.classList.toggle('sticked', window.scrollY > 60);
    }
  };

  const updateActiveNav = () => {
    const position = window.scrollY + 180;

    navLinks.forEach((link) => {
      if (!link.hash) return;

      const section = document.querySelector(link.hash);
      if (!section) return;

      const isActive = position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight;
      link.classList.toggle('active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateOnScroll = () => {
    updateHeader();
    updateActiveNav();
  };

  updateOnScroll();
  window.addEventListener('scroll', updateOnScroll, { passive: true });

  /**
   * Accessible mobile navigation
   */
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');

  const setMobileNav = (isOpen) => {
    if (!mobileNavToggle) return;

    body.classList.toggle('mobile-nav-active', isOpen);
    mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
    mobileNavToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    const icon = mobileNavToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-list', !isOpen);
      icon.classList.toggle('bi-x', isOpen);
    }
  };

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      setMobileNav(!body.classList.contains('mobile-nav-active'));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileNav(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('mobile-nav-active')) {
      setMobileNav(false);
      mobileNavToggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) setMobileNav(false);
  });

  /**
   * Back-to-top control
   */
  const scrollTop = document.querySelector('.scroll-top');

  if (scrollTop) {
    const updateScrollTop = () => {
      scrollTop.classList.toggle('active', window.scrollY > 240);
    };

    updateScrollTop();
    window.addEventListener('scroll', updateScrollTop, { passive: true });
    scrollTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /**
   * Image lightboxes and farm gallery
   */
  const gallery = document.querySelector('.gallery-slider');
  if (gallery && typeof Swiper === 'function') {
    new Swiper(gallery, {
      speed: prefersReducedMotion ? 0 : 450,
      loop: true,
      centeredSlides: true,
      autoplay: prefersReducedMotion ? false : {
        delay: 5000,
        disableOnInteraction: true
      },
      keyboard: {
        enabled: true
      },
      a11y: {
        enabled: true
      },
      slidesPerView: 1,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        640: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        992: {
          slidesPerView: 5,
          spaceBetween: 20
        }
      }
    });
  }

  if (typeof GLightbox === 'function') {
    const farmLightbox = GLightbox({
      selector: '.gallery-slider .swiper-slide:not(.swiper-slide-duplicate) .glightbox',
      loop: true,
      slideEffect: 'fade',
      touchNavigation: true
    });

    GLightbox({
      selector: '.menu .glightbox',
      loop: true,
      slideEffect: 'fade',
      touchNavigation: true
    });

    if (gallery) {
      gallery.addEventListener('click', (event) => {
        const duplicateLink = event.target.closest?.('.swiper-slide-duplicate .glightbox');
        if (!duplicateLink) return;

        const duplicateSlide = duplicateLink.closest('.swiper-slide');
        const originalIndex = Number.parseInt(duplicateSlide?.dataset.swiperSlideIndex ?? '', 10);
        if (!Number.isInteger(originalIndex)) return;

        event.preventDefault();
        event.stopPropagation();
        farmLightbox.openAt(originalIndex);
      });
    }
  }

  /**
   * Entrance animations (content remains usable if the library is unavailable)
   */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      disable: prefersReducedMotion
    });
  }

  /**
   * Keep the footer year current
   */
  const copyrightYear = document.querySelector('#copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  /**
   * Carry a selected product into the inquiry form
   */
  const orderInterest = document.querySelector('#order-interest');
  document.querySelectorAll('[data-order-interest]').forEach((link) => {
    link.addEventListener('click', () => {
      if (orderInterest) {
        orderInterest.value = link.dataset.orderInterest || '';
      }
    });
  });

  /**
   * Formspree inquiry form
   */
  const form = document.querySelector('.php-email-form');

  if (form) {
    const sentMessage = form.querySelector('.sent-message');
    const errorMessage = form.querySelector('.error-message');
    const loading = form.querySelector('.loading');
    const submitButton = form.querySelector('button[type="submit"]');

    const hideStatus = () => {
      if (loading) loading.style.display = 'none';
      if (sentMessage) sentMessage.style.display = 'none';
      if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
      }
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideStatus();

      if (loading) loading.style.display = 'block';
      if (submitButton) submitButton.disabled = true;
      form.setAttribute('aria-busy', 'true');

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        if (sentMessage) sentMessage.style.display = 'block';
        form.reset();
      } catch (error) {
        if (errorMessage) {
          errorMessage.style.display = 'block';
          errorMessage.textContent = error.name === 'AbortError'
            ? 'The request took too long. Please try again or email btcbeef@gmail.com.'
            : 'We could not send your inquiry. Please try again or email btcbeef@gmail.com.';
        }
      } finally {
        window.clearTimeout(timeout);
        if (loading) loading.style.display = 'none';
        if (submitButton) submitButton.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }
});
