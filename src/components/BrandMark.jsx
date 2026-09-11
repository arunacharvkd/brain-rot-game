export const BRC_LOGO_SRC = '/brc-logo.jpg'
export const BRC_LOGO_COMPACT_SRC = '/brc-logo-sm.jpg'
export const BRC_LOGO_ALT = 'BRC — Test. Train. Transform.'

export default function BrandMark({
  size = 40,
  compact = true,
  className = '',
  alt = BRC_LOGO_ALT,
}) {
  return (
    <img
      src={compact ? BRC_LOGO_COMPACT_SRC : BRC_LOGO_SRC}
      alt={alt}
      className={`brand-mark ${className}`.trim()}
      width={size}
      height={size}
      decoding="async"
    />
  )
}
