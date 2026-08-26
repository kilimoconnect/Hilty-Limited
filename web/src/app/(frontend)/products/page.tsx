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
import { PageHeader } from '../../../components/ui/PageHeader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { categoryTone } from '../../../components/ui/Swatch'
import { ProductCard } from '../../../components/catalogue/ProductCard'
import { ArrowRight, BrushIcon, ChevronRight, FilterIcon } from '../../../components/ui/icons'

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
      <PageHeader eyebrow={t.home.categoriesEyebrow} title={t.catalogue.title} lead={t.catalogue.subtitle}>
        {/* Category rail — each category carries the colour it uses across the site. */}
        <nav
          aria-label={t.catalogue.category}
          className="-mx-5 mt-9 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          <Link
            href="/products"
            aria-current={!filters.category ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors ${
              !filters.category
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-line-strong bg-surface text-ink-soft hover:border-brand-500 hover:text-brand-700'
            }`}
          >
            {t.catalogue.all}
          </Link>
          {categories.map((c, i) => {
            const selected = filters.category === c.slug
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug ?? ''}`}
                aria-current={selected ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors ${
                  selected
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-line-strong bg-surface text-ink-soft hover:border-brand-500 hover:text-brand-700'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: categoryTone(c.key, i) }}
                />
                {c.name}
              </Link>
            )
          })}
        </nav>
      </PageHeader>

      <Container className="grid grid-cols-1 gap-10 py-14 lg:grid-cols-[17rem_1fr] lg:gap-14 lg:py-20">
        {/* Filters. A CSS-only disclosure: collapsed on small screens so the results
            lead, always open from lg up where the sidebar has its own column. */}
        <div className="h-max rounded-lg border border-line bg-surface lg:sticky lg:top-32">
          <input
            id="filters-toggle"
            type="checkbox"
            defaultChecked={active}
            aria-label={t.catalogue.filters}
            className="peer sr-only"
          />
          <label
            htmlFor="filters-toggle"
            className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-display font-semibold peer-checked:[&_[data-chev]]:rotate-90 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500 lg:cursor-default"
          >
            <span className="flex items-center gap-2.5">
              <FilterIcon width={18} height={18} className="text-brand-500" />
              {t.catalogue.filters}
            </span>
            <ChevronRight
              data-chev
              width={18}
              height={18}
              className="text-muted transition-transform duration-200 lg:hidden"
            />
          </label>
          <form
            method="get"
            action="/products"
            className="hidden space-y-5 border-t border-line px-5 py-5 peer-checked:block lg:block"
          >
            <FilterField id="f-q" label={t.nav.search}>
              <input
                id="f-q"
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder={t.catalogue.searchPlaceholder}
                className={inputCls}
              />
            </FilterField>

            <Select id="f-category" name="category" label={t.catalogue.category} value={filters.category} anyLabel={t.catalogue.all}
              options={categories.map((c) => ({ value: c.slug ?? '', label: c.name }))} />
            <Select id="f-brand" name="brand" label={t.catalogue.brand} value={filters.brand} anyLabel={t.catalogue.any}
              options={brands.map((b) => ({ value: b.slug ?? '', label: b.name }))} />
            <Select id="f-use" name="use" label={t.catalogue.use} value={filters.use} anyLabel={t.catalogue.any} options={USE_OPTIONS} />
            <Select id="f-finish" name="finish" label={t.catalogue.finish} value={filters.finish} anyLabel={t.catalogue.any} options={FINISH_OPTIONS} />
            <Select id="f-pack" name="pack" label={t.catalogue.pack} value={filters.pack} anyLabel={t.catalogue.any}
              options={PACK_OPTIONS.map((n) => ({ value: String(n), label: `${n} ${t.product.litres}` }))} />

            <FilterField id="f-surface" label={t.catalogue.surface}>
              <input id="f-surface" name="surface" type="text" defaultValue={filters.surface} className={inputCls} />
            </FilterField>

            <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-5 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t.catalogue.apply}
              </button>
              {active && (
                <Link href="/products" className="link-quiet text-sm text-muted hover:text-brand-700">
                  {t.catalogue.clear}
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          {!active && featured.length > 0 && <ProductRow title={t.catalogue.featured} products={featured} t={t} />}
          {!active && popular.length > 0 && <ProductRow title={t.catalogue.popular} products={popular} t={t} />}

          {catalogueEmpty ? (
            <EmptyState
              icon={<BrushIcon width={22} height={22} />}
              title={t.catalogue.empty}
              action={<Button href="/request-quotation">{t.hero.quotation}</Button>}
            />
          ) : result.totalDocs === 0 ? (
            <EmptyState
              icon={<FilterIcon width={22} height={22} />}
              title={t.catalogue.noResults}
              action={
                <Button href="/products" variant="outline">
                  {t.catalogue.clear}
                </Button>
              }
            />
          ) : (
            <>
              <p className="tabular mb-6 border-b border-line pb-4 text-sm text-muted">
                <span className="font-semibold text-ink">{result.totalDocs}</span> {t.catalogue.results}
              </p>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.docs.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} t={t} />
                  </li>
                ))}
              </ul>

              {result.totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-between border-t border-line pt-6" aria-label="Pagination">
                  <PagerLink disabled={!result.hasPrevPage} href={qs(filters, { page: (filters.page ?? 1) - 1 })} label={t.catalogue.prev} />
                  <span className="tabular text-sm text-muted">
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

const inputCls =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500'

function FilterField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
    </div>
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
    <FilterField id={id} label={label}>
      <select id={id} name={name} defaultValue={value ?? ''} className={inputCls}>
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FilterField>
  )
}

function ProductRow({
  title,
  products,
  t,
}: {
  title: string
  products: Parameters<typeof ProductCard>[0]['product'][]
  t: Parameters<typeof ProductCard>[0]['t']
}) {
  return (
    <section className="mb-14">
      <h2 className="mb-5 font-display text-h3 font-semibold">{title}</h2>
      <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} t={t} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PagerLink({ href, label, disabled }: { href: string; label: string; disabled: boolean }) {
  if (disabled)
    return (
      <span className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-medium text-muted opacity-50">
        {label}
      </span>
    )
  return (
    <Link
      href={href}
      className="group inline-flex h-10 items-center gap-2 rounded-md border border-line-strong px-4 font-display text-sm font-medium transition-colors hover:border-brand-600 hover:text-brand-700"
    >
      {label}
      <ArrowRight width={15} height={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  )
}
