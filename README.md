# Nuxt Massive Site

**GitHub Template** — Base Nuxt 4 + TailwindCSS + i18n + Blog (Nuxt Content v2) + SEO verrouillé.

> ✅ Portabilité maximale : zéro dépendance native, fonctionne sur toute CI/CD sans toolchain C++.

---

## Installation / Run

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build production
pnpm build

# Preview du build
pnpm preview

# Formater le code (Prettier)
pnpm format
```

---

## Scripts

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Serveur de développement                   |
| `pnpm build`        | Build production                           |
| `pnpm preview`      | Preview du build                           |
| `pnpm format`       | Formater le code (Prettier)                |
| `pnpm format:check` | Vérifier le formatage                      |
| `pnpm typecheck`    | Vérification TypeScript (`nuxi typecheck`) |
| `pnpm content:lint` | Valider le frontmatter des articles blog   |

---

## CI (GitHub Actions)

Le workflow `.github/workflows/ci.yml` vérifie automatiquement :

1. ✅ **Format** — `pnpm format:check`
2. ✅ **Types** — `pnpm typecheck`
3. ✅ **Content** — `pnpm content:lint` (frontmatter valide)
4. ✅ **Build** — `pnpm build`

Déclenché sur `push` et `pull_request` vers `main`/`master`.

---

## SEO Guard (DEV)

En développement, un plugin affiche des warnings dans la console :

### Warning: siteUrl placeholder

```
[SEO Guard] ⚠️ NUXT_PUBLIC_SITE_URL is still "https://example.com".
Set it to your real domain for correct canonical URLs and sitemap.
```

**Solution :** Définir `NUXT_PUBLIC_SITE_URL` dans `.env` ou en variable d'environnement.

### Warning: page sans setPageSeo()

```
[SEO Guard] ⚠️ Page "/ma-page" did not call setPageSeo().
All pages should use useSiteSeo().setPageSeo() for proper SEO.
```

**Solution :** Ajouter `useSiteSeo().setPageSeo({...})` dans le `<script setup>` de la page.

---

## Variables d'environnement

| Variable                     | Description                                  | Valeur par défaut             |
| ---------------------------- | -------------------------------------------- | ----------------------------- |
| `NUXT_PUBLIC_SITE_URL`       | URL absolue du site (canonical, sitemap)     | `https://example.com`         |
| `NUXT_PUBLIC_DEFAULT_LOCALE` | Code locale par défaut (sans prefix URL)     | `fr`                          |
| `NUXT_PUBLIC_LOCALES`        | Liste des locales (CSV)                      | `fr,en`                       |
| `NUXT_PUBLIC_LOCALE_META`    | Mapping code → language tag (JSON)           | `{"fr":"fr-FR","en":"en-US"}` |
| `NODE_ENV`                   | Environment (`production` pour robots Allow) | —                             |

### Exemple `.env`

```bash
NUXT_PUBLIC_SITE_URL=https://monsite.com
NUXT_PUBLIC_DEFAULT_LOCALE=fr
NUXT_PUBLIC_LOCALES=fr,en,de
NUXT_PUBLIC_LOCALE_META={"fr":"fr-FR","en":"en-US","de":"de-DE"}
```

---

## Structure du projet

| Dossier                    | Rôle                                 |
| -------------------------- | ------------------------------------ |
| `app/pages/`               | Routes (auto-générées)               |
| `app/layouts/`             | Layouts (wrapper de pages)           |
| `app/components/ui/`       | Composants primitifs réutilisables   |
| `app/components/sections/` | Sections de page (Hero, Features...) |
| `app/composables/`         | Logique réutilisable (`useXxx`)      |
| `app/assets/`              | CSS, images, fonts                   |
| `content/{locale}/blog/`   | Articles de blog par langue          |
| `i18n/locales/`            | Fichiers de traduction JSON          |
| `server/`                  | API et routes serveur (sitemap)      |
| `server/utils/`            | Utilitaires partagés (sitemap)       |
| `public/`                  | Fichiers statiques (favicon)         |

---

## Ajouter une langue

Checklist :

1. **Ajouter la locale** dans `.env` ou `nuxt.config.ts` :

   ```bash
   NUXT_PUBLIC_LOCALES=fr,en,de
   NUXT_PUBLIC_LOCALE_META={"fr":"fr-FR","en":"en-US","de":"de-DE"}
   ```

2. **Créer le fichier de traduction** `i18n/locales/{code}.json` :

   ```json
   {
     "welcome": "Willkommen"
   }
   ```

3. **Créer les contenus** dans `content/{code}/blog/`

4. ✅ Le sitemap et hreflang sont automatiquement mis à jour

---

## Ajouter un article de blog

### Structure du contenu

```
content/
├── fr/
│   └── blog/
│       ├── hello-world.md
│       └── guides/
│           └── nuxt/
│               └── intro.md
└── en/
    └── blog/
        ├── hello-world.md
        └── guides/
            └── nuxt/
                └── intro.md
```

### Frontmatter requis

```yaml
---
title: Titre de l'article
description: Description courte (meta description)
date: 2025-12-25
updated: 2025-12-25
tags: [nuxt, seo]
category: Blog
cover: /images/blog/cover.jpg
draft: false
---
Contenu de l'article en Markdown...
```

