/**
 * AFRAH Construction — Professional GSAP Animations & Interactions
 * 
 * Powered by GreenSock (GSAP) & ScrollTrigger:
 * 1. Hardware-accelerated smooth section element entrance reveals
 * 2. Precision numerical stat counter tweens
 * 3. Interactive mobile navigation overlay
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// 1. GSAP SECTION ENTRANCE REVEALS
// ============================================
function initGsapSectionReveals() {
  // Batch animate section headers, cards, and components as they enter viewport
  const sections = document.querySelectorAll('section:not(#hero)');

  sections.forEach((section) => {
    const targets = section.querySelectorAll(
      '.blueprint-badge, h2, h3, .font-display-lg, .font-display-xl, .portfolio-card, .model-spec, .capability-item, .inquiry-card'
    );

    if (targets.length) {
      gsap.from(targets, {
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true,
        },
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }
  });
}

// ============================================
// 2. GSAP STAT COUNTER TWEENS
// ============================================
function initGsapCounters() {
  const counters = document.querySelectorAll('[data-count-to]');

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-count-to') || '0', 10);
    const suffix = counter.getAttribute('data-count-suffix') || '';
    if (isNaN(target)) return;

    const countObj = { val: 0 };

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(countObj, {
          val: target,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate: () => {
            if (target >= 1000000) {
              const millions = (countObj.val / 1000000).toFixed(1);
              counter.textContent = `${millions}M+`;
            } else if (suffix.includes('%')) {
              counter.textContent = `${Math.round(countObj.val)}%`;
            } else {
              counter.textContent = `${Math.round(countObj.val)}${suffix}`;
            }
          },
        });
      },
    });
  });
}

// ============================================
// 3. MOBILE NAVIGATION OVERLAY
// ============================================
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuBtn || !closeBtn || !overlay) return;

  menuBtn.addEventListener('click', () => {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  overlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

// Initialize on DOM ready
function init() {
  initGsapSectionReveals();
  initGsapCounters();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
