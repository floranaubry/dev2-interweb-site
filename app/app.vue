<template>
  <!-- Apple-style subtle loading indicator -->
  <NuxtLoadingIndicator
    :height="2"
    :duration="2000"
    :throttle="200"
    color="false"
  />
  
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* ═══════════════════════════════════════════════════════════════════════════
   APPLE-STYLE LOADING INDICATOR
   Subtle, elegant, Jony Ive-inspired progress bar
   ═══════════════════════════════════════════════════════════════════════════ */

/* Override Nuxt loading indicator with custom styling */
.nuxt-loading-indicator {
  /* Gradient bar - subtle blue to purple */
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 113, 227, 0.8) 10%,
    rgba(88, 86, 214, 0.9) 50%,
    rgba(175, 82, 222, 0.8) 90%,
    transparent 100%
  ) !important;
  
  /* Glass effect glow */
  box-shadow: 
    0 0 10px rgba(0, 113, 227, 0.3),
    0 0 20px rgba(88, 86, 214, 0.2),
    0 0 30px rgba(175, 82, 222, 0.1);
  
  /* Smooth corners */
  border-radius: 0 2px 2px 0;
  
  /* Very subtle height */
  height: 2px !important;
  
  /* Ensure it's on top */
  z-index: 999999 !important;
  
  /* Smooth opacity transitions */
  opacity: 1;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When loading is complete, fade out gracefully */
.nuxt-loading-indicator[style*="width: 100%"] {
  opacity: 0;
  transition: 
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    width 0s linear 0.7s;
}

/* Dark mode variant - brighter, more visible */
.dark-mode .nuxt-loading-indicator {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(10, 132, 255, 0.9) 10%,
    rgba(94, 92, 230, 1) 50%,
    rgba(191, 90, 242, 0.9) 90%,
    transparent 100%
  ) !important;
  
  box-shadow: 
    0 0 15px rgba(10, 132, 255, 0.5),
    0 0 30px rgba(94, 92, 230, 0.3),
    0 0 45px rgba(191, 90, 242, 0.2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE TRANSITIONS
   Smooth, subtle transitions between pages
   ═══════════════════════════════════════════════════════════════════════════ */

/* Page enter/leave transitions */
.page-enter-active,
.page-leave-active {
  transition: 
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Layout transitions (even smoother) */
.layout-enter-active,
.layout-leave-active {
  transition: 
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-enter-from {
  opacity: 0;
  filter: blur(4px);
}

.layout-leave-to {
  opacity: 0;
  filter: blur(2px);
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL SMOOTH SCROLLING & TRANSITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

html {
  scroll-behavior: smooth;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  
  .page-enter-active,
  .page-leave-active,
  .layout-enter-active,
  .layout-leave-active {
    transition: opacity 0.15s ease;
  }
  
  .page-enter-from,
  .page-leave-to,
  .layout-enter-from,
  .layout-leave-to {
    transform: none;
    filter: none;
  }
  
  .nuxt-loading-indicator {
    transition: none !important;
  }
}
</style>
