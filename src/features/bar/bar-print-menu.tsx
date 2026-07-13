"use client";

/* eslint-disable @next/next/no-img-element */

import { QRCodeSVG } from "qrcode.react";

import { getBarScanUrl } from "@/features/bar/bar-qr-url";
import { formatCzkFromCents } from "@/lib/money";
import {
  DRINK_CATEGORY_LABELS,
  type BarAdminDrink,
  type DrinkCategory,
} from "@/types/bar";

const DRINKS_PER_PAGE = 12;

type BarPrintMenuProps = {
  drinks: BarAdminDrink[];
  subtitle: string;
  title: string;
};

function splitIntoPages<T>(
  items: T[],
  pageSize: number,
): T[][] {
  if (items.length === 0) {
    return [[]];
  }

  const pages: T[][] = [];

  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }

  return pages;
}

function PixelLantern() {
  return (
    <svg
      aria-hidden="true"
      className="bar-menu-lantern"
      shapeRendering="crispEdges"
      viewBox="0 0 28 36"
    >
      <rect fill="#160d08" height="3" width="10" x="9" y="1" />
      <rect fill="#160d08" height="3" width="16" x="6" y="4" />
      <rect fill="#160d08" height="4" width="4" x="4" y="8" />
      <rect fill="#160d08" height="4" width="4" x="20" y="8" />
      <rect fill="#160d08" height="18" width="3" x="3" y="12" />
      <rect fill="#160d08" height="18" width="3" x="22" y="12" />
      <rect fill="#f4a62a" height="18" width="16" x="6" y="10" />
      <rect fill="#ffd86b" height="12" width="10" x="9" y="13" />
      <rect fill="#fff0a8" height="6" width="4" x="12" y="16" />
      <rect fill="#160d08" height="3" width="20" x="4" y="29" />
      <rect fill="#160d08" height="3" width="14" x="7" y="32" />
    </svg>
  );
}

const CATEGORY_ACCENTS: Record<DrinkCategory, string> = {
  beer: "#e6a52f",
  lemonade: "#d95a69",
  energyDrink: "#62b7c9",
  nonAlcoBeer: "#7ea55b",
  other: "#8d6ac8",
};

type PixelDrinkGlyphProps = {
  category: DrinkCategory;
};

