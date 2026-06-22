interface StatProps {
  value: string
  label: string
}

export function Stat({ value, label }: StatProps) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-ink sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  )
}
