# Scale Strategy

How this codebase scales to **10,000+ pages** without breaking.

## Architecture Overview

| Aspect           | Strategy              | Status            |
| ---------------- | --------------------- | ----------------- |
| **SSR**          | On-demand only        | ✅ No prerender   |
| **Build**        | Zero page generation  | ✅ No explosion   |
| **Sitemap**      | Dynamic, cached 10min | ✅ Sorted, stable |
| **Page loading** | Single query by path  | ✅ O(1) lookup    |

## Page Policy Matrix

Defined in `app/config/pagePolicy.ts` — **single source of truth**.

| Kind   | Indexed | Sitemap | Prerender | Use Case         |
| ------ | ------- | ------- | --------- | ---------------- |
| `site` | ✅      | ✅      | ❌        | Public SEO pages |
| `blog` | ✅      | ✅      | ❌        | Blog articles    |
| `p`    | ❌      | ❌      | ❌        | Private previews |
| `demo` | ❌      | ❌      | ❌        | Client demos     |

## Why No Prerender?

1. **Build time scales with page count** — 10k pages = 10k SSR at build
2. **Memory explosion** — Large prerender batches OOM
3. **Incremental impossible** — Full rebuild on any content change
4. **Not needed** — SSR on-demand is fast enough with edge caching

## Scale Thresholds

Defined in `app/config/pagePolicy.ts`:

| Metric             | Warning Threshold | What to do                        |
| ------------------ | ----------------- | --------------------------------- |
| Page Builder pages | 2,000             | Review content, archive old pages |
| Blog articles      | 5,000             | Consider pagination in listing    |
| Sitemap entries    | 10,000            | Implement sitemap index           |

## Sitemap at Scale

Current implementation in `server/utils/sitemap.ts`:

- ✅ **Cached** — 10 minute TTL
- ✅ **Sorted** — Deterministic output
- ✅ **Filtered** — Only `site` + `blog` (via `PAGE_POLICY`)
- ✅ **hreflang** — Only for existing translations
- ⚠️ **Single file** — At 50k+ URLs, split into sitemap index

### Future: Sitemap Index

If sitemap exceeds 50k URLs or 50MB:

```xml
<sitemapindex>
  <sitemap><loc>/sitemap-site.xml</loc></sitemap>
  <sitemap><loc>/sitemap-blog.xml</loc></sitemap>
</sitemapindex>
```

## Page Loader Performance

`server/utils/page-loader.ts` uses:

```ts
serverQueryContent(event).where({ _path: contentPath }).findOne()
```

This is **O(1)** — single document lookup, not full scan.

## Nuxt Content v2 Limits

| Metric          | Safe    | Warning    | Action              |
| --------------- | ------- | ---------- | ------------------- |
| Total documents | < 5,000 | 5k-10k     | Consider Content v3 |
| Single query    | 1 doc   | < 100 docs | Paginate listings   |
| Memory usage    | < 500MB | > 1GB      | Profile, optimize   |

### Known v2 Issues

1. **No streaming** — All results in memory
2. **Full index on boot** — Slow cold start with many docs
3. **No incremental** — Full reindex on any change

### Migration Path (when needed)

1. **Nuxt Content v3** — Better indexing, streaming
2. **External CMS** — Headless for massive scale
3. **Database** — PostgreSQL + Drizzle for 100k+ pages

## CI Guards

| Guard         | Threshold      | Blocking?            |
| ------------- | -------------- | -------------------- |
| `guard:pages` | 2,000 pages    | ⚠️ Warning           |
| Sitemap       | 10,000 entries | ⚠️ Warning (runtime) |

## Quick Checks

```bash
# Count Page Builder pages
find content -path "*/pages/*" -name "*.yaml" | wc -l

# Count blog articles
find content -path "*/blog/*" -name "*.md" | wc -l

# Check sitemap size
curl -s http://localhost:3000/sitemap.xml | wc -l
```

## Summary

**Current capacity**: ~10,000 pages (safe)

**Bottlenecks to watch**:

1. Sitemap generation time (currently cached)
2. Blog listing query (currently loads all per locale)
3. Nuxt Content cold start time

**When to scale further**:

- If build time > 5 minutes → investigate
- If sitemap > 50k URLs → implement index
- If blog > 5k articles → paginate at query level
