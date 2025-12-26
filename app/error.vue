<script setup lang="ts">
/**
 * Error Page — Elegant 404/500 with Interweb Design System
 * 
 * Apple-inspired minimal design with subtle animations
 */
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import HeaderInterweb from '~/shells/header.interweb/index.vue'
import FooterInterweb from '~/shells/footer.interweb/index.vue'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const { t } = useI18n()

// Header config
const headerConfig = {
  logoText: 'interweb',
  logoHref: '/',
  links: [
    { label: 'Accueil', href: '/' },
    { label: 'Blog', href: '/blog' }
  ],
  ctaLabel: 'Contact',
  ctaHref: '/#contact',
  enableThemeToggle: true
}

// Footer config
const footerConfig = {
  brand: 'interweb',
  tagline: 'Création de sites internet professionnels.',
  copyright: '© 2025 Interweb. Tous droits réservés.',
  links: [
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'Mentions légales', href: '/mentions-legales' }
  ]
}

// Error content based on status code
const errorContent = computed(() => {
  const code = props.error.statusCode
  
  if (code === 404) {
    return {
      code: '404',
      title: 'Page introuvable',
      description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      icon: 'search'
    }
  }
  
  return {
    code: String(code),
    title: 'Une erreur est survenue',
    description: props.error.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.',
    icon: 'alert'
  }
})

// Clear error and navigate home
const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <ThemeScope pack="interweb" :packs-used="['interweb']">
    <!-- Header -->
    <HeaderInterweb v-bind="headerConfig" />

    <!-- Main Content -->
    <main class="error-page">
      <div class="container">
        <div class="error-content">
          <!-- Floating gradient orbs -->
          <div class="error-orbs">
            <div class="error-orb error-orb--1"></div>
            <div class="error-orb error-orb--2"></div>
            <div class="error-orb error-orb--3"></div>
          </div>

          <!-- Error card -->
          <div class="error-card">
            <div class="error-card__gradient"></div>
            <div class="error-card__content">
              <!-- Error code with glitch effect -->
              <div class="error-code">
                <span class="error-code__number">{{ errorContent.code }}</span>
              </div>

              <!-- Icon -->
              <div class="error-icon">
                <!-- Search icon for 404 -->
                <svg v-if="errorContent.icon === 'search'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                  <path d="M8 11h6" opacity="0.5"/>
                </svg>
                <!-- Alert icon for other errors -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>

              <!-- Title & Description -->
              <h1 class="error-title">{{ errorContent.title }}</h1>
              <p class="error-description">{{ errorContent.description }}</p>

              <!-- Actions -->
              <div class="error-actions">
                <button class="btn btn--primary" @click="handleClearError">
                  <span>Retour à l'accueil</span>
                  <span class="btn__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterInterweb v-bind="footerConfig" />
  </ThemeScope>
</template>

<style scoped>
.error-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  position: relative;
  overflow: hidden;
}

.error-content {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

/* Floating orbs */
.error-orbs {
  position: absolute;
  inset: -100px;
  pointer-events: none;
  z-index: 0;
}

.error-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 8s ease-in-out infinite;
}

.error-orb--1 {
  width: 200px;
  height: 200px;
  background: var(--color-primary);
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.error-orb--2 {
  width: 150px;
  height: 150px;
  background: #af52de;
  bottom: -30px;
  right: -30px;
  animation-delay: -2s;
}

.error-orb--3 {
  width: 100px;
  height: 100px;
  background: var(--color-success);
  top: 50%;
  right: -20px;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(10px, -10px) scale(1.05);
  }
  66% {
    transform: translate(-5px, 5px) scale(0.95);
  }
}

/* Error card */
.error-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-3xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  z-index: 1;
}

.error-card__gradient {
  position: absolute;
  inset: 0;
  background: var(--gradient-purple);
  opacity: 0.3;
  pointer-events: none;
}

.error-card__content {
  position: relative;
  padding: var(--space-12) var(--space-8);
  text-align: center;
  z-index: 1;
}

/* Error code */
.error-code {
  margin-bottom: var(--space-6);
}

.error-code__number {
  font-size: clamp(4rem, 15vw, 8rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.05em;
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--color-text-primary) 0%,
    var(--color-text-tertiary) 50%,
    var(--color-text-primary) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Error icon */
.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: var(--space-6);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-text-tertiary);
}

.error-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

/* Title & description */
.error-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.error-description {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-tertiary);
  max-width: 320px;
  margin: 0 auto var(--space-8);
}

/* Actions */
.error-actions {
  display: flex;
  justify-content: center;
}

/* Dark mode adjustments */
:global(.dark-mode) .error-orb {
  opacity: 0.3;
}

:global(.dark-mode) .error-orb--1 {
  background: #0a84ff;
}

:global(.dark-mode) .error-orb--2 {
  background: #bf5af2;
}

:global(.dark-mode) .error-orb--3 {
  background: #30d158;
}
</style>

