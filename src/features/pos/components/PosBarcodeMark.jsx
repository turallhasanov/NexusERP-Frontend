export function PosBarcodeMark({ code }) {
  return (
    <div className="select-none">
      <div className="flex h-10 items-end gap-px" aria-hidden="true">
        {code.split('').map((digit, index) => (
          <span
            key={`${code}-${index}`}
            className="bg-white/90"
            style={{
              width: Number(digit) % 2 === 0 ? 2 : 1,
              height: `${18 + (Number(digit) % 6) * 3}px`,
            }}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] tracking-[0.28em] text-white/65">{code}</p>
    </div>
  )
}
