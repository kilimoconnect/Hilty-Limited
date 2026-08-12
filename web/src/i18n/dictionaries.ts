/**
 * Bilingual copy (English + Kiswahili). The Kiswahili is a first pass and should be
 * reviewed by a native speaker before launch (see HILTY_CONTENT_GAPS.md).
 */
export type Locale = 'en' | 'sw'
export const LOCALES: Locale[] = ['en', 'sw']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'hilty_locale'

const en = {
  localeName: 'English',
  nav: {
    home: 'Home',
    products: 'Products',
    calculator: 'Paint Calculator',
    services: 'Painting Services',
    projects: 'Projects',
    painters: 'Painters & Contractors',
    branches: 'Branches',
    about: 'About Hilty',
    quotation: 'Request Quotation',
    search: 'Search',
    searchPlaceholder: 'Search products, colours, services…',
    call: 'Call',
    whatsapp: 'WhatsApp',
    menu: 'Menu',
    close: 'Close',
    language: 'Language',
  },
  hero: {
    title: 'Paint, coatings and expert support for every project.',
    subtitle:
      'Shop genuine Plascon paint and painting materials, calculate your requirements, request professional guidance and obtain a project quotation from Hilty.',
    quotation: 'Request a quotation',
    calculate: 'Calculate paint',
    browse: 'Browse products',
    advisor: 'Ask the AI Paint Advisor',
  },
  trust: {
    title: 'Why buy from Hilty',
    genuine: { title: 'Genuine products', body: 'Authentic Plascon paint and quality painting materials.' },
    outlets: { title: 'Multiple outlets', body: 'Serving customers across several branches.' },
    guidance: { title: 'Professional guidance', body: 'Practical product advice for the right paint system.' },
    support: { title: 'Residential & commercial', body: 'Support for homes, businesses and larger projects.' },
  },
  categories: { title: 'Shop by category', subtitle: 'Find the right products for your surface and project.', view: 'View category' },
  how: {
    title: 'How Hilty helps you',
    steps: [
      { title: 'Select the correct system', body: 'Match the right paint and primer to your surface.' },
      { title: 'Calculate the materials', body: 'Estimate paint and materials by area in m² and litres.' },
      { title: 'Receive a quotation', body: 'Send your details and get a clear project quotation.' },
      { title: 'Arrange supply or site service', body: 'Collect from a branch or book a professional site service.' },
    ],
  },
  featured: { title: 'Featured products', subtitle: 'A selection from our catalogue.', empty: 'Our featured products are being added. Please check back soon or request a quotation.' },
  servicesIntro: {
    title: 'Professional painting services',
    body: 'From interior and exterior painting to surface preparation and colour consultancy, our team supports residential and commercial projects.',
    cta: 'Explore services',
  },
  contractorCta: {
    title: 'Working on a project?',
    body: 'Developers, contractors and painters — partner with Hilty for reliable supply and professional support.',
    quote: 'Request a quotation',
    register: 'Register as a painter/contractor',
  },
  branches: { title: 'Our branches', subtitle: 'Visit us or contact a branch near you.', all: 'View all branches', empty: 'Branch details are being confirmed.' },
  projects: { title: 'Completed projects', subtitle: 'A look at work delivered by Hilty.', empty: 'Project stories are coming soon.' },
  advisor: {
    title: 'Ask the AI Paint Advisor',
    body: 'Get quick guidance on products and paint systems. For colour matching and site issues, our team confirms the details with you.',
    cta: 'Ask the AI Paint Advisor',
    note: 'Guidance only — exact colour and serious wall issues are confirmed by our team.',
  },
  finalCta: {
    title: 'Ready to start your project?',
    body: 'Request a quotation or chat with us on WhatsApp.',
    quote: 'Request a quotation',
    whatsapp: 'Chat on WhatsApp',
  },
  footer: {
    tagline: 'Genuine paint. Professional guidance. Reliable project delivery.',
    company: 'Company',
    shop: 'Shop & tools',
    contact: 'Contact',
    rights: 'All rights reserved.',
    disclaimer:
      'Hilty is a retailer, project supplier and painting-services company — not a paint manufacturer. Plascon and other brand names, products and colours belong to their respective owners.',
    hours: 'Mon–Fri 08:30–18:00 · Sat 08:30–17:30 · Sun closed',
  },
}

