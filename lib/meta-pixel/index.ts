/**
 * Meta Pixel — API pública del cliente.
 *
 * Uso típico:
 *   import { trackLead, trackCompleteRegistration } from "@/lib/meta-pixel";
 *
 * Conversion API (futuro):
 *   Los eventos se encolan en window.__metaCapiQueue con eventId
 *   para deduplicar contra /api/meta/conversions.
 */

export { META_PIXEL_ID, META_CAPI_ENDPOINT, isMetaPixelConfigured } from "./config";
export {
  createMetaEventId,
  initMetaPixel,
  trackPageView,
  trackMetaEvent,
  trackMetaCustomEvent,
} from "./track";
export {
  trackCompleteRegistration,
  trackContact,
  trackLead,
  trackValuationLead,
  trackWaitlistSignup,
  trackRequestCompanyInfo,
  trackViewCompany,
  trackAddToWishlist,
  trackLogin,
  trackSearch,
  trackPurchase,
  trackMeta,
} from "./events";
export type {
  MetaStandardEvent,
  MetaCustomEvent,
  MetaEventName,
  MetaEventParams,
  MetaTrackOptions,
  MetaQueuedEvent,
} from "./types";
