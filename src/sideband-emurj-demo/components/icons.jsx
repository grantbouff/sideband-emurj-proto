/* Shared icons + avatar for the SideBand kit.
 * Icons take `color` (defaults to currentColor) so callers set colour via a
 * token on the parent. No colour literals leak into components.
 */

import emurjLogo from '../assets/emurj-logo.svg'

// 40px (default) circular avatar — a full-radius frame clipping a logo image.
// The image (svg/png/jpeg) fills the frame and scales with it; the asset
// carries its own ground and internal padding. Swap `src` for other brands.
export const EmurjAvatar = ({ size = 40, src = emurjLogo, alt = 'Emurj' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: '#FFFFFF', flexShrink: 0, overflow: 'hidden',
  }}>
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  </div>
)

export const CloseIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill={color} />
  </svg>
)

export const ArrowIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ThumbsUpIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12.9572 2.03472L7.48558 7.50632C7.12015 7.87175 6.91274 8.37546 6.91274 8.89891V18.7656C6.91274 19.852 7.80163 20.7409 8.88805 20.7409H17.7769C18.5671 20.7409 19.2782 20.2668 19.5942 19.5458L22.814 12.0298C23.6436 10.0742 22.2115 7.90138 20.0881 7.90138H14.5078L15.4461 3.37793C15.5448 2.8841 15.3967 2.38039 15.0411 2.02484C14.4584 1.452 13.53 1.452 12.9572 2.03472ZM2.96213 20.7409C4.04855 20.7409 4.93743 19.852 4.93743 18.7656V10.8643C4.93743 9.77792 4.04855 8.88904 2.96213 8.88904C1.87571 8.88904 0.986816 9.77792 0.986816 10.8643V18.7656C0.986816 19.852 1.87571 20.7409 2.96213 20.7409Z" fill={color} />
  </svg>
)

export const ThumbsDownIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11.0599 21.1339L16.5216 15.6623C16.8871 15.2969 17.0945 14.7932 17.0945 14.2697V4.40304C17.0945 3.31662 16.2056 2.42773 15.1192 2.42773H6.24017C5.45004 2.42773 4.38893 2.90181 4.43276 3.6228L1.213 11.1388C0.373499 13.0944 1.8056 15.2672 3.92905 15.2672H9.5093L8.57103 19.7907C8.47226 20.2845 8.62041 20.7882 8.97597 21.1438C9.55868 21.7166 10.4871 21.7166 11.0599 21.1339ZM21.055 2.42773C19.9686 2.42773 19.0797 3.31662 19.0797 4.40304V12.3043C19.0797 13.3907 19.9686 14.2796 21.055 14.2796C22.1414 14.2796 23.0303 13.3907 23.0303 12.3043V4.40304C23.0303 3.31662 22.1414 2.42773 21.055 2.42773Z" fill={color} />
  </svg>
)

export const CheckIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
