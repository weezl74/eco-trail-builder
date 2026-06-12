import React, { useEffect, useState } from 'react';
import sheepBody from '@/assets/sheep/SheepBody.svg.asset.json';

let cached: string | null = null;
let inflight: Promise<string> | null = null;

const loadSvg = async (): Promise<string> => {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch(sheepBody.url)
    .then((r) => r.text())
    .then((t) => {
      cached = t;
      return t;
    });
  return inflight;
};

interface Props {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders the sheep body SVG inline and recolours the wool fill
 * (original #DECAAD) to the supplied colour. Falls back to a plain
 * <img> while the SVG text is loading.
 */
const TintedSheepBody: React.FC<Props> = ({ color, className, style }) => {
  const [svg, setSvg] = useState<string | null>(cached);

  useEffect(() => {
    if (cached) {
      setSvg(cached);
      return;
    }
    let mounted = true;
    loadSvg().then((t) => {
      if (mounted) setSvg(t);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!svg) {
    return (
      <img
        src={sheepBody.url}
        alt=""
        className={className}
        style={style}
        draggable={false}
      />
    );
  }

  // The body of the sheep uses fill="currentColor"; the four legs use #DECAAD.
  // Recolour both so the whole wool surface adopts the user's chosen colour.
  const recoloured = svg.replace(/#DECAAD/gi, color);

  return (
    <div
      className={className}
      style={{ color, ...style }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: recoloured }}
    />
  );
};

export default TintedSheepBody;
