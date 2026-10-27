import { ReactLenis } from "lenis/react";
import StickyCards from "@/components/StickyCards/StickyCards";

export default function Home() {
  return (
    <>
      <ReactLenis root />
      <section className="intro">
        <h1>The Foundations</h1>
      </section>

      <StickyCards />

      <section className="outro">
        <h1>Ends in Form</h1>
      </section>
    </>
  );
}
