// The NS monogram: two routed traces (the S with 45° corners) ending in solder pads.
// Drawn on a 64 × 64 grid. Colour comes from `currentColor`; pads from `--ns-pad`.

export const NS_TRACES = [
  'M10 52 V12 L28 52 V12',
  'M55 16 L51 12 H40 L36 16 V28 L40 32 H51 L55 36 V48 L51 52 H37',
];
export const NS_PADS = [
  [10, 52],
  [28, 12],
  [55, 16],
  [37, 52],
];

export default function NSLogo({ className = '', strokeWidth = 4.5, pads = true, title }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`ns-logo${className ? ` ${className}` : ''}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {NS_TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {pads && (
        <g fill="var(--ns-pad, var(--accent))">
          {NS_PADS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.6" />
          ))}
        </g>
      )}
    </svg>
  );
}
