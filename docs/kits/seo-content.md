# Kit: SEO Content

## Objective

Create an SEO-focused editorial content page:

- Long-form content optimized for search engines
- Clear structure with headings (H2, H3)
- FAQ for featured snippets
- Minimal distractions (no heavy hero)

**Target**: Public SEO-indexed page for content marketing.

## Sections Used

| Order | Section        | Purpose                   |
| ----- | -------------- | ------------------------- |
| 1     | `layout.stack` | Article title + intro     |
| 2     | `layout.stack` | Main content              |
| 3     | `layout.split` | Content + illustration    |
| 4     | `faq.simple`   | FAQ for featured snippets |
| 5     | `layout.stack` | CTA / Conclusion          |

## Why This Choice

- **layout.stack × 3**: Main content vehicle with HTML flexibility
- **layout.split**: Break up text with images
- **faq.simple**: Google loves FAQ for featured snippets
- **No hero.split**: Editorial content doesn't need flashy hero

## Complete YAML Example

Save to: `content/fr/pages/site/{{slug}}.yaml`

```yaml
kind: site

seo:
  title: '{{article_title}} — {{company_name}}'
  description: '{{meta_description}}'

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
        - label: Blog
          href: '/blog'
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

sections:
  # Title + Intro
  - id: layout.stack
    props:
      gap: 6
      align: start
      maxWidth: 3xl
      paddingY: 12
      paddingX: 4
      content: |
        <h1>{{article_title}}</h1>
        <p class="lead">{{intro_paragraph}}</p>

  # Main Content Section 1
  - id: layout.stack
    props:
      gap: 6
      align: start
      maxWidth: 3xl
      paddingY: 8
      paddingX: 4
      content: |
        <h2>{{h2_title_1}}</h2>
        <p>{{paragraph_1}}</p>
        <p>{{paragraph_2}}</p>
        <h3>{{h3_title_1}}</h3>
        <p>{{paragraph_3}}</p>
        <ul>
          <li>{{bullet_1}}</li>
          <li>{{bullet_2}}</li>
          <li>{{bullet_3}}</li>
        </ul>

  # Content + Image
  - id: layout.split
    props:
      ratio: '2:1'
      gap: 12
      align: start
      paddingY: 8
      left: |
        <h2>{{h2_title_2}}</h2>
        <p>{{paragraph_4}}</p>
        <p>{{paragraph_5}}</p>
      rightImage: '{{image_url}}'

  # FAQ Section
  - id: faq.simple
    props:
      title: 'Questions fréquentes sur {{topic}}'
      items:
        - q: '{{question_1}}'
          a: '{{answer_1}}'
        - q: '{{question_2}}'
          a: '{{answer_2}}'
        - q: '{{question_3}}'
          a: '{{answer_3}}'

  # CTA / Conclusion
  - id: layout.stack
    props:
      gap: 6
      align: center
      maxWidth: 2xl
      paddingY: 12
      paddingX: 4
      content: |
        <h2>{{cta_title}}</h2>
        <p>{{cta_paragraph}}</p>
        <p><a href="{{cta_href}}" class="button">{{cta_label}}</a></p>
```

## Editing Rules

### What to Change

| Placeholder                          | Replace With                 |
| ------------------------------------ | ---------------------------- |
| `{{article_title}}`                  | Main H1 title                |
| `{{meta_description}}`               | 150-160 char SEO description |
| `{{company_name}}`                   | Brand name                   |
| `{{intro_paragraph}}`                | Hook paragraph               |
| `{{h2_title_X}}`                     | H2 section titles            |
| `{{h3_title_X}}`                     | H3 subsection titles         |
| `{{paragraph_X}}`                    | Content paragraphs           |
| `{{bullet_X}}`                       | List items                   |
| `{{question/answer_X}}`              | FAQ Q&A pairs                |
| `{{topic}}`                          | FAQ topic for title          |
| `{{cta_title/paragraph/label/href}}` | Final CTA                    |
| `{{image_url}}`                      | Illustration URL             |
| `{{year}}`                           | Current year                 |
| `{{slug}}`                           | URL slug                     |

### What to Keep

- `kind: site` — Required for SEO indexing
- `align: start` — Left-aligned text is more readable
- `maxWidth: 3xl` — Optimal reading width
- FAQ section — Helps featured snippets

### SEO Best Practices

1. **Title**: Include primary keyword, < 60 chars
2. **Description**: Include keyword, 150-160 chars
3. **H1**: One per page, matches title
4. **H2/H3**: Use hierarchy, include keywords
5. **FAQ**: Answer real questions, be concise

### Content Structure Tips

```
H1 — Main Topic (1x)
├── Intro paragraph
├── H2 — Subtopic 1
│   ├── Paragraph
│   └── H3 — Detail
│       └── Bullet list
├── H2 — Subtopic 2 + Image
├── FAQ
└── CTA
```

### Optional Modifications

- Add more `layout.stack` sections for longer content
- Add `layout.split` with `reverse: true` for variety
- Remove header/footer for cleaner reading experience:

```yaml
shell:
  header: null
  footer: null
```

- Add structured data hints in content (for future JSON-LD):

```yaml
# Future: JSON-LD could be generated from this
seo:
  type: article
  publishedTime: '2025-01-15'
  modifiedTime: '2025-01-20'
```
