// needs to be a client component because we're reaching into the dom and running animations on it.
"use client";
import { useRef, useEffect } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
// plugin called CustomEase lets us use custom eases instead of built in ones
import CustomEase from "gsap/CustomEase";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(CustomEase, SplitText);
// creating a curve called hop. this gives a much sharper motion than something like power 4. it accelerates hard and then brakes hard.
CustomEase.create("hop", "0.9, 0, 0.1, 1");

const ROWS = 4;

export default function TransitionProvider({ children }) {
  // gridRef points to container that holds all our blocks.
  const gridRef = useRef(null);
  // blocksRef starts as an array and will store every individual block. 
  // keeping these in Refs means GSAP can target them directly without react getting in the way.
  const blocksRef = useRef([]);

  // the heading, words, split refs are for the words inbetween the block animations
  const headingRef = useRef(null);
  const wordsRef = useRef([]);
  const splitRef = useRef(null);

  // creating a new splittext instance. this is my first time seeing useEffect.
  useEffect(() => {
    if (!headingRef.current) return;

    splitRef.current = new SplitText(headingRef.current, {
      type: "words",
      wordsClass: "word",
      // mask tells splittext to wrap every word in its own container with overflow hidden.
      mask: "words",
    });

    wordsRef.current = splitRef.current.words;
    gsap.set(wordsRef.current, { y: "100%" });

    // this cleanup function reverts the split which stops us from accidently splitting the same heading twice on a refresh.
    return () => splitRef.current?.revert();
  }, []);

  const animateIn = (onComplete) => {
    // creating a timeline that passes the callback straight into it so timeline passes it automatically the moment the animation finishes.
    const tl = gsap.timeline({ onComplete });

    tl.set(gridRef.current, { pointerEvents: "all" });

    // first set transform origin on every block to the left and reset the scale on x-axis back to 0.
    tl.set(blocksRef.current, {
      transformOrigin: "left center", 
      scaleX: 0,
    });

    tl.set(wordsRef.current, { y: "100%" });

    // then animate all four blocks to scale of one
    tl.to(blocksRef.current, {
      scaleX: 1,
      duration: 1,
      ease: "hop",
      stagger: 0.075,
    });

    // setting the words to their hidden position. The words get power4.out so they rise quick and settle soft
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

    // for animateOut, the transform origin is set to the right.
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

  // Now going to put both the animateIn and animateOut into the transitionRouter, passing in the next function directly. Also return a cleanup function that stops the timeline if animation needs to stop early
  return (
    <TransitionRouter
      leave={(next) => {
        const tl = animateIn(next);
        return () => tl.kill();
      }}
      enter={(next) => {
        const tl = animateOut(next);
        return () => tl.kill();
      }}
    >
      {/** this renders the blocks. We're attaching the gridRef to it.
       * we're going to loop over our row count and return a block for each one with the transition block class and a ref element that pushes each element into the blocks array. And that is the entire grid.
       * Because we set flex to one on the block class earlier, they automatically split the container height evenly between them, no matter what size the screen is. 
       */}
      <div ref={gridRef} className="transition-grid">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className="transition-block"
            ref={(el) => (blocksRef.current[i] = el)}
          />
        ))}
      </div>

      {/** This is the transition text. the class makes it take the full screen. */}        
      <div className="transition-text">
        <h1 ref={headingRef}>Your Brand Name</h1>
      </div>

      {children}
    </TransitionRouter>
  );
}
