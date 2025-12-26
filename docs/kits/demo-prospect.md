# Kit: Demo Prospect

## Objective

Create a demo page for a prospect/client to preview their future site:

- Shows what their site could look like
- Uses their branding (via pack or overrides)
- NOT indexed by search engines
- Quick to create, easy to customize

**Target**: Private preview page (noindex enforced by system).

## Sections Used

| Order | Section        | Purpose                        |
| ----- | -------------- | ------------------------------ |
| 1     | `hero.split`   | Prospect's hero section        |
| 2     | `layout.split` | Service presentation           |
| 3     | `faq.simple`   | Their typical FAQ              |
| 4     | `hero.split`   | "Créé par Interweb" footer CTA |

## Why This Choice

- **hero.split × 2**: One for prospect, one for Interweb branding
- **layout.split**: Flexible for any service type
- **faq.simple**: Shows real content structure
- **Last hero with pack override**: Shows pack mixing capability

## Complete YAML Example

Save to: `content/fr/pages/demo/{{slug}}.yaml`

```yaml
kind: demo

seo:
  title: '{{company_name}} — Aperçu du site'
  description: 'Aperçu du site web pour {{company_name}}. Cette page est une démonstration.'
  noindex: true

packKey: interweb

shell:
  header: null
  footer: null

sections:
  # Prospect's hero
  - id: hero.split
    overrides:
      '--primary': '{{primary_color}}'
    props:
      title: '{{company_name}}'
      subtitle: '{{primary_benefit}}. Découvrez nos services.'
      ctaLabel: '{{cta_label}}'
      ctaHref: '#contact'
      imageUrl: '{{image_url}}'

  # Services section
  - id: layout.split
    props:
      ratio: '2:1'
      gap: 12
      align: center
      paddingY: 16
      left: |
        <h2>Nos Services</h2>
        <p>{{company_name}} vous propose :</p>
        <ul>
          <li>✅ {{service_1}}</li>
          <li>✅ {{service_2}}</li>
          <li>✅ {{service_3}}</li>
        </ul>
        <p>Contactez-nous pour en savoir plus.</p>
      rightImage: '{{image_url}}'

  # FAQ
  - id: faq.simple
    props:
      title: Questions fréquentes
      items:
        - q: 'Comment nous contacter ?'
          a: 'Appelez-nous au {{phone}} ou envoyez un email à {{email}}.'
        - q: "Quelles sont vos zones d'intervention ?"
          a: 'Nous intervenons dans toute la région de {{city}}.'

  # Interweb branding (pack override)
  - id: hero.split
    pack: interweb
    props:
      title: 'Site créé par Interweb'
      subtitle: 'Cette démonstration a été réalisée avec la plateforme Interweb. Créez votre site en quelques minutes.'
      ctaLabel: 'Découvrir Interweb'
      ctaHref: '/'
```

## Editing Rules

### What to Change

| Placeholder           | Replace With                              |
| --------------------- | ----------------------------------------- |
| `{{company_name}}`    | Prospect's business name                  |
| `{{primary_benefit}}` | Their value proposition                   |
| `{{primary_color}}`   | RGB values (e.g., "234 88 12" for orange) |
| `{{cta_label}}`       | Their CTA text                            |
| `{{service_1/2/3}}`   | Their services                            |
| `{{phone}}`           | Their phone                               |
| `{{email}}`           | Their email                               |
| `{{city}}`            | Their city                                |
| `{{image_url}}`       | Their business photo                      |
| `{{slug}}`            | Demo slug (e.g., "pizza-david")           |

### What to Keep

- `kind: demo` — Ensures noindex
- `noindex: true` — Explicit (system forces it anyway)
- `shell: header: null, footer: null` — Clean demo look
- Last section with `pack: interweb` — Interweb branding

### Color Override Examples

```yaml
# Orange
'--primary': '234 88 12'

# Green
'--primary': '34 197 94'

# Blue
'--primary': '59 130 246'

# Purple
'--primary': '168 85 247'

# Red
'--primary': '239 68 68'
```

### Optional Modifications

- Add `pack: pizza` (or other) for full theme change
- Add more sections to show full site structure
- Include header/footer shells for complete preview:

```yaml
shell:
  header:
    id: header.minimal
    props:
      logoText: '{{company_name}}'
      logoHref: '#'
  footer:
    id: footer.default
    props:
      companyName: '{{company_name}}'
      year: 2025
      links: []
```

## Demo URL

Once created, the demo is accessible at:

```
https://gointerweb.com/demo/{{slug}}
```

This URL:

- ✅ Works immediately (SSR on-demand)
- ✅ Is noindex (not in Google)
- ✅ Has X-Robots-Tag header
- ✅ Can be shared with prospect
