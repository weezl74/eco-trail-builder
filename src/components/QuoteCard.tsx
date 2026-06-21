import React from 'react';
import type { ClimateQuote } from '@/data/climateQuotes';

interface Props {
  quote: ClimateQuote;
  /** When true, render Welsh first, English under (used on LanguageSelect). */
  bilingual?: boolean;
  /** Single-language render. Defaults to 'en'. */
  lang?: 'en' | 'cy';
  className?: string;
  /** Visual scale: 'sm' fits in a wallet card, 'md' the default. */
  size?: 'sm' | 'md';
}

const QuoteCard: React.FC<Props> = ({
  quote,
  bilingual = false,
  lang = 'en',
  className = '',
  size = 'md',
}) => {
  const big = size === 'md';
  return (
    <figure
      className={`relative font-roboto text-white/95 px-6 py-3 ${className}`}
    >
      <span
        aria-hidden
        className={`absolute left-1 top-0 leading-none text-[#f5a623] select-none ${
          big ? 'text-6xl' : 'text-4xl'
        }`}
        style={{ fontFamily: 'Roboto Slab, serif' }}
      >
        “
      </span>
      <blockquote
        className={`text-center italic ${big ? 'text-base' : 'text-xs'} leading-snug`}
      >
        {bilingual ? (
          <>
            <p>{quote.cy}</p>
            <p className="mt-2 opacity-80 not-italic text-[0.85em]">{quote.en}</p>
          </>
        ) : (
          <p>{lang === 'cy' ? quote.cy : quote.en}</p>
        )}
      </blockquote>
      <span
        aria-hidden
        className={`absolute right-1 bottom-0 leading-none text-[#f5a623] select-none ${
          big ? 'text-6xl' : 'text-4xl'
        }`}
        style={{ fontFamily: 'Roboto Slab, serif' }}
      >
        ”
      </span>
      {quote.attribution && (
        <figcaption
          className={`mt-2 text-center opacity-80 ${
            big ? 'text-xs' : 'text-[10px]'
          }`}
        >
          — {quote.attribution}
          {quote.place ? `, ${quote.place}` : ''}
        </figcaption>
      )}
    </figure>
  );
};

export default QuoteCard;
