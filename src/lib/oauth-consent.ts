import { supabase } from "@/integrations/supabase/client";

export interface AuthorizationDetails {
  client?: { name?: string; client_name?: string; uri?: string };
  redirect_uri?: string;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
}
type Result = { data: AuthorizationDetails | null; error: { message: string } | null };
interface OAuthMethods {
  getAuthorizationDetails(id: string): Promise<Result>;
  approveAuthorization(id: string): Promise<Result>;
  denyAuthorization(id: string): Promise<Result>;
}
// Keep the beta SDK boundary local; all requests still use the managed SDK.
export const oauth = (supabase.auth as unknown as { oauth: OAuthMethods }).oauth;