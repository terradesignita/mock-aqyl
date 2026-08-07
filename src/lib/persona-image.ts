export function hideBrokenPersonaImage(image: HTMLImageElement | null): void {
  if (image?.complete && image.naturalWidth === 0) {
    image.style.opacity = "0";
  }
}
