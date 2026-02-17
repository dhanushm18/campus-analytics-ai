export function getCompanyLogo(company: any): string | null {
  if (!company) return null;

  const candidates = [
    company.logo_url,
    company.logoUrl,
    company.logo,
    // nested short_json used in some service responses
    company.short_json?.logo_url,
    company.short_json?.logoUrl,
    company.short_json?.logo,
  ];

  for (let raw of candidates) {
    if (!raw) continue;
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Protocol-relative URLs (//example.com/logo.svg)
    if (trimmed.startsWith('//')) return `https:${trimmed}`;

    // Data URIs or absolute URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    // Leading slash — treat as app-relative
    if (trimmed.startsWith('/')) return trimmed;

    // Otherwise, assume it's a filename in `public/` and prefix with '/'
    return `/${trimmed}`;
  }

  return null;
}
