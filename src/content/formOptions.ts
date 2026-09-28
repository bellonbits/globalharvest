import type { AgeRange, ContactCategory, Country, InterestArea, Participation } from '../types/index.js'

export interface Option<T extends string = string> {
  value: T
  label: string
  hint?: string
}

export const interestOptions: Option<InterestArea>[] = [
  { value: 'bible-study', label: 'Bible Study', hint: 'Join a weekly study group' },
  { value: 'prayer', label: 'Prayer Group', hint: 'Pray with others regularly' },
  { value: 'community', label: 'Community', hint: 'Small groups & fellowship' },
  { value: 'mission', label: 'Mission', hint: 'Outreach & serving' },
  { value: 'events', label: 'Events', hint: 'Hear about gatherings' },
  { value: 'membership', label: 'General Membership', hint: 'Be part of Global Harvest' },
]

export const participationOptions: Option<Participation>[] = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In Person' },
  { value: 'both', label: 'Both' },
]

export const ageRangeOptions: Option<AgeRange>[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: '18-24', label: '18 – 24' },
  { value: '25-34', label: '25 – 34' },
  { value: '35-44', label: '35 – 44' },
  { value: '45-54', label: '45 – 54' },
  { value: '55-64', label: '55 – 64' },
  { value: '65+', label: '65+' },
]

export const languageOptions: Option[] = [
  'English',
  'Arabic',
  'Chinese (Mandarin)',
  'French',
  'German',
  'Hindi',
  'Indonesian',
  'Korean',
  'Portuguese',
  'Russian',
  'Spanish',
  'Swahili',
  'Other',
].map((l) => ({ value: l, label: l }))

export const referralOptions: Option[] = [
  'A friend or family member',
  'My church',
  'Instagram',
  'TikTok',
  'YouTube',
  'Facebook',
  'WhatsApp',
  'Search engine',
  'An event',
  'Other',
].map((l) => ({ value: l, label: l }))

export const contactCategoryOptions: Option<ContactCategory>[] = [
  { value: 'general', label: 'General' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'events', label: 'Events' },
  { value: 'mission', label: 'Mission' },
  { value: 'partnership', label: 'Partnership' },
]

/** ISO 3166-1 alpha-2 codes. Display names are resolved with Intl.DisplayNames. */
const COUNTRY_CODES =
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(
    ' ',
  )

let cachedCountries: Country[] | null = null

export function getCountries(locale = 'en'): Country[] {
  if (cachedCountries) return cachedCountries
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    names = null
  }
  cachedCountries = COUNTRY_CODES.map((code) => ({ code, name: names?.of(code) ?? code })).sort((a, b) =>
    a.name.localeCompare(b.name, locale),
  )
  return cachedCountries
}

export const countryOptions = (): Option[] => getCountries().map((c) => ({ value: c.name, label: c.name }))
