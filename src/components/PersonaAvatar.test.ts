import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { hideBrokenPersonaImage } from "../lib/persona-image";
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

describe("hideBrokenPersonaImage", () => {
  it("hides an image that failed before hydration", () => {
    const image = {
      complete: true,
      naturalWidth: 0,
      style: { opacity: "" },
    } as HTMLImageElement;

    hideBrokenPersonaImage(image);

    expect(image.style.opacity).toBe("0");
  });

  it("keeps valid and pending images visible", () => {
    const validImage = {
      complete: true,
      naturalWidth: 320,
      style: { opacity: "" },
    } as HTMLImageElement;
    const pendingImage = {
      complete: false,
      naturalWidth: 0,
      style: { opacity: "" },
    } as HTMLImageElement;

    hideBrokenPersonaImage(validImage);
    hideBrokenPersonaImage(pendingImage);

    expect(validImage.style.opacity).toBe("");
    expect(pendingImage.style.opacity).toBe("");
  });
});
