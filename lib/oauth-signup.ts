export const OAUTH_SIGNUP_ROLE_COOKIE = "oauth_signup_role";

export const OAUTH_SIGNUP_ROLES = ["SELLER", "BUYER", "PROFESSIONAL"] as const;
export type OAuthSignupRole = (typeof OAUTH_SIGNUP_ROLES)[number];

export function isOAuthSignupRole(value: string | null | undefined): value is OAuthSignupRole {
  return OAUTH_SIGNUP_ROLES.includes(value as OAuthSignupRole);
}

export function dashboardPathForRole(role: string): string {
  if (role === "SELLER") return "/dashboard/seller";
  if (role === "ADMIN") return "/admin";
  return "/dashboard/buyer";
}
