import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { ComingSoon } from '../../../components/ComingSoon'
import { Container } from '../../../components/ui/Container'
import { DesignCta } from '../../../components/design/DesignCta'

export default async function Page() {
  const t = getDictionary(await getLocale())
  return (
    <>
      <ComingSoon title={t.advisor.title} />
      <Container className="pb-12">
        <DesignCta dict={t} variant="banner" />
      </Container>
    </>
  )
}
