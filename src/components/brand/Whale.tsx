import { cn } from '../../lib/cn'

export interface WhaleColors {
  body?: string
  shadow?: string
  belly?: string
  /** Colour of the throat grooves on the belly (defaults to body). */
  grooves?: string
}

interface WhaleProps extends WhaleColors {
  /** Draw an outline in this colour so the whale separates from what sits behind it. */
  halo?: string
  haloWidth?: number
  className?: string
}

/* Humpback whale drawn on a 640×340 canvas, swimming right-to-left and rising. */
const BODY =
  'M14 190C40 160 100 136 170 128C250 116 350 114 430 100C470 91 505 78 530 62C542 54 550 48 556 44C548 30 540 16 528 4C552 10 570 20 584 30C598 38 618 56 634 80C612 72 592 66 574 64C548 84 520 104 490 122C430 160 360 190 290 202C220 214 150 216 100 212C60 208 30 200 14 190Z'
const FAR_FIN = 'M300 204C314 222 326 236 346 246C338 232 332 218 330 202Z'
const NEAR_FIN =
  'M158 198C176 232 200 272 236 314C246 324 258 324 260 312C256 296 246 278 234 258C220 236 208 214 206 196Z'
const DORSAL = 'M436 100C446 90 458 84 472 82C464 88 460 94 458 97Z'
const BELLY =
  'M20 193C60 186 120 182 190 180C250 178 310 172 366 158C326 186 262 204 200 210C140 215 70 211 20 193Z'
const GROOVES = [
  'M40 195C100 190 170 190 250 186',
  'M52 200C110 198 180 198 262 192',
  'M66 205C120 205 190 205 272 197',
  'M90 209C140 211 200 210 270 203',
  'M230 182C280 180 320 172 356 162',
]

/** The whale as an SVG <g>, for composing inside other SVGs (e.g. the SENT mark). */
export function WhaleShape({
  body = 'var(--color-teal-600)',
  shadow = 'var(--color-teal-900)',
  belly = 'var(--color-cream-100)',
  grooves,
  halo,
  haloWidth = 10,
}: WhaleProps) {
  const groove = grooves ?? body
  return (
    <g>
      {halo ? (
        <g fill={halo} stroke={halo} strokeWidth={haloWidth} strokeLinejoin="round">
          <path d={FAR_FIN} />
          <path d={BODY} />
          <path d={NEAR_FIN} />
          <path d={DORSAL} />
        </g>
      ) : null}
      <path d={FAR_FIN} fill={shadow} />
      <path d={BODY} fill={body} />
      <path d={BELLY} fill={belly} />
      <g fill="none" stroke={groove} strokeWidth={2.4} strokeLinecap="round">
        {GROOVES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d="M16 190C56 186 110 178 164 168" fill="none" stroke={belly} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      <circle cx={120} cy={164} r={4.8} fill={belly} />
      <path d={DORSAL} fill={body} />
      <path d={NEAR_FIN} fill={body} />
      <path d="M164 204C182 236 206 274 240 312" fill="none" stroke={belly} strokeWidth={3.2} strokeLinecap="round" />
      <path d="M180 206C196 234 216 266 244 300" fill="none" stroke={belly} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </g>
  )
}

/** Standalone whale illustration. Decorative by default. */
export function Whale({ className, ...props }: WhaleProps) {
  return (
    <svg viewBox="0 0 640 340" className={cn('h-auto w-full', className)} aria-hidden="true" focusable="false">
      <WhaleShape {...props} />
    </svg>
  )
}
