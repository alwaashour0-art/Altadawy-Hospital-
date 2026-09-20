"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ResponsivePaperFrame({
  landscape,
  paperRef,
  children,
  className = "",
}: {
  landscape: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(landscape ? 794 : 1123);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = hostRef.current;
        const paper = paperRef.current;
        if (!host) return;

        const baseWidth = landscape ? 1123 : 794;
        const availableWidth = Math.max(280, host.clientWidth);
        // Fill desktop screens, while fitting the complete sheet on phones.
        const maxScale = landscape ? 1.65 : 1.35;
        const nextScale = Math.max(0.2, Math.min(maxScale, availableWidth / baseWidth));
        const contentHeight = paper?.scrollHeight || (landscape ? 794 : 1123);

        setScale(nextScale);
        setScaledHeight(Math.ceil(contentHeight * nextScale));
      });
    };

    update();
    const observer = new ResizeObserver(update);
    if (hostRef.current) observer.observe(hostRef.current);
    if (paperRef.current) observer.observe(paperRef.current);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [landscape, paperRef]);

  const baseWidth = landscape ? 1123 : 794;
  const baseMinHeight = landscape ? 794 : 1123;

  return (
    <div
      ref={hostRef}
      className="paper-preview-host"
      style={{ height: scaledHeight }}
    >
      <div
        className="paper-preview-scale-layer"
        style={{
          width: baseWidth,
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div
          ref={paperRef}
          className={`print-area paper-preview-sheet bg-white shadow-2xl border border-slate-300 rounded-sm ${className}`}
          style={{
            width: baseWidth,
            minHeight: baseMinHeight,
            backgroundColor: "#ffffff",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
