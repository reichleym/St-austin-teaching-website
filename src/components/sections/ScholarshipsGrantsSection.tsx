'use client';

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Button from "../Button";

export type ScholarshipGrantCard = {
  icon: string;
  title: string;
  description: string;
};

const DESCRIPTION_COLLAPSED_LINES = 5;

function ExpandableDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = paragraphRef.current;
    if (!el) return;
    if (expanded) return;
    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
    setCanExpand(isOverflowing);
  }, [expanded]);

  useEffect(() => {
    if (expanded) return;
    const raf = requestAnimationFrame(checkOverflow);
    return () => cancelAnimationFrame(raf);
  }, [checkOverflow, expanded, text]);

  useEffect(() => {
    const el = paragraphRef.current;
    if (!el) return;

    if (typeof ResizeObserver === "undefined") {
      const onResize = () => checkOverflow();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const ro = new ResizeObserver(() => checkOverflow());
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkOverflow]);

  const showToggle = canExpand || expanded;

  return (
    <div>
      <p
        ref={paragraphRef}
        className={className}
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: DESCRIPTION_COLLAPSED_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-semibold text-[#1E73BE] hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </div>
  );
}

function ScholarshipCard({
  item,
  wrapClassName,
  contentClassName,
  imageClassName,
  imageWidth,
}: {
  item: ScholarshipGrantCard;
  wrapClassName?: string;
  contentClassName?: string;
  imageClassName?: string;
  imageWidth?: number;
}) {
  return (
    <div className={wrapClassName ?? "bg-white rounded-[10px] overflow-hidden"}>
      <div className={contentClassName ?? "p-6"}>
        <img
          src={item.icon}
          alt={item.title}
          width={imageWidth}
          className={imageClassName ?? "mb-4"}
        />
        <div className="text-xl font-semibold leading-tight mb-2.5">
          {item.title}
        </div>
        <ExpandableDescription text={item.description} />
      </div>
    </div>
  );
}

export default function ScholarshipsGrantsSection({
  title,
  description,
  cards,
  button,
  enableCarousel = true,
}: {
  title: string;
  description?: React.ReactNode | string | null;
  cards: ScholarshipGrantCard[];
  button?:
    | {
        href: string;
        label: string;
        variant?: "primary" | "outline" | "white" | "icon" | "whiteOutline";
      }
    | React.ReactNode
    | null;
  enableCarousel?: boolean;
}) {
  const carouselId = useId();
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const desktopCarouselRef = useRef<HTMLDivElement | null>(null);

  const getGapPx = (el: HTMLElement) => {
    const style = getComputedStyle(el);
    const rawGap = style.columnGap || style.gap || "0";
    const parsed = Number.parseFloat(rawGap);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: -1 | 1,
  ) => {
    const el = ref.current;
    if (!el) return;
    const firstItem =
      el.querySelector<HTMLElement>("[data-carousel-item='true']");
    const gapPx = getGapPx(el);
    const scrollAmount = firstItem
      ? firstItem.offsetWidth + gapPx
      : Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  const resolvedButton =
    button && typeof button === "object" && "href" in button ? (
      <Link href={button.href} className="inline-block">
        <Button variant={button.variant ?? "white"}>{button.label}</Button>
      </Link>
    ) : (
      button
    );

  return (
    <section className="bg-[#1E73BE] md:py-15 py-15">
      <div className="container">
        {/* <div className="flex flex-col sm:grid grid-cols-1 lg:grid-cols-8 gap-8 items-center"> */}
        <div className="grid grid-cols-1 gap-4 lg:gap-8 lg:flex lg:flex-col items-center">
          <div className="text-white lg:col-span-3">
            <h2 className="text-4xl md:text-[50px] font-bold mb-2.5 leading-tight">
              {title}
            </h2>
            {description ? <p className="mb-7">{description}</p> : null}
            {resolvedButton ? resolvedButton : null}
          </div>

          <div className="lg:col-span-5">
            {enableCarousel ? (
              <>
                <div className="flex items-center justify-end gap-2 mb-4 md:hidden">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(mobileCarouselRef, -1)}
                    className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                    aria-label="Scroll cards left"
                    aria-controls={carouselId}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(mobileCarouselRef, 1)}
                    className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                    aria-label="Scroll cards right"
                    aria-controls={carouselId}
                  >
                    ›
                  </button>
                </div>

                <div
                  id={carouselId}
                  ref={mobileCarouselRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden hide-scrollbar"
                  aria-label="Scholarships & Grants cards carousel"
                >
                  {cards.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      data-carousel-item="true"
                      className="snap-start shrink-0 w-[85%] max-w-[420px]"
                    >
                      <ScholarshipCard
                        item={item}
                        wrapClassName="bg-white rounded-[10px] overflow-hidden h-full"
                        contentClassName="p-6 flex flex-col items-center md:items-start text-center md:text-left h-full"
                      />
                    </div>
                  ))}
                </div>

                {cards.length > 4 ? (
                  <>
                    <div className="hidden md:flex items-center justify-end gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => scrollCarousel(desktopCarouselRef, -1)}
                        className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                        aria-label="Scroll cards left"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel(desktopCarouselRef, 1)}
                        className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                        aria-label="Scroll cards right"
                      >
                        ›
                      </button>
                    </div>
                    <div
                      ref={desktopCarouselRef}
                      className="hidden md:flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar"
                      aria-label="Scholarships & Grants cards slider"
                    >
                      {cards.map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          data-carousel-item="true"
                          className="snap-start shrink-0 w-[calc((100%-72px)/4)] min-w-[240px]"
                        >
                          <ScholarshipCard
                            item={item}
                            wrapClassName="bg-white rounded-[10px] overflow-hidden h-full"
                            contentClassName="p-6 h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((item, index) => (
                      <div
                        className="h-full"
                        key={`${item.title}-${index}`}
                      >
                        <ScholarshipCard
                          item={item}
                          wrapClassName="bg-white rounded-[10px] overflow-hidden h-full"
                          contentClassName="p-6 h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((item, index) => (
                  <div
                    className="h-full"
                    key={`${item.title}-${index}`}
                  >
                    <ScholarshipCard
                      item={item}
                      wrapClassName="bg-white rounded-[10px] overflow-hidden h-full"
                      contentClassName="p-6 h-full"
                      imageWidth={70}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