function PixelDrinkGlyph({
  category,
}: PixelDrinkGlyphProps) {
  const accent = CATEGORY_ACCENTS[category];

  if (category === "beer" || category === "nonAlcoBeer") {
    return (
      <svg
        aria-hidden="true"
        className="bar-menu-drink-glyph"
        shapeRendering="crispEdges"
        viewBox="0 0 28 32"
      >
        <rect fill="#26160d" height="3" width="18" x="3" y="4" />
        <rect fill="#f5e6ba" height="4" width="16" x="4" y="7" />
        <rect fill="#26160d" height="19" width="3" x="3" y="9" />
        <rect fill={accent} height="16" width="14" x="6" y="11" />
        <rect fill="#ffd86b" height="12" width="4" x="8" y="12" />
        <rect fill="#26160d" height="3" width="18" x="3" y="27" />
        <rect fill="#26160d" height="3" width="6" x="20" y="12" />
        <rect fill="#26160d" height="12" width="3" x="23" y="12" />
        <rect fill="#26160d" height="3" width="6" x="20" y="23" />
        {category === "nonAlcoBeer" ? (
          <rect fill="#f6efcf" height="3" width="7" x="10" y="18" />
        ) : null}
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="bar-menu-drink-glyph"
      shapeRendering="crispEdges"
      viewBox="0 0 28 32"
    >
      <rect fill="#26160d" height="3" width="10" x="9" y="2" />
      <rect fill="#26160d" height="4" width="14" x="7" y="5" />
      <rect fill="#26160d" height="20" width="3" x="5" y="9" />
      <rect fill="#26160d" height="20" width="3" x="20" y="9" />
      <rect fill={accent} height="18" width="12" x="8" y="10" />
      <rect fill="#f7df9d" height="10" width="3" x="10" y="12" />
      <rect fill="#26160d" height="3" width="18" x="5" y="28" />
      {category === "energyDrink" ? (
        <>
          <rect fill="#fff5d5" height="3" width="5" x="14" y="13" />
          <rect fill="#fff5d5" height="3" width="5" x="11" y="16" />
          <rect fill="#fff5d5" height="3" width="5" x="13" y="19" />
        </>
      ) : null}
    </svg>
  );
}

type DrinkArtworkProps = {
  drink: BarAdminDrink;
};

function DrinkArtwork({ drink }: DrinkArtworkProps) {
  return (
    <div className="bar-menu-artwork">
      <PixelDrinkGlyph category={drink.category} />

      {drink.imageUrl ? (
        <img
          alt={`Nápoj ${drink.name}`}
          className="bar-menu-product-image"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src={drink.imageUrl}
        />
      ) : null}
    </div>
  );
}

type DrinkMenuCardProps = {
  drink: BarAdminDrink;
};

function DrinkMenuCard({ drink }: DrinkMenuCardProps) {
  return (
    <article className="bar-menu-card">
      <div className="bar-menu-card__details">
        <DrinkArtwork drink={drink} />

        <div className="bar-menu-card__copy">
          <p className="bar-menu-card__category">
            {DRINK_CATEGORY_LABELS[drink.category]}
          </p>

          <h2 className="bar-menu-card__name">
            {drink.name}
          </h2>

          <p className="bar-menu-card__price">
            {formatCzkFromCents(drink.priceCents)}
          </p>
        </div>
      </div>

      <div className="bar-menu-card__qr">
        <QRCodeSVG
          bgColor="#fffdf4"
          fgColor="#160d08"
          level="M"
          marginSize={4}
          size={116}
          title={`${drink.name} – QR kód`}
          value={getBarScanUrl(drink.qrToken)}
        />

        <span>SCAN &amp; CLAIM</span>
      </div>
    </article>
  );
}

export function BarPrintMenu({
  drinks,
  subtitle,
  title,
}: BarPrintMenuProps) {
  const pages = splitIntoPages(
    drinks,
    DRINKS_PER_PAGE,
  );

  return (
    <div className="bar-print-document">
      {pages.map((pageDrinks, pageIndex) => (
        <section
          aria-label={`Strana ${pageIndex + 1} z ${pages.length}`}
          className="bar-menu-sheet"
          key={`menu-page-${pageIndex + 1}`}
        >
          <div aria-hidden="true" className="bar-menu-corner bar-menu-corner--tl" />
          <div aria-hidden="true" className="bar-menu-corner bar-menu-corner--tr" />
          <div aria-hidden="true" className="bar-menu-corner bar-menu-corner--bl" />
          <div aria-hidden="true" className="bar-menu-corner bar-menu-corner--br" />

          <header className="bar-menu-header">
            <PixelLantern />

            <div className="bar-menu-heading">
              <p className="bar-menu-kicker">
                GAME NIGHT PROVISIONS
              </p>

              <h1>{title}</h1>

              <p>{subtitle}</p>
            </div>

            <div className="bar-menu-header__badge">
              <span>OPEN</span>
              <strong>24 / 7</strong>
            </div>
          </header>

          <div className="bar-menu-divider" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          {pageDrinks.length > 0 ? (
            <div className="bar-menu-grid">
              {pageDrinks.map((drink) => (
                <DrinkMenuCard drink={drink} key={drink.id} />
              ))}
            </div>
          ) : (
            <div className="bar-menu-empty">
              <PixelLantern />
              <p>TAVERNÍ POLICE JSOU ZATÍM PRÁZDNÉ</p>
            </div>
          )}

          <footer className="bar-menu-footer">
            <span>PÍPNI QR</span>
            <i aria-hidden="true" />
            <span>POTVRĎ SESSION</span>
            <i aria-hidden="true" />
            <span>UŽIJ SI DRINK</span>

            {pages.length > 1 ? (
              <strong>
                {pageIndex + 1}/{pages.length}
              </strong>
            ) : null}
          </footer>
        </section>
      ))}
    </div>
  );
}
