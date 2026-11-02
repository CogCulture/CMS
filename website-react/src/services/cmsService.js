function normalizeAssetPath(item) {
  if (typeof item === 'string') {
    if (item.includes('/_next/image') && item.includes('url=')) {
      const match = item.match(/[?&]url=([^&]+)/);
      if (match && match[1]) {
        item = decodeURIComponent(match[1]);
      }
    }
    if (item.startsWith('/media/')) {
      return item.replace(/^\/media\//, '/');
    }
    return item;
  }
  if (Array.isArray(item)) {
    return item.map(normalizeAssetPath);
  }
  if (item && typeof item === 'object') {
    const normalized = {};
    for (const key of Object.keys(item)) {
      normalized[key] = normalizeAssetPath(item[key]);
    }
    return normalized;
  }
  return item;
}

export async function getSiteContent(isPreview = false) {
  try {
    const mode = isPreview ? "staged" : "published";
    const res = await fetch(`http://127.0.0.1:5000/api/site-content?mode=${mode}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      return normalizeAssetPath(json.data);
    }
  } catch (err) {
    console.warn("CMS service unavailable, falling back to static defaults:", err.message);
  }
  return null;
}
