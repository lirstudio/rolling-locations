import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* R for Rollin – text-only logo mark, no cart icon */}
      <path
        d="M10 8h6c4.418 0 8 3.582 8 8s-3.582 8-8 8h-2v6H10V8zm2 12h4c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4v8z"
        fill="currentColor"
      />
    </svg>
  )
}
