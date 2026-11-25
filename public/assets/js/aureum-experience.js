(function () {
  'use strict';
  const video = document.querySelector('.ux-hero-video');
  const button = document.querySelector('.ux-hero-motion');
  if (!video || !button) return;

  const eligible = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  function syncButton() {
    const playing = !video.paused;
    video.toggleAttribute('data-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.textContent = playing ? button.dataset.pause : button.dataset.play;
  }
  function syncEligibility() {
    button.hidden = !eligible.matches;
    if (!eligible.matches) video.pause();
  }
  button.addEventListener('click', function () {
    if (!video.paused) {
      video.pause();
      return;
    }
    video.hidden = false;
    if (!video.getAttribute('src')) video.src = '/assets/aureum-abertura.mp4';
    video.play().catch(syncButton);
  });
  video.addEventListener('playing', syncButton);
  video.addEventListener('pause', syncButton);
  eligible.addEventListener('change', syncEligibility);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); });
    observer.observe(button.closest('.ux-hero'));
  }
  syncEligibility();
})();
