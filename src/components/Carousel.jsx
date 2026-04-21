import React, { useEffect, useState, useRef, useCallback } from "react";

export default function Carousel({ images = [], interval = 3500 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
  }, [images.length, interval]);

  // Start auto-play
  useEffect(() => {
    if (images.length === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [images, interval, startTimer]);

  const goPrev = () => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    startTimer(); // restart timer after manual nav
  };

  const goNext = () => {
    setIndex((i) => (i + 1) % images.length);
    startTimer();
  };

  const goTo = (i) => {
    setIndex(i);
    startTimer();
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl w-full aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5]">

      {/* Slides wrapper */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${(index * 100) / images.length}%)`,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 h-full"
            style={{ width: `${100 / images.length}%` }}
          >
            {/* Image */}
            <img
              src={img.src}
              alt={img.alt || `Slide ${i + 1}`}
              className="w-full h-full object-cover object-center bg-gray-100"
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />

            {/* Optional dark overlay for caption readability */}
            {img.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Caption */}
            {img.caption && (
              <div className="absolute left-4 bottom-4 text-white px-4 py-2 max-w-[80%]">
                <p className="text-sm md:text-base font-medium drop-shadow">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prev button */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 z-10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 z-10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "bg-green-500 w-5 h-2"
                : "bg-white/60 hover:bg-white/90 w-2 h-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}