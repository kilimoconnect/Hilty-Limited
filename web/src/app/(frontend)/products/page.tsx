import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getCategories, getFeaturedProducts } from '../../../lib/payload'
import {
  FINISH_OPTIONS,
  PACK_OPTIONS,
  USE_OPTIONS,
  getBrands,
  getPopularProducts,
  hasActiveFilters,
  queryProducts,
  type ProductFilters,
} from '../../../lib/catalogue'
import { getClient } from '../../../lib/payload'
import { Container } from '../../../components/ui/Container'
import { Button } from '../../../components/ui/Button'
import { ProductCard } from '../../../components/catalogue/ProductCard'

type SP = Promise<Record<string, string | string[] | undefined>>
const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

function parseFilters(sp: Record<string, string | string[] | undefined>): ProductFilters {
  return {
    q: first(sp.q),
    category: first(sp.category),
    brand: first(sp.brand),
    use: first(sp.use),
    surface: first(sp.surface),
    finish: first(sp.finish),
    pack: first(sp.pack),
    page: Number(first(sp.page)) || 1,
  }
}

const qs = (f: ProductFilters, overrides: Partial<ProductFilters> = {}): string => {
  const merged = { ...f, ...overrides }
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v && !(k === 'page' && v === 1)) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `/products?${s}` : '/products'
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  const sp = await searchParams
  const categorySlug = first(sp.category)
  let title = t.catalogue.title
  let description = `${t.catalogue.subtitle} ${t.footer.disclaimer}`
  if (categorySlug) {
    const p = await getClient()
    const res = await p.find({ collection: 'product-categories', where: { slug: { equals: categorySlug } }, limit: 1, overrideAccess: true })
    const cat = res.docs[0]
    if (cat) {
      title = `${cat.name} — ${t.catalogue.title}`
      description = cat.description || `${cat.name}. ${t.catalogue.subtitle}`
    }
  }
  return { title, description }
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const locale = await getLocale()
  const t = getDictionary(locale)
  const sp = await searchParams
  const filters = parseFilters(sp)
  const active = hasActiveFilters(filters)

  const [categories, brands, result, featured, popular] = await Promise.all([
    getCategories(20),
    getBrands(),
    queryProducts(filters),
    active ? Promise.resolve([]) : getFeaturedProducts(4),
    active ? Promise.resolve([]) : getPopularProducts(4),
  ])

  const catalogueEmpty = result.totalDocs === 0 && !active

  return (
    <>
      {/* Header */}
      <section className="border-b border-line bg-surface-2">
        <Container className="py-10">
          <h1 className="text-3xl font-bold tracking-tight">{t.catalogue.title}</h1>
          <p className="mt-2 text-muted">{t.catalogue.subtitle}</p>

          {/* Category navigation */}
          <nav aria-label={t.catalogue.category} className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`rounded-full border px-3 py-1.5 text-sm ${!filters.category ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-300'}`}
            >
              {t.catalogue.all}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug ?? ''}`}
                className={`rounded-full border px-3 py-1.5 text-sm ${filters.category === c.slug ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-300'}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </Container>
      </section>

      <Container className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <details open className="h-max rounded-xl border border-line bg-surface p-4 [&>summary]:cursor-pointer">
          <summary className="font-semibold lg:hidden">{t.catalogue.filters}</summary>
          <form method="get" action="/products" className="mt-4 space-y-4 lg:mt-2">
            <div>
              <label htmlFor="f-q" className="mb-1 block text-sm font-medium">
                {t.nav.search}
              </label>
              <input
                id="f-q"
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder={t.catalogue.searchPlaceholder}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <Select id="f-category" name="category" label={t.catalogue.category} value={filters.category} anyLabel={t.catalogue.all}
              options={categories.map((c) => ({ value: c.slug ?? '', label: c.name }))} />
            <Select id="f-brand" name="brand" label={t.catalogue.brand} value={filters.brand} anyLabel={t.catalogue.any}
              options={brands.map((b) => ({ value: b.slug ?? '', label: b.name }))} />
            <Select id="f-use" name="use" label={t.catalogue.use} value={filters.use} anyLabel={t.catalogue.any} options={USE_OPTIONS} />
            <Select id="f-finish" name="finish" label={t.catalogue.finish} value={filters.finish} anyLabel={t.catalogue.any} options={FINISH_OPTIONS} />
            <Select id="f-pack" name="pack" label={t.catalogue.pack} value={filters.pack} anyLabel={t.catalogue.any}
              options={PACK_OPTIONS.map((n) => ({ value: String(n), label: `${n} ${t.product.litres}` }))} />

            <div>
              <label htmlFor="f-surface" className="mb-1 block text-sm font-medium">
                {t.catalogue.surface}
              </label>
              <input
                id="f-surface"
                name="surface"
                type="text"
                defaultValue={filters.surface}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                {t.catalogue.apply}
              </button>
              {active && (
                <Link href="/products" className="text-sm text-muted hover:text-brand-700">
                  {t.catalogue.clear}
                </Link>
              )}
            </div>
          </form>
        </details>

        {/* Results */}
        <div>
          {/* Featured / popular (only on default browse) */}
          {!active && featured.length > 0 && (
            <ProductRow title={t.catalogue.featured} products={featured} t={t} />
          )}
          {!active && popular.length > 0 && (
            <ProductRow title={t.catalogue.popular} products={popular} t={t} />
          )}

          {catalogueEmpty ? (
            <EmptyState message={t.catalogue.empty} cta={t.hero.quotation} />
          ) : result.totalDocs === 0 ? (
            <EmptyState message={t.catalogue.noResults} cta={t.catalogue.clear} ctaHref="/products" />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">
                {result.totalDocs} {t.catalogue.results}
              </p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.docs.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} t={t} />
                  </li>
                ))}
              </ul>

              {result.totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-between" aria-label="Pagination">
                  <PagerLink disabled={!result.hasPrevPage} href={qs(filters, { page: (filters.page ?? 1) - 1 })} label={t.catalogue.prev} />
                  <span className="text-sm text-muted">
                    {t.catalogue.page} {result.page} {t.catalogue.of} {result.totalPages}
                  </span>
                  <PagerLink disabled={!result.hasNextPage} href={qs(filters, { page: (filters.page ?? 1) + 1 })} label={t.catalogue.next} />
                </nav>
              )}
            </>
          )}
        </div>
      </Container>
    </>
  )
}

function Select({
  id,
  name,
  label,
  value,
  anyLabel,
  options,
}: {
  id: string
  name: string
  label: string
  value?: string
  anyLabel: string
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value ?? ''}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ProductRow({ title, products, t }: { title: string; products: Parameters<typeof ProductCard>[0]['product'][]; t: Parameters<typeof ProductCard>[0]['t'] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} t={t} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyState({ message, cta, ctaHref = '/request-quotation' }: { message: string; cta: string; ctaHref?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
      <p className="text-muted">{message}</p>
      <div className="mt-4">
        <Button href={ctaHref} variant="outline">
          {cta}
        </Button>
      </div>
    </div>
  )
}

function PagerLink({ href, label, disabled }: { href: string; label: string; disabled: boolean }) {
  if (disabled) return <span className="rounded-lg border border-line px-4 py-2 text-sm text-muted opacity-50">{label}</span>
  return (
    <Link href={href} className="rounded-lg border border-line px-4 py-2 text-sm hover:border-brand-300">
      {label}
    </Link>
  )
}
