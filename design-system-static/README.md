# Interweb Design System v2.1 — Optimized

Un design system minimaliste et premium inspiré par Apple. **Version 2.1** : optimisée avec classes primitives réutilisables, moins de duplication, fichier CSS 40% plus léger.

## Principes de Design

1. **Simplicité radicale** — Chaque élément a sa raison d'être
2. **Hiérarchie claire** — Le regard sait où aller
3. **Espace généreux** — Le vide est un élément de design
4. **Subtilité** — Les détails se révèlent à l'usage
5. **Cohérence** — Les patterns se répètent harmonieusement
6. **DRY (v2.1)** — Classes primitives composables, zéro duplication

---

## Quick Start

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <link rel="stylesheet" href="design-system.css" />
  </head>
  <body>
    <!-- Votre contenu -->
  </body>
</html>
```

---

## Design Tokens

### Couleurs

| Token                    | Light Mode         | Dark Mode               | Usage            |
| ------------------------ | ------------------ | ----------------------- | ---------------- |
| `--color-bg`             | `#f5f5f7`          | `#000000`               | Fond de page     |
| `--color-bg-elevated`    | `#ffffff`          | `#1c1c1e`               | Cartes, modales  |
| `--color-text-primary`   | `#1d1d1f`          | `#f5f5f7`               | Titres           |
| `--color-text-secondary` | `#424245`          | `#a1a1a6`               | Corps de texte   |
| `--color-text-tertiary`  | `#6e6e73`          | `#86868b`               | Texte léger      |
| `--color-primary`        | `#0071e3`          | `#0a84ff`               | Accent principal |
| `--color-success`        | `#34c759`          | `#30d158`               | Validation       |
| `--color-border`         | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.1)` | Bordures         |

### Typographie

```css
/* Échelle typographique (ratio 1.25) */
--font-size-xs: 0.6875rem; /* 11px - Labels */
--font-size-sm: 0.8125rem; /* 13px - Captions */
--font-size-base: 1rem; /* 16px - Body */
--font-size-lg: 1.125rem; /* 18px - Body large */
--font-size-xl: 1.25rem; /* 20px - Titles */
--font-size-2xl: 1.5rem; /* 24px - Headlines */
--font-size-3xl: 2rem; /* 32px */
--font-size-4xl: 2.5rem; /* 40px */
--font-size-5xl: 3rem; /* 48px */
--font-size-6xl: 3.75rem; /* 60px - Display */
```

### Espacements

```css
/* Basé sur une unité de 8px */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Border Radius

```css
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.625rem; /* 10px */
--radius-lg: 0.875rem; /* 14px */
--radius-xl: 1.25rem; /* 20px */
--radius-2xl: 1.75rem; /* 28px */
--radius-full: 9999px; /* Pilules, avatars */
```

### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06);
```

---

## Primitives (v2.1)

Classes réutilisables pour éviter la duplication. Utilisez-les dans n'importe quelle carte ou composant.

### Gradient Layer

```html
<div class="gradient-layer gradient-layer--blue"></div>
<div class="gradient-layer gradient-layer--green"></div>
<div class="gradient-layer gradient-layer--orange"></div>
<div class="gradient-layer gradient-layer--purple"></div>
```

### Glass Overlay

```html
<div class="glass-overlay"></div>
```

### Content Layer

```html
<div class="content-layer">
  <!-- Votre contenu sera au-dessus des gradients -->
</div>
```

### Shine Layer (hover effect)

```html
<div class="shine-layer"></div>
```

### Icon Container

```html
<!-- Tailles -->
<div class="icon-container icon-container--sm icon-container--surface">...</div>
<div class="icon-container icon-container--md icon-container--surface">...</div>
<div class="icon-container icon-container--lg icon-container--accent">...</div>

<!-- Variantes -->
<div class="icon-container icon-container--md icon-container--round">...</div>
```

### Exemple complet d'une carte avec primitives

```html
<div class="card">
  <div class="gradient-layer gradient-layer--blue"></div>
  <div class="glass-overlay"></div>
  <div class="shine-layer"></div>
  <div class="content-layer">
    <div class="icon-container icon-container--md icon-container--surface mb-4">
      <svg>...</svg>
    </div>
    <h3 class="text-title mb-2">Titre</h3>
    <p class="text-caption">Description</p>
  </div>
</div>
```

---

## Composants

### 1. Boutons

```html
<!-- Primaire (CTA) -->
<button class="btn btn--primary">
  <span>Label</span>
  <span class="btn__icon">
    <svg><!-- Arrow icon --></svg>
  </span>
</button>

<!-- Secondaire -->
<button class="btn btn--secondary">Label</button>

<!-- Ghost -->
<button class="btn btn--ghost">Label</button>

