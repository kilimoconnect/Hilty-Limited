import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { ComingSoon } from '../../../components/ComingSoon'

export default async function Page() {
  const t = getDictionary(await getLocale())
  return <ComingSoon title={t.nav.quotation} />
}
