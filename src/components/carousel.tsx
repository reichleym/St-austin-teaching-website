export default function Carousel({
  opts,
  className,
  children,
}: {
  opts?: any
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`carousel relative w-full overflow-hidden ${className}`}
      {...opts}
    >
      {children}
    </div>
  )
}   