import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonaAvatar } from "./PersonaAvatar";

describe("PersonaAvatar", () => {
  it("renders a portrait and a stable silhouette fallback", () => {
    const html = renderToStaticMarkup(
      createElement(PersonaAvatar, {
        initials: "EM",
        src: "/personas/elon-musk.webp",
        alt: "Илон Маск",
      }),
    );

    expect(html).toContain('src="/personas/elon-musk.webp"');
    expect(html).toContain('alt="Илон Маск"');
    expect(html).toContain('data-avatar-fallback="true"');
  });

  it("keeps an accessible name when no portrait is supplied", () => {
    const html = renderToStaticMarkup(
      createElement(PersonaAvatar, { initials: "EM", alt: "Илон Маск" }),
    );

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Илон Маск"');
    expect(html).not.toContain("<img");
  });
});
