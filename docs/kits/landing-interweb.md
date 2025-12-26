# Kit: Landing Interweb

## Objective

Create a simple Interweb landing or service page with:

- Strong hero with value proposition
- Key content section
- FAQ for objection handling
- Professional look with Interweb branding

**Target**: Public SEO-indexed page for Interweb services.

## Sections Used

| Order | Section        | Purpose                        |
| ----- | -------------- | ------------------------------ |
| 1     | `hero.split`   | Main headline + CTA            |
| 2     | `layout.stack` | Service description / benefits |
| 3     | `faq.simple`   | Common questions               |

## Why This Choice

- **hero.split**: Immediate value proposition with optional image
- **layout.stack**: Flexible content block for service details
- **faq.simple**: Handles objections, improves SEO with structured Q&A

## Complete YAML Example

Save to: `content/fr/pages/site/{{slug}}.yaml`

```yaml
kind: site

seo:
  title: '{{service_name}} — {{company_name}}'
  description: '{{primary_benefit}}. Découvrez comment {{company_name}} peut vous aider.'

packKey: interweb

shell:
  header:
    id: header.default
    props:
      logoText: '{{company_name}}'
      logoHref: '/'
      navItems:
        - label: Accueil
          href: '/'
        - label: Services
          href: '/services'
        - label: Contact
          href: '/contact'
  footer:
    id: footer.default
    props:
      companyName: '{{company_name}}'
      year: { { year } }
      links:
        - label: Mentions légales
          href: '/mentions-legales'
        - label: Contact
          href: '/contact'

sections:
  - id: hero.split
    props:
      title: '{{service_name}}'
      subtitle: '{{primary_benefit}}. Avec {{company_name}}, créez votre présence en ligne en quelques minutes.'
      ctaLabel: '{{cta_label}}'
      ctaHref: '{{cta_href}}'
      imageUrl: '{{image_url}}'

  - id: layout.stack
    props:
      gap: 8
      align: center
      maxWidth: 3xl
      paddingY: 16
      content: |
        <h2>Pourquoi choisir {{company_name}} ?</h2>
        <p>{{primary_benefit}}. Notre solution vous permet de créer un site professionnel sans compétences techniques.</p>
        <ul>
          <li>✅ Mise en ligne en 5 minutes</li>
          <li>✅ Design professionnel inclus</li>
          <li>✅ Optimisé pour le référencement</li>
        </ul>

  - id: faq.simple
    props:
      title: Questions fréquentes
      items:
        - q: "Combien coûte la création d'un site ?"
          a: 'Notre offre commence à un tarif accessible pour les petites entreprises. Contactez-nous pour un devis personnalisé.'
        - q: 'Puis-je modifier mon site moi-même ?'
          a: 'Absolument ! Notre interface intuitive vous permet de mettre à jour votre contenu en toute autonomie.'
        - q: 'Le site sera-t-il visible sur Google ?'
          a: 'Oui, tous nos sites sont optimisés pour le référencement naturel (SEO).'
```

## Editing Rules

### What to Change

| Placeholder           | Replace With                                            |
| --------------------- | ------------------------------------------------------- |
| `{{service_name}}`    | Your service (e.g., "Création de sites web")            |
| `{{company_name}}`    | Your brand (e.g., "Interweb")                           |
| `{{primary_benefit}}` | Key benefit (e.g., "Sites professionnels en 5 minutes") |
| `{{cta_label}}`       | CTA text (e.g., "Demander un devis")                    |
| `{{cta_href}}`        | CTA link (e.g., "/contact")                             |
| `{{image_url}}`       | Hero image URL                                          |
| `{{year}}`            | Current year (e.g., 2025)                               |
| `{{slug}}`            | Page slug for filename                                  |

### What to Keep

- `kind: site` — Required for SEO indexing
- `packKey: interweb` — Interweb branding
- Section order — Hero first, FAQ last works well

### Optional Modifications

- Remove `shell.header` or `shell.footer` to use default/none
- Add more FAQ items (minimum 1 required)
- Add `layout.split` for image + text sections
- Add `overrides` to customize colors:

```yaml
sections:
  - id: hero.split
    overrides:
      '--primary': '34 197 94' # Custom green
    props:
      title: ...
```
