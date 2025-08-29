// Utility to paint SVG by ids
export function paintSvgByIds(rawSvg: string, ids: string[], color: string = '#2196F3'): string {
  function applyFill(el: Element) {
    const style = el.getAttribute('style');
    if (style) {
      const cleaned = style.replace(/fill\s*:\s*[^;]+;?/g, '');
      if (cleaned.trim()) {
        el.setAttribute('style', cleaned);
      } else {
        el.removeAttribute('style');
      }
    }
    el.setAttribute('fill', color);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');

  // For each id, set fill on all descendant drawables
  ids.forEach(id => {
    const el = doc.getElementById(id);
    if (!el) return;
    // Set fill on the group itself
    applyFill(el);
    // Set fill on all descendant drawables
    el.querySelectorAll('path, rect, ellipse, circle').forEach(applyFill);
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}
