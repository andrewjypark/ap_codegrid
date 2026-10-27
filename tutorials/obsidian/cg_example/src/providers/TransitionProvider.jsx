"use client";
import { useRef, useEffect } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

const ROWS = 4;

export default function TransitionProvider({ children }) {
  const gridRef = useRef(null);
  const blocksRef = useRef([]);
  const headingRef = useRef(null);
  const wordsRef = useRef([]);
  const splitRef = useRef(null);

  useEffect(() => {
    if (!headingRef.current) return;

    splitRef.current = new SplitText(headingRef.current, {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    wordsRef.current = splitRef.current.words;
    gsap.set(wordsRef.current, { y: "100%" });

    return () => splitRef.current?.revert();
  }, []);

  const animateIn = (onComplete) => {
    const tl = gsap.timeline({ onComplete });

    tl.set(gridRef.current, { pointerEvents: "all" });

    tl.set(blocksRef.current, {
      transformOrigin: "left center",
      scaleX: 0,
    });

    tl.set(wordsRef.current, { y: "100%" });

    tl.to(blocksRef.current, {
      scaleX: 1,
      duration: 1,
      ease: "hop",
      stagger: 0.075,
    });

    tl.to(
      wordsRef.current,
      {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      },
      "-=0.6",
    );

    return tl;
  };

  const animateOut = (onComplete) => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(gridRef.current, { pointerEvents: "none" });
        onComplete?.();
      },
    });

    tl.set(blocksRef.current, {
      transformOrigin: "right center",
      scaleX: 1,
    });

    tl.to(wordsRef.current, {
      y: "100%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.1,
    });

    tl.to(
      blocksRef.current,
      {
        scaleX: 0,
        duration: 1,
        ease: "hop",
        stagger: 0.075,
      },
      "-=1",
    );

    return tl;
  };

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        const tl = animateIn(next);
        return () => tl.kill();
      }}
      enter={(next) => {
        const tl = animateOut(next);
        return () => tl.kill();
      }}
    >
      <div ref={gridRef} className="transition-grid">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className="transition-block"
            ref={(el) => (blocksRef.current[i] = el)}
          />
        ))}
      </div>

      <div className="transition-text">
        <h1 ref={headingRef}>Your Brand Name</h1>
      </div>

      {children}
    </TransitionRouter>
  );
}