<!-- Tailles -->
<button class="btn btn--primary btn--sm">Small</button>
<button class="btn btn--primary btn--lg">Large</button>
```

### 2. Pills (Status)

```html
<div class="pill">
  <span class="pulse"></span>
  <span class="text-label">En ligne</span>
</div>
```

### 3. Badges

```html
<span class="badge">Default</span>
<span class="badge badge--primary">Primary</span>
<span class="badge badge--success">Success</span>
```

### 4. Cards

```html
<!-- Feature Card -->
<div class="card">
  <div class="card__gradient" style="background: var(--gradient-blue);"></div>
  <div class="card__content">
    <div class="icon-box mb-4">
      <svg><!-- Icon --></svg>
    </div>
    <h3 class="text-title mb-2">Titre</h3>
    <p class="text-caption">Description</p>
  </div>
</div>
```

### 5. Bento Grid

```html
<div class="bento bento--2x2">
  <div class="bento-card">
    <div class="bento-card__gradient" style="background: var(--gradient-blue);"></div>
    <div class="bento-card__content">
      <!-- Contenu -->
    </div>
    <div class="bento-card__visual hide-mobile">
      <!-- Visuel -->
    </div>
  </div>
  <!-- Autres cartes... -->
</div>
```

### 6. Testimonials

```html
<div class="testimonial">
  <div class="testimonial__quote">
    <svg><!-- Quote icon --></svg>
  </div>
  <p class="testimonial__text">"Citation..."</p>
  <div class="testimonial__footer">
    <div class="testimonial__author">
      <div class="testimonial__avatar"></div>
      <div>
        <div class="testimonial__name">Nom</div>
        <div class="testimonial__role">Rôle</div>
      </div>
    </div>
    <div class="testimonial__rating">
      <svg class="star"><!-- Star --></svg>
      <span>5.0</span>
    </div>
  </div>
</div>
```

### 7. Inputs

```html
<input type="text" class="input" placeholder="Placeholder" />
<input type="text" class="input input--lg" placeholder="Large input" />
```

### 8. Icon Box

```html
<div class="icon-box">
  <svg><!-- Icon 20x20 --></svg>
</div>
```

### 9. Tooltips

```html
<!-- Basic (top by default) -->
<div class="tooltip">
  <button class="btn btn--secondary">Hover me</button>
  <div class="tooltip__content">Tooltip text</div>
</div>

<!-- Positions -->
<div class="tooltip tooltip--bottom">...</div>
<div class="tooltip tooltip--left">...</div>
<div class="tooltip tooltip--right">...</div>

<!-- Dark variant -->
<div class="tooltip tooltip--dark">
  <button>Hover</button>
  <div class="tooltip__content">Dark tooltip</div>
</div>

<!-- Multiline -->
<div class="tooltip tooltip--multiline">
  <span class="badge">Info</span>
  <div class="tooltip__content">Ce tooltip peut contenir plusieurs lignes.</div>
</div>

<!-- On icon (with help cursor) -->
<div class="tooltip">
  <div class="icon-box" style="cursor: help;">
    <svg><!-- Help icon --></svg>
  </div>
  <div class="tooltip__content">Aide contextuelle</div>
</div>
```

**Variantes disponibles :**

- `tooltip--top` (défaut) - Apparaît au-dessus
- `tooltip--bottom` - Apparaît en-dessous
- `tooltip--left` - Apparaît à gauche
- `tooltip--right` - Apparaît à droite
- `tooltip--dark` - Style inversé (sombre en light mode, clair en dark mode)
- `tooltip--multiline` - Permet le retour à la ligne (max-width: 240px)

### 10. Glass Actor Cards

Cartes flottantes premium avec effet glassmorphism. Idéales pour les interfaces interactives riches.

#### Photo Card

```html
<div class="glass-actor glass-actor--photo" style="aspect-ratio: 4/5;">
  <div class="glass-actor__image-container">
    <img src="image.jpg" alt="Photo" class="glass-actor__image" loading="lazy" />
    <div class="glass-actor__overlay"></div>
    <div class="glass-actor__highlight"></div>
  </div>
  <button class="glass-actor__badge">
    <svg><!-- Camera icon --></svg>
    <span>Photo</span>
    <svg><!-- Chevron icon --></svg>
  </button>
</div>
```

#### Map Card

```html
<div class="glass-actor glass-actor--map" style="aspect-ratio: 1;">
  <div class="glass-actor__map-bg">
    <!-- SVG map background -->
  </div>
  <div class="glass-actor__pin">
    <svg><!-- MapPin icon --></svg>
  </div>
  <div class="glass-actor__compass">
    <svg><!-- Navigation icon --></svg>
  </div>
  <div class="glass-actor__location">
    <span class="glass-actor__location-dot"></span>
    <span>Paris, France</span>
  </div>
