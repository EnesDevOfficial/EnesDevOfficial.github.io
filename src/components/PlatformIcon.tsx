export default function PlatformIcon({ path, mail }: { path?: string; mail: boolean }) {
  return (
    <span className="icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {path ? (
          <path d={path} />
        ) : mail ? (
          <path d="M3 6h18v12H3zM3 7l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        ) : (
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
    </span>
  )
}
