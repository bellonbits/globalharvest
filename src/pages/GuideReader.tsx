import { useParams } from 'react-router-dom'
import { GuideDocument } from '../components/guide/GuideDocument'
import { GUIDE_KIND_LABEL } from '../components/guide/guideMeta'
import { CTAButton } from '../components/ui/Button'
import { PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { useToast } from '../components/ui/Toast'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { guideService } from '../services/guideService'
import NotFound from './NotFound'

export default function GuideReader() {
  const { slug = '' } = useParams()
  const { data: guide, loading } = useAsync(() => guideService.get(slug), [slug])
  const { notify } = useToast()
  useSeo({ title: guide?.title ?? 'Study guide', description: guide?.summary, noindex: guide?.isPlaceholder })

  if (loading) return <div className="min-h-[70vh] bg-[#efe9df]" role="status" aria-label="Loading guide" />
  if (!guide) return <NotFound />

  const clearNotes = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`gh-guide:${guide.slug}:`))
        .forEach((k) => localStorage.removeItem(k))
      notify({ tone: 'success', title: 'Your notes were cleared' })
      window.location.reload()
    } catch {
      notify({ tone: 'error', title: 'Couldn’t clear notes' })
    }
  }

  return (
    <div className="bg-[#efe9df] pt-28 pb-24 sm:pt-32 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <p className="eyebrow text-coral-700">{GUIDE_KIND_LABEL[guide.kind]}</p>
            <p className="mt-1 max-w-xl text-sm text-teal-900/65">Write your answers on the lines — they’re saved privately on this device only. Print for a paper booklet.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CTAButton variant="secondary" size="sm" icon={null} iconLeft="file" onClick={() => window.print()}>
              Print / Save PDF
            </CTAButton>
            <CTAButton variant="link" size="sm" icon={null} onClick={clearNotes}>
              Clear my notes
            </CTAButton>
          </div>
        </div>
        {guide.isPlaceholder ? (
          <PlaceholderNotice className="mb-8 print:hidden">This is a sample guide showing the study format. Scripture quotations are from the World English Bible (public domain).</PlaceholderNotice>
        ) : null}
        <GuideDocument guide={guide} journal />
        <div className="mt-12 flex flex-wrap justify-center gap-3 print:hidden">
          <CTAButton to={guide.kind === 'prayer' ? '/register?interest=prayer' : '/register?interest=bible-study'}>{guide.kind === 'prayer' ? 'Join the prayer group' : 'Join a Bible Study'}</CTAButton>
          <CTAButton to={guide.kind === 'prayer' ? '/prayer' : '/bible-study'} variant="secondary" icon={null}>
            More {guide.kind === 'prayer' ? 'prayer' : 'Bible study'}
          </CTAButton>
        </div>
      </div>
    </div>
  )
}
