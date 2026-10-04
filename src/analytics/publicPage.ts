/** Public generated identity excludes request queries, fragments and referrers. */
export function publicPageUrl(): string {
  const fallback = 'https://agent-assembly.com/';
  try {
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) return fallback;
    const url = new URL(canonical.href);
    if (
      url.origin !== 'https://agent-assembly.com' ||
      url.username ||
      url.password
    )
      return fallback;
    return url.origin + url.pathname;
  } catch {
    return fallback;
  }
}

export function publicDestination(raw: string): string {
  try {
    const url = new URL(raw, 'https://agent-assembly.com');
    return url.protocol === 'https:' ? url.origin : '';
  } catch {
    return '';
  }
}
