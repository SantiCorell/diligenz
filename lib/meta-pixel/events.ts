"use client";

/**
 * Helpers de dominio Diligenz → eventos Meta.
 * Usa nombres estándar cuando existen; custom cuando aportan segmentación.
 */

import { trackMetaCustomEvent, trackMetaEvent } from "./track";
import type { MetaEventParams, MetaTrackOptions } from "./types";

type RoleLike = "BUYER" | "SELLER" | "PROFESSIONAL" | "ADMIN" | string;

export function trackCompleteRegistration(
  params?: { role?: RoleLike; method?: "email" | "google" | string },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "CompleteRegistration",
    {
      content_name: "account_registration",
      status: true,
      content_category: params?.role,
      registration_method: params?.method ?? "email",
    },
    options
  );
}

export function trackContact(
  params?: { source?: string; type?: string },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "Contact",
    {
      content_name: "contact_form",
      content_category: params?.source ?? "contact",
      contact_type: params?.type,
    },
    options
  );
}

/** Lead genérico: valoración, waitlist, solicitud info, etc. */
export function trackLead(
  params?: MetaEventParams & {
    lead_type?: string;
    value?: number;
    currency?: string;
  },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "Lead",
    {
      content_name: params?.lead_type ?? "lead",
      currency: params?.currency ?? "EUR",
      ...params,
    },
    options
  );
}

export function trackValuationLead(
  params?: { sector?: string; location?: string; value?: number },
  options?: MetaTrackOptions
) {
  return trackLead(
    {
      lead_type: "company_valuation",
      content_category: params?.sector,
      content_name: "valuation_request",
      value: params?.value,
      currency: "EUR",
      location: params?.location,
    },
    options
  );
}

export function trackWaitlistSignup(options?: MetaTrackOptions) {
  trackLead({ lead_type: "waitlist", content_name: "waitlist_signup" }, options);
  return trackMetaCustomEvent("WaitlistSignup", { status: true }, options);
}

export function trackRequestCompanyInfo(
  params: { companyId: string; companyName?: string },
  options?: MetaTrackOptions
) {
  trackLead(
    {
      lead_type: "request_company_info",
      content_name: params.companyName ?? "company_info_request",
      content_ids: [params.companyId],
      content_type: "company",
    },
    options
  );
  return trackMetaCustomEvent(
    "RequestCompanyInfo",
    {
      content_ids: [params.companyId],
      content_name: params.companyName,
      content_type: "company",
    },
    options
  );
}

export function trackViewCompany(
  params: {
    companyId: string;
    companyName?: string;
    sector?: string;
    value?: number;
  },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "ViewContent",
    {
      content_ids: [params.companyId],
      content_name: params.companyName,
      content_type: "company",
      content_category: params.sector,
      currency: "EUR",
      value: params.value,
    },
    options
  );
}

export function trackAddToWishlist(
  params: { companyId: string; companyName?: string },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "AddToWishlist",
    {
      content_ids: [params.companyId],
      content_name: params.companyName,
      content_type: "company",
      currency: "EUR",
    },
    options
  );
}

export function trackLogin(
  params?: { method?: string; role?: RoleLike },
  options?: MetaTrackOptions
) {
  return trackMetaCustomEvent(
    "Login",
    {
      method: params?.method ?? "email",
      content_category: params?.role,
    },
    options
  );
}

export function trackSearch(
  params: { search_string: string; content_category?: string },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "Search",
    {
      search_string: params.search_string,
      content_category: params.content_category,
    },
    options
  );
}

export function trackPurchase(
  params: {
    value: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
  },
  options?: MetaTrackOptions
) {
  return trackMetaEvent(
    "Purchase",
    {
      value: params.value,
      currency: params.currency ?? "EUR",
      content_ids: params.content_ids,
      content_name: params.content_name,
      content_type: "product",
    },
    options
  );
}

/** Atajo genérico por si en el futuro quieres disparar cualquier evento. */
export function trackMeta(
  eventName: string,
  params?: MetaEventParams,
  options?: MetaTrackOptions & { custom?: boolean }
) {
  if (options?.custom) {
    return trackMetaCustomEvent(eventName, params, options);
  }
  return trackMetaEvent(eventName, params, options);
}
