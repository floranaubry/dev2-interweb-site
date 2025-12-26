<script setup lang="ts"></script>

<template>
  <div>
    <Hero
      title="Bienvenue sur Nuxt Massive Site"
      subtitle="Une base solide, minimaliste et scalable pour vos projets Nuxt 4."
      cta-label="Découvrir"
      cta-href="#features"
    />

    <section id="features" class="bg-white py-16 sm:py-24">
      <Container>
        <SectionTitle
          title="Fonctionnalités"
          subtitle="Une architecture pensée pour la performance et la maintenabilité."
        />
        <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h3 class="text-lg font-semibold text-slate-900">Nuxt 4.2.2</h3>
            <p class="mt-2 text-slate-600">
              La dernière version de Nuxt avec Vue 3 et toutes les optimisations modernes.
            </p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h3 class="text-lg font-semibold text-slate-900">TailwindCSS</h3>
            <p class="mt-2 text-slate-600">
              Styling utilitaire pour un développement rapide et consistant.
            </p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h3 class="text-lg font-semibold text-slate-900">TypeScript</h3>
            <p class="mt-2 text-slate-600">
              Typage strict pour une meilleure expérience développeur.
            </p>
          </div>
        </div>
      </Container>
    </section>

    <section class="bg-slate-100 py-16 sm:py-24">
      <Container>
        <SectionTitle
          title="Prêt à démarrer"
          subtitle="Une structure claire et extensible pour tous vos besoins."
        />
        <div class="mt-8 text-center">
          <p class="mx-auto max-w-2xl text-slate-600">
            Cette base de projet est conçue pour être légère tout en offrant une structure scalable.
            Ajoutez vos composants, pages et fonctionnalités au fur et à mesure de vos besoins.
          </p>
        </div>
      </Container>
    </section>
  </div>
</template>
