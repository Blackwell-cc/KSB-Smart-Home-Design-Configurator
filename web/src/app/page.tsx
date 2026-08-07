import Link from "next/link";
import { getLandingContent } from "./landing-content";

export default function HomePage() {
  const content = getLandingContent();

  return (
    <main>
      <p>{content.eyebrow}</p>
      <h1>{content.heading}</h1>
      <p>{content.description}</p>
      <Link href="/configurator">{content.cta}</Link>
    </main>
  );
}
