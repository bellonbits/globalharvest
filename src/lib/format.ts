const dateFmt = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatShortDate = (iso: string) => shortFmt.format(new Date(iso))
export const dayOfMonth = (iso: string) => new Date(iso).getDate().toString().padStart(2, '0')
export const monthShort = (iso: string) => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(iso))

export const participationLabel = { online: 'Online', 'in-person': 'In person', both: 'Online & in person' } as const
