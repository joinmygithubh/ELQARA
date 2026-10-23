/**
 * ELQARA Image URL Normalization & Optimization Engine
 *
 * Provides centralized URL resolution, format negotiation (WebP/AVIF auto),
 * responsive scaling (Cloudinary / Unsplash / Local variants), and fail-safe
 * image error fallback handling with infinite loop prevention.
 */

export const FALLBACK_PRODUCT_IMAGE = '/placeholder-product.svg';
export const FALLBACK_LOGO_ICON = '/logo-icon.svg';

/**
 * Optimizes an Unsplash URL by setting exact dimensions and compression quality.
 * Prevents downloading 1000px+ images for 300px product cards.
 */
function optimizeUnsplashUrl(url, { width = 450, quality = 75 } = {}) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('w', String(width));
    urlObj.searchParams.set('q', String(quality));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Optimizes a Cloudinary URL by injecting f_auto,q_auto,w_${width},c_limit.
 * Cloudinary will automatically negotiate modern AVIF/WebP based on client browser headers.
 */
function optimizeCloudinaryUrl(url, { width = 450 } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/upload/')) return url;
  if (url.includes('f_auto') && url.includes(`w_${width}`)) return url;

  // Insert transformation parameters right after /upload/
  const transform = `f_auto,q_auto,w_${width},c_limit`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

/**
 * Normalizes and optimizes local /uploads/... URLs.
 * Automatically prefers lightweight WebP variants and thumbnails when available.
 */
function optimizeLocalUploadUrl(pathStr, { width = 450, isThumbnail = false } = {}) {
  let normalized = pathStr.startsWith('/') ? pathStr : `/${pathStr}`;

  // If width is for thumbnail/card (<= 500px) or isThumbnail requested
  if (isThumbnail || width <= 500) {
    // 1. Check for product folder catalog format: /uploads/products/<slug>/(main.jpg|main-full.webp) -> main-thumb.webp
    if (normalized.includes('/uploads/products/') && (normalized.endsWith('/main.jpg') || normalized.endsWith('/main-full.webp'))) {
      return normalized.replace(/\/(main\.jpg|main-full\.webp)$/, '/main-thumb.webp');
    }
    // 2. Check for root upload format: /uploads/prod-<name>.(jpg|webp) -> prod-<name>-thumb.webp
    if (normalized.match(/\/uploads\/prod-[^/]+(\.jpg|\.webp)$/) && !normalized.includes('-thumb.webp')) {
      return normalized.replace(/(\.jpg|\.webp)$/, '-thumb.webp');
    }
  }

  // For larger views (e.g. product details or width > 500px), prefer full-res WebP if available
  if (normalized.includes('/uploads/products/') && normalized.endsWith('/main.jpg')) {
    return normalized.replace('/main.jpg', '/main-full.webp');
  }
  if (normalized.match(/\/uploads\/prod-[^/]+\.jpg$/)) {
    return normalized.replace(/\.jpg$/, '.webp');
  }
  if (normalized.match(/\/uploads\/hero-(?:slide-\d+|reference)\.jpg$/)) {
    return normalized.replace(/\.jpg$/, '.webp');
  }

  return normalized;
}

/**
 * Master Image URL Normalizer & Scaler.
 *
 * @param {string} rawUrl - The input image URL or relative path
 * @param {object} options
 * @param {number} [options.width=450] - Desired display width in px
 * @param {number} [options.quality=75] - Desired compression quality (for CDN services)
 * @param {boolean} [options.isThumbnail=false] - Hint to select compact thumbnail variant
 * @param {string} [options.fallback=FALLBACK_PRODUCT_IMAGE] - Fallback when url is absent
 * @returns {string} - Optimized, safe URL
 */
export function getOptimizedImageUrl(rawUrl, options = {}) {
  const {
    width = 450,
    quality = 75,
    isThumbnail = false,
    fallback = FALLBACK_PRODUCT_IMAGE
  } = options;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return fallback;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return fallback;
  }

  // 1. Data URLs (base64 inline) - return as-is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // 2. Cloudinary URLs
  if (trimmed.startsWith('https://res.cloudinary.com/') || trimmed.startsWith('http://res.cloudinary.com/')) {
    return optimizeCloudinaryUrl(trimmed, { width });
  }

  // 3. Unsplash URLs
  if (trimmed.includes('images.unsplash.com')) {
    return optimizeUnsplashUrl(trimmed, { width, quality });
  }

  // 4. Other absolute HTTP/HTTPS URLs - return as-is without double prefixing
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 5. Local /uploads/ paths
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return optimizeLocalUploadUrl(trimmed, { width, isThumbnail });
  }

  // 6. Generic application-hosted assets (e.g. /assets/..., /logo-icon.svg)
  const assetPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (assetPath === '/assets/elqara-logo.jpg') {
    return '/assets/elqara-logo.webp';
  }
  return assetPath;
}

/**
 * Returns the best image URL for a product object, checking thumbnail,
 * images array, and selecting appropriate thumbnail/card variants.
 *
 * @param {object} product - Product data object
 * @param {object} options - Sizing and fallback options
 * @returns {string}
 */
export function getProductImageUrl(product, options = {}) {
  if (!product) return options.fallback || FALLBACK_PRODUCT_IMAGE;

  // 1. Check if product already has a WebP variant in images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const webpVariant = product.images.find(
      (img) => typeof img === 'string' && img.toLowerCase().endsWith('.webp')
    );
    // If a WebP variant exists and thumbnail is JPG or not set, prefer the WebP variant
    if (webpVariant && (!product.thumbnail || product.thumbnail.endsWith('.jpg'))) {
      return getOptimizedImageUrl(webpVariant, options);
    }
  }

  // 2. Check thumbnail or primary image
  const primary = product.thumbnail || (Array.isArray(product.images) && product.images[0]) || '';
  return getOptimizedImageUrl(primary, options);
}

/**
 * Generates responsive srcSet string for modern browsers.
 *
 * @param {string} rawUrl - Image URL
 * @param {number[]} [widths=[360, 640]] - Desired srcset breakpoints
 * @returns {string} - e.g. "url1 360w, url2 640w"
 */
export function getImageSrcSet(rawUrl, widths = [360, 640]) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (rawUrl.startsWith('data:')) return '';

  return widths
    .map((w) => `${getOptimizedImageUrl(rawUrl, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Resilient image error handler.
 * Replaces broken images with a guaranteed local fallback SVG without infinite retry loops.
 *
 * @param {Event} event - React image onError event
 * @param {string} [fallback=FALLBACK_PRODUCT_IMAGE] - Guaranteed fallback URL
 */
export function handleImageError(event, fallback = FALLBACK_PRODUCT_IMAGE) {
  if (!event || !event.currentTarget) return;
  const target = event.currentTarget;

  // Guard against infinite loop if fallback itself encounters an issue
  if (target.dataset.fallbackApplied) {
    return;
  }

  target.dataset.fallbackApplied = 'true';
  target.onerror = null; // Detach DOM error listener
  target.src = fallback;
}