const sw: typeof en = {
  localeName: 'Kiswahili',
  nav: {
    home: 'Nyumbani',
    products: 'Bidhaa',
    calculator: 'Kikokotoo cha Rangi',
    services: 'Huduma za Upakaji Rangi',
    projects: 'Miradi',
    painters: 'Wapaka Rangi & Wakandarasi',
    branches: 'Matawi',
    about: 'Kuhusu Hilty',
    quotation: 'Omba Nukuu',
    search: 'Tafuta',
    searchPlaceholder: 'Tafuta bidhaa, rangi, huduma…',
    call: 'Piga simu',
    whatsapp: 'WhatsApp',
    menu: 'Menyu',
    close: 'Funga',
    language: 'Lugha',
  },
  hero: {
    title: 'Rangi, coatings na msaada wa kitaalam kwa kila mradi.',
    subtitle:
      'Nunua rangi halisi za Plascon na vifaa vya upakaji rangi, kokotoa mahitaji yako, omba mwongozo wa kitaalam na upate nukuu ya mradi kutoka Hilty.',
    quotation: 'Omba nukuu',
    calculate: 'Kokotoa rangi',
    browse: 'Tazama bidhaa',
    advisor: 'Uliza Mshauri wa Rangi wa AI',
  },
  trust: {
    title: 'Kwa nini ununue kutoka Hilty',
    genuine: { title: 'Bidhaa halisi', body: 'Rangi halisi za Plascon na vifaa bora vya upakaji rangi.' },
    outlets: { title: 'Matawi mengi', body: 'Tunahudumia wateja katika matawi kadhaa.' },
    guidance: { title: 'Mwongozo wa kitaalam', body: 'Ushauri wa vitendo kwa mfumo sahihi wa rangi.' },
    support: { title: 'Makazi & biashara', body: 'Msaada kwa nyumba, biashara na miradi mikubwa.' },
  },
  categories: { title: 'Nunua kwa kategoria', subtitle: 'Pata bidhaa sahihi kwa uso na mradi wako.', view: 'Tazama kategoria' },
  how: {
    title: 'Jinsi Hilty inavyokusaidia',
    steps: [
      { title: 'Chagua mfumo sahihi', body: 'Oanisha rangi na primer sahihi na uso wako.' },
      { title: 'Kokotoa vifaa', body: 'Kadiria rangi na vifaa kwa eneo katika m² na lita.' },
      { title: 'Pokea nukuu', body: 'Tuma taarifa zako upate nukuu wazi ya mradi.' },
      { title: 'Panga usambazaji au huduma', body: 'Chukua kutoka tawi au weka miadi ya huduma ya kitaalam.' },
    ],
  },
  featured: { title: 'Bidhaa maalum', subtitle: 'Uteuzi kutoka katalogi yetu.', empty: 'Bidhaa maalum zinaongezwa. Tafadhali rudi hivi karibuni au omba nukuu.' },
  servicesIntro: {
    title: 'Huduma za upakaji rangi za kitaalam',
    body: 'Kuanzia upakaji rangi wa ndani na nje hadi maandalizi ya uso na ushauri wa rangi, timu yetu inahudumia miradi ya makazi na biashara.',
    cta: 'Angalia huduma',
  },
  contractorCta: {
    title: 'Unafanya mradi?',
    body: 'Wajenzi, wakandarasi na wapaka rangi — shirikiana na Hilty kwa usambazaji wa kuaminika na msaada wa kitaalam.',
    quote: 'Omba nukuu',
    register: 'Jisajili kama mpaka rangi/mkandarasi',
  },
  branches: { title: 'Matawi yetu', subtitle: 'Tutembelee au wasiliana na tawi lililo karibu nawe.', all: 'Tazama matawi yote', empty: 'Taarifa za matawi zinathibitishwa.' },
  projects: { title: 'Miradi iliyokamilika', subtitle: 'Tazama kazi zilizofanywa na Hilty.', empty: 'Hadithi za miradi zinakuja hivi karibuni.' },
  advisor: {
    title: 'Uliza Mshauri wa Rangi wa AI',
    body: 'Pata mwongozo wa haraka kuhusu bidhaa na mifumo ya rangi. Kwa ulinganishaji wa rangi na masuala ya tovuti, timu yetu itathibitisha nawe.',
    cta: 'Uliza Mshauri wa Rangi wa AI',
    note: 'Mwongozo tu — rangi kamili na matatizo makubwa ya ukuta huthibitishwa na timu yetu.',
  },
  finalCta: {
    title: 'Uko tayari kuanza mradi wako?',
    body: 'Omba nukuu au zungumza nasi kupitia WhatsApp.',
    quote: 'Omba nukuu',
    whatsapp: 'Zungumza kupitia WhatsApp',
  },
  footer: {
    tagline: 'Rangi halisi. Mwongozo wa kitaalam. Utoaji wa miradi wa kuaminika.',
    company: 'Kampuni',
    shop: 'Duka & zana',
    contact: 'Mawasiliano',
    rights: 'Haki zote zimehifadhiwa.',
    disclaimer:
      'Hilty ni muuzaji, msambazaji wa miradi na kampuni ya huduma za upakaji rangi — si mtengenezaji wa rangi. Plascon na majina mengine ya chapa, bidhaa na rangi ni mali ya wenyewe.',
    hours: 'Jumatatu–Ijumaa 08:30–18:00 · Jumamosi 08:30–17:30 · Jumapili imefungwa',
  },
}

export type Dictionary = typeof en

const dictionaries: Record<Locale, Dictionary> = { en, sw }

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale] ?? dictionaries.en
