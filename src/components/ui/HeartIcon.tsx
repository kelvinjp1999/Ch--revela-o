import type { SVGProps } from 'react'

type HeartIconProps = SVGProps<SVGSVGElement> & {
  title?: string
}

function HeartIcon({ title = 'Coração', ...props }: HeartIconProps) {
  return (
    <svg
      aria-label={title}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
      viewBox="0 0 48 48"
      {...props}
    >
      <path d="M24 40.5C20.3 36.9 8.7 28.2 8.7 17.5c0-5.5 3.9-9.7 9.2-9.7 3.3 0 5.7 1.8 6.1 4.7.4-2.9 2.8-4.7 6.1-4.7 5.3 0 9.2 4.2 9.2 9.7 0 10.7-11.6 19.4-15.3 23Z" />
    </svg>
  )
}

export default HeartIcon