</div>
```

#### Contact Card

```html
<div class="glass-actor glass-actor--contact">
  <div class="glass-actor__header">
    <div class="glass-actor__icon">
      <svg><!-- MessageCircle icon --></svg>
    </div>
    <div>
      <h3 class="glass-actor__title">Contact</h3>
      <p class="glass-actor__subtitle">Écrivez-nous</p>
    </div>
  </div>
  <div class="flex flex-col gap-3">
    <div class="glass-input-wrapper">
      <svg><!-- Phone icon --></svg>
      <input type="tel" class="glass-input" placeholder="Votre téléphone" />
    </div>
    <div class="glass-input-wrapper">
      <svg class="icon-top"><!-- Message icon --></svg>
      <textarea class="glass-input glass-textarea" placeholder="Message..."></textarea>
    </div>
    <button class="glass-actor__submit">
      <svg><!-- Send icon --></svg>
      <span>Envoyer</span>
    </button>
  </div>
</div>
```

#### Toggle Card

```html
<div class="glass-actor glass-actor--toggle">
  <div class="glass-actor__toggle-label">
    <div class="glass-actor__toggle-icon">
      <svg><!-- Sun/Moon icon --></svg>
    </div>
    <span class="glass-actor__toggle-text">Light</span>
  </div>
  <div class="glass-actor__switch">
    <div class="glass-actor__switch-thumb"></div>
  </div>
</div>
```

#### Profile Card (Selection handles)

```html
<div class="glass-actor glass-actor--profile" style="width: 200px; height: 100px;">
  <div class="glass-actor__selection">
    <div class="glass-actor__handle glass-actor__handle--tl"></div>
    <div class="glass-actor__handle glass-actor__handle--tr"></div>
    <div class="glass-actor__handle glass-actor__handle--bl"></div>
    <div class="glass-actor__handle glass-actor__handle--br"></div>
    <div class="glass-actor__handle glass-actor__handle--ml"></div>
    <div class="glass-actor__handle glass-actor__handle--mr"></div>
  </div>
  <div class="glass-actor__logo">Logo<span class="glass-actor__logo-dot">.</span></div>
</div>
```

**Classes de base :**

- `.glass-actor` — Container de base avec glassmorphism
- `.glass-actor--photo` — Variante pour photos avec badge overlay
- `.glass-actor--map` — Variante carte/map avec pin et location
- `.glass-actor--contact` — Formulaire de contact compact
- `.glass-actor--toggle` — Switch de thème
- `.glass-actor--profile` — Carte avec handles de sélection style Figma

**Sous-composants :**

- `.glass-input` — Input stylisé pour les cartes
- `.glass-textarea` — Textarea stylisé
- `.glass-input-wrapper` — Wrapper avec icône
- `.glass-actor__submit` — Bouton d'envoi gradient

### 11. KPI Cards (Recap Section)

Grandes cartes de métriques avec gradients colorés pour afficher des KPIs impactants.

```html
<!-- Grille KPI -->
<div class="kpi-grid">
  <!-- Carte large avec gradient bleu -->
  <div class="kpi-card kpi-card--glass kpi-card--wide">
    <div class="kpi-card__gradient kpi-card__gradient--blue"></div>
    <div class="kpi-card__overlay"></div>
    <div class="kpi-card__content">
      <div class="kpi-card__metric">
        <span class="kpi-card__value">24h</span>
        <span class="kpi-card__label">Délai de livraison</span>
      </div>
      <p class="kpi-card__description">
        Votre première version de site est prête en moins de 24 heures.
      </p>
    </div>
  </div>

  <!-- Carte inversée (contraste) -->
  <div class="kpi-card kpi-card--inverted">
    <div class="kpi-card__content">
      <div class="kpi-card__metric">
        <span class="kpi-card__value">0</span>
        <span class="kpi-card__unit">€</span>
      </div>
      <p class="kpi-card__description">Pour votre première version. Sans engagement.</p>
    </div>
  </div>

  <!-- Carte avec gradient vert -->
  <div class="kpi-card kpi-card--glass">
    <div class="kpi-card__gradient kpi-card__gradient--green"></div>
    <div class="kpi-card__overlay"></div>
    <div class="kpi-card__content">
      <div class="kpi-card__metric">
        <span class="kpi-card__value">100</span>
        <span class="kpi-card__unit">%</span>
      </div>
      <p class="kpi-card__description">Description...</p>
    </div>
  </div>