| Champ         | Obligatoire | Description                      |
| ------------- | ----------- | -------------------------------- |
| `title`       | ✅          | Titre de l'article               |
| `description` | ✅          | Meta description SEO             |
| `date`        | ✅          | Date de publication (YYYY-MM-DD) |
| `updated`     | ⚪          | Date de mise à jour              |
| `tags`        | ⚪          | Tags pour le filtrage            |
| `category`    | ⚪          | Catégorie                        |
| `cover`       | ⚪          | Image de couverture              |
| `draft`       | ⚪          | `true` = non indexé, non listé   |

---

## SEO Rules

### Règle #1 : Composable unique

**Toute page DOIT utiliser `useSiteSeo()` pour le SEO.**

```vue
<script setup lang="ts">
const { setPageSeo } = useSiteSeo()

setPageSeo({
  title: 'Ma Page',
  description: 'Description de la page',
  type: 'website', // ou 'article' pour le blog
  image: '/og-image.jpg', // optionnel
  noindex: false // optionnel
})
</script>
```

### Règle #2 : Interdit

- ❌ **Ne jamais** appeler `useSeoMeta()` directement dans les pages
- ✅ **Toujours** passer par `useSiteSeo().setPageSeo()`

### Fonctionnalités automatiques

- ✅ Canonical absolu normalisé (pas de trailing slash, pas de query/hash)
- ✅ Alternates hreflang pour TOUTES les locales configurées + x-default
- ✅ Open Graph + Twitter Cards
- ✅ JSON-LD Article (auto pour `type: 'article'`)
- ✅ `noindex, nofollow` automatique en non-production
- ✅ Warning DEV si i18n.locales ≠ runtimeConfig.public.locales

### Helpers disponibles

```ts
import { normalizePath, toAbsoluteUrl, switchLocalePath } from '~/composables/useSiteSeo'

normalizePath('/blog/') // → '/blog'
normalizePath('/') // → '/'

toAbsoluteUrl('https://example.com', '/blog') // → 'https://example.com/blog'

switchLocalePath('/blog/hello', 'fr', 'en', 'fr', ['fr', 'en']) // → '/en/blog/hello'
switchLocalePath('/en/blog/hello', 'en', 'fr', 'fr', ['fr', 'en']) // → '/blog/hello'
```

---

## Draft Policy

Les articles avec `draft: true` :

- ❌ **noindex, nofollow** (jamais indexés par Google)
- ❌ **Exclus du sitemap** (jamais dans `/sitemap.xml`)
- ❌ **Non listés en production** (masqués de la liste blog)
- ✅ Visibles en développement avec badge "DRAFT"

---

## Sitemap & Robots

### Sitemap (`/sitemap.xml`)

- Généré dynamiquement via `server/routes/sitemap.xml.ts`
- Utilise `server/utils/sitemap.ts` (logique partagée, zéro duplication)
- Inclut pages statiques + articles blog (toutes locales)
- Exclut automatiquement `draft: true`
- **Alternates hreflang** inclus (`<xhtml:link>`)
- **Cache TTL : 10 minutes** (évite recalcul à chaque hit)
- Cache invalidé si config (`siteUrl`, `locales`) change

### Robots (`/robots.txt`)

- Généré par `@nuxtjs/robots` (pas de fichier statique)
- `NODE_ENV !== 'production'` → `Disallow: /`
- `NODE_ENV === 'production'` → `Allow: /` + `Sitemap: {siteUrl}/sitemap.xml`

---

## Configuration SEO globale

### `app/app.config.ts`

```ts
export default defineAppConfig({
  site: {
    name: 'Nuxt Massive Site',
    url: 'https://example.com', // Fallback si NUXT_PUBLIC_SITE_URL absent
    defaultTitle: 'Nuxt Massive Site',
    defaultDescription: 'Description par défaut',
    defaultOgImage: '/og-default.jpg',
    twitterHandle: '@handle'
  }
})
```

### `nuxt.config.ts` (runtimeConfig)

```ts
runtimeConfig: {
  public: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'fr',
    locales: ['fr', 'en'],  // Parsed from NUXT_PUBLIC_LOCALES
    localeMeta: { fr: 'fr-FR', en: 'en-US' }  // Parsed from NUXT_PUBLIC_LOCALE_META
  }
}
```

---

## Déploiement

### Portabilité CI/CD

✅ **Zéro dépendance native** — `pnpm install` puis `pnpm build` fonctionne sur toute machine :

- Pas de SQLite natif (Content v2)
- Pas de `better-sqlite3`
- Pas de compilation C++ requise

### Plateformes testées

- Vercel
- Netlify
- Cloudflare Pages
- Docker (Node 20+)
- GitHub Actions

### Variables d'environnement requises

```bash
# Production
NUXT_PUBLIC_SITE_URL=https://votredomaine.com
NODE_ENV=production
```

---

## Conventions

- **Composants** : PascalCase (`SectionTitle.vue`)
- **Composables** : `useXxx` (`useSiteSeo.ts`)
- **1 composant = 1 fichier**
- **SEO** : Uniquement via `useSiteSeo().setPageSeo()`

---

## License

MIT
