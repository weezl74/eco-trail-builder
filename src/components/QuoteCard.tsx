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