</div>
```

**Variantes :**

- `.kpi-card--glass` — Style glassmorphism (default)
- `.kpi-card--inverted` — Fond contrasté (noir/blanc inversé selon le mode)
- `.kpi-card--wide` — Occupe 2 colonnes sur desktop

**Gradients disponibles :**

- `.kpi-card__gradient--blue` — Bleu (délai, temps)
- `.kpi-card__gradient--green` — Vert/cyan (succès, garantie)
- `.kpi-card__gradient--orange` — Orange/rouge (support, énergie)
- `.kpi-card__gradient--purple` — Violet (premium, professionnel)

### 12. Case Study Cards (Results Section)

Cartes avant/après pour présenter des transformations ou études de cas.

```html
<div class="case-grid">
  <article class="case-card">
    <div class="kpi-card__gradient kpi-card__gradient--blue"></div>
    <div class="case-card__overlay"></div>
    <div class="case-card__shine"></div>
    <div class="case-card__content">
      <div class="case-card__header">
        <span class="case-card__category">Artisan</span>
        <h3 class="case-card__title">Plombier indépendant</h3>
      </div>
      <div class="case-card__body">
        <p class="case-card__before">Aucune présence en ligne</p>
        <p class="case-card__after">→ Site pro avec formulaire de contact</p>
      </div>
      <div class="case-card__footer">
        <p class="case-card__result">+5 demandes / semaine</p>
      </div>
    </div>
  </article>
</div>
```

**Structure :**

- `.case-card__category` — Label catégorie (uppercase, petit)
- `.case-card__title` — Nom du cas/métier
- `.case-card__before` — État initial (barré)
- `.case-card__after` — Nouveau état avec flèche
- `.case-card__result` — Résultat obtenu (grande typographie)
- `.case-card__shine` — Effet de brillance au hover (dark mode)

---

## Layout

### Container

```html
<div class="container"><!-- max-width: 1200px --></div>
<div class="container--narrow container"><!-- max-width: 720px --></div>
<div class="container--wide container"><!-- max-width: 1400px --></div>
```

### Section

```html
<section class="section"><!-- Standard padding --></section>
<section class="section section--hero"><!-- Extra top padding --></section>
```

### Grid

```html
<div class="grid--2 grid"><!-- 2 colonnes --></div>
<div class="grid--3 grid"><!-- 3 colonnes --></div>
<div class="grid--4 grid"><!-- 4 colonnes --></div>
```

---

## Typographie

```html
<h1 class="text-display">Display Title</h1>
<h2 class="text-headline">Headline <span class="text-accent">avec accent</span></h2>
<h3 class="text-title">Title</h3>
<p class="text-body">Body text</p>
<p class="text-body text-body--large">Large body</p>
<p class="text-caption">Caption</p>
<span class="text-label">LABEL</span>
```

---

## Gradients d'accent

Utilisez ces gradients sur les cards pour ajouter de la couleur subtile :

```css
--gradient-blue    /* Tech, professionnel */
--gradient-purple  /* Créatif, premium */
--gradient-green   /* Succès, croissance */
--gradient-orange  /* Énergie, attention */
--gradient-teal    /* Frais, moderne */
```

```html
<div class="card">
  <div class="card__gradient" style="background: var(--gradient-blue);"></div>
  <!-- ... -->
</div>
```

---

## Dark Mode

Le dark mode s'active via la classe `.dark-mode` sur `<html>` et `<body>` :

```javascript
// Toggle
document.documentElement.classList.toggle('dark-mode')
document.body.classList.toggle('dark-mode')
```

Tous les tokens CSS s'adaptent automatiquement.

---

## Responsive

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 767px
- **Desktop small**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Utilitaires

```html
<div class="hide-mobile">Visible uniquement sur desktop</div>
<div class="show-mobile">Visible uniquement sur mobile</div>
```

---

## Utilisation par une IA

Pour créer une page avec ce design system :

1. Inclure `design-system.css`
2. Structurer avec `container` et `section`
3. Utiliser les classes de typographie (`text-display`, `text-headline`, etc.)
4. Assembler les composants (`btn`, `card`, `testimonial`, etc.)
5. Appliquer les gradients pour la couleur
6. Tester en light et dark mode

### Pattern de section type

```html
<section class="section">
  <div class="container">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h2 class="text-headline mb-4">
        Titre de section <span class="text-accent">avec accent</span>
      </h2>
      <p class="text-body mx-auto max-w-xl">Description de la section.</p>
    </div>

    <!-- Content -->
    <div class="grid--3 grid">
      <!-- Cards ou autre contenu -->
    </div>
  </div>
</section>
```

---

## Fichiers

```
design-system-static/
├── design-system.css   # Tous les styles
├── index.html          # Page de démo complète
└── README.md           # Cette documentation
```

---

_Design System créé avec les principes de Jony Ive : simplicité, élégance, et attention aux détails._
