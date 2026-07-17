/**
 * Tipos del Meta Pixel (fbq) y parámetros de eventos estándar.
 * Preparado para deduplicación con Conversion API (eventID).
 */

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe";

/** Eventos custom del dominio Diligenz (trackCustom). */
export type MetaCustomEvent =
  | "Login"
  | "RequestCompanyInfo"
  | "StartValuation"
  | "WaitlistSignup"
  | "RoleSelected";

export type MetaEventName = MetaStandardEvent | MetaCustomEvent | (string & {});

export type MetaContentType = "product" | "product_group" | "company" | string;

export type MetaEventParams = {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: MetaContentType;
  contents?: Array<{ id: string; quantity?: number; item_price?: number }>;
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  status?: boolean | string;
  /** Extra libre para segmentación (role, source, etc.) */
  [key: string]: unknown;
};

export type MetaTrackOptions = {
  /**
   * ID único del evento. Misma ID en Pixel + Conversion API = deduplicación.
   * Si no se pasa, se genera uno.
   */
  eventID?: string;
  /** Si false, no encola para CAPI futura (solo browser). Default true. */
  sendToCapi?: boolean;
};

export type MetaQueuedEvent = {
  eventName: string;
  eventId: string;
  eventTime: number;
  eventSourceUrl?: string;
  params?: MetaEventParams;
  /** user agent / cookies se rellenan en servidor al enviar CAPI */
};

declare global {
  interface Window {
    fbq?: FacebookPixelFunction;
    _fbq?: FacebookPixelFunction;
    __metaPixelInitialized?: boolean;
    __metaPixelPageViewKey?: string;
    /** Cola local para Conversion API (consumir desde /api/meta/conversions). */
    __metaCapiQueue?: MetaQueuedEvent[];
  }
}

type FacebookPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: FacebookPixelFunction;
  loaded?: boolean;
  version?: string;
};

export {};
