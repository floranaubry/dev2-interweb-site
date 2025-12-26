# Kit: Service Local

## Objective

Create a landing page for a local business (artisan, medical practice, restaurant, etc.) with:

- Hero with local identity
- Service presentation
- FAQ for common client questions
- Local SEO optimization (city in SEO fields)

**Target**: Public SEO-indexed page for local businesses.

## Sections Used

| Order | Section        | Purpose                   |
| ----- | -------------- | ------------------------- |
| 1     | `hero.split`   | Business intro + location |
| 2     | `layout.split` | Service details + image   |
| 3     | `faq.simple`   | Client questions          |

## Why This Choice

- **hero.split**: Strong local identity with business photo
- **layout.split**: Perfect for "service + image" blocks
- **faq.simple**: Local businesses get many repeated questions

## Complete YAML Example

Save to: `content/fr/pages/site/{{slug}}.yaml`

```yaml
kind: site

seo:
  title: '{{company_name}} — {{service_name}} à {{city}}'
  description: '{{company_name}}, votre {{service_name}} à {{city}}. {{primary_benefit}}. Contactez-nous au {{phone}}.'

packKey: interweb

shell:
  header:
    id: header.minimal
    props:
      logoText: '{{company_name}}'
      logoHref: '/'
  footer:
    id: footer.default
    props:
      companyName: '{{company_name}}'
      year: { { year } }
      links:
        - label: Contact
          href: '/contact'

sections:
  - id: hero.split
    props:
      title: '{{company_name}}'
      subtitle: '{{service_name}} à {{city}}. {{primary_benefit}}.'
      ctaLabel: '{{cta_label}}'
      ctaHref: 'tel:{{phone}}'
      imageUrl: '{{image_url}}'

  - id: layout.split
    props:
      ratio: '1:1'
      gap: 12
      align: center
      paddingY: 16
      left: |
        <h2>Nos Services</h2>
        <p>{{company_name}} vous propose des services de qualité à {{city}} et ses environs.</p>
        <ul>
          <li>✅ Service 1</li>
          <li>✅ Service 2</li>
          <li>✅ Service 3</li>
        </ul>
        <p><strong>Appelez-nous :</strong> {{phone}}</p>
      rightImage: '{{image_url}}'

  - id: faq.simple
    props:
      title: Questions fréquentes
      items:
        - q: "Quels sont vos horaires d'ouverture ?"
          a: 'Nous sommes ouverts du lundi au vendredi de 9h à 18h, et le samedi de 9h à 12h.'
        - q: 'Intervenez-vous à domicile ?'
          a: 'Oui, nous intervenons dans un rayon de 30km autour de {{city}}.'
        - q: 'Comment prendre rendez-vous ?'
          a: 'Vous pouvez nous appeler au {{phone}} ou nous envoyer un email à {{email}}.'
```

## Editing Rules

### What to Change

| Placeholder           | Replace With                             |
| --------------------- | ---------------------------------------- |
| `{{company_name}}`    | Business name (e.g., "Plomberie Martin") |
| `{{service_name}}`    | Main service (e.g., "Plombier")          |
| `{{city}}`            | City name (e.g., "Lyon")                 |
| `{{primary_benefit}}` | Key benefit (e.g., "Intervention en 1h") |
| `{{cta_label}}`       | CTA text (e.g., "Appeler maintenant")    |
| `{{phone}}`           | Phone number                             |
| `{{email}}`           | Email address                            |
| `{{image_url}}`       | Business photo URL                       |
| `{{year}}`            | Current year                             |
| `{{slug}}`            | Page slug                                |

### What to Keep

- `kind: site` — Required for SEO indexing
- City in `seo.title` and `seo.description` — Local SEO
- `tel:` link in CTA — Mobile-friendly click-to-call

### Local SEO Tips

1. **Include city in title**: "Plombier à Lyon" > "Plomberie Martin"
2. **Include city in description**: Search engines love local context
3. **Add phone number**: Click-to-call is essential for local
4. **Use real business photos**: Stock photos hurt trust

### Optional Modifications

- Add Google Maps embed in `layout.stack`:

```yaml
- id: layout.stack
  props:
    content: |
      <h2>Nous trouver</h2>
      <p>{{company_name}}<br>
      123 rue Example<br>
      69000 {{city}}</p>
```

- Add more service sections with `layout.split`
- Change pack for different branding (if available)
