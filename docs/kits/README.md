# Content Kits

## What is a Content Kit?

A **Content Kit** is a ready-to-use YAML template for creating pages quickly. Each kit:

- Targets a specific use case (landing page, demo, SEO content, etc.)
- Uses only existing sections, shells, and packs
- Provides intelligent placeholders for easy customization
- Passes all guards (`pnpm guard:pages`)

## What a Kit is NOT

- ❌ A rigid template (you can add/remove sections)
- ❌ An automatic page generator (you copy/paste and customize)
- ❌ A runtime feature (purely documentation)

## Available Kits

| Kit                                       | Use Case                                | Indexed | Kind   |
| ----------------------------------------- | --------------------------------------- | ------- | ------ |
| [landing-interweb](./landing-interweb.md) | Interweb landing/service page           | ✅      | `site` |
| [service-local](./service-local.md)       | Local business (artisan, medical, etc.) | ✅      | `site` |
| [demo-prospect](./demo-prospect.md)       | Client demo/preview page                | ❌      | `demo` |
| [seo-content](./seo-content.md)           | SEO-focused editorial content           | ✅      | `site` |

## Placeholder Conventions

All kits use consistent placeholders in double curly braces:

| Placeholder           | Description              | Example                       |
| --------------------- | ------------------------ | ----------------------------- |
| `{{company_name}}`    | Business/brand name      | `Pizza David`                 |
| `{{service_name}}`    | Main service/product     | `Création de sites web`       |
| `{{primary_benefit}}` | Key value proposition    | `Professionnels en 5 minutes` |
| `{{cta_label}}`       | Call-to-action text      | `Demander un devis`           |
| `{{cta_href}}`        | CTA link target          | `/contact`                    |
| `{{city}}`            | Location (for local SEO) | `Paris`                       |
| `{{phone}}`           | Contact phone            | `01 23 45 67 89`              |
| `{{email}}`           | Contact email            | `contact@example.com`         |
| `{{image_url}}`       | Image URL                | `https://...`                 |
| `{{year}}`            | Current year             | `2025`                        |

## How to Use a Kit

1. **Choose a kit** based on your use case
2. **Copy the YAML** from the kit documentation
3. **Replace placeholders** with real content
4. **Save to content folder**:
   - `site` pages → `content/{locale}/pages/site/{slug}.yaml`
   - `demo` pages → `content/{locale}/pages/demo/{slug}.yaml`
   - `p` pages → `content/{locale}/pages/p/{slug}.yaml`
5. **Validate** with `pnpm guard:pages`

## Creating a New Page in 5 Minutes

```bash
# 1. Pick a kit (e.g., service-local)
# 2. Copy the YAML example from docs/kits/service-local.md
# 3. Create the file:
touch content/fr/pages/site/my-new-page.yaml

# 4. Paste and edit the YAML (replace all {{placeholders}})

# 5. Validate:
pnpm guard:pages

# 6. Preview:
pnpm dev
# Visit http://localhost:3000/my-new-page
```

## Kit Structure

Each kit file contains:

1. **Objective** — What the kit is for
2. **Sections Used** — Which sections in which order
3. **Why This Choice** — Rationale for the structure
4. **Complete YAML Example** — Ready to copy/paste
5. **Editing Rules** — What to change, what to keep

## Contributing

To add a new kit:

1. Create `docs/kits/{kit-name}.md`
2. Follow the structure above
3. Use ONLY existing sections/shells/packs
4. Test with `pnpm guard:pages`
5. Add to the table in this README
