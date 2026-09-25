import { Fragment } from 'react';

// Turns "Build *something* real" into: Build <em>something</em> real
export function emphasize(text) {
  if (typeof text !== 'string') return text;
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
}

export const pad = (n) => String(n).padStart(2, '0');
