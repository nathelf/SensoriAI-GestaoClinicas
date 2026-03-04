import { useCallback } from "react";
import { useAuth } from "./useAuth";

const STORAGE_KEY_URL = "sensori_ai_integration_url";
const STORAGE_KEY_NOTIFY = "sensori_ai_integration_notify_on_open";

export function getIntegrationConfig(): { url: string; notifyOnOpen: boolean } {
  try {
    const url = localStorage.getItem(STORAGE_KEY_URL) || "";
    const notify = localStorage.getItem(STORAGE_KEY_NOTIFY);
    return { url: url.trim(), notifyOnOpen: notify === "true" };
  } catch {
    return { url: "", notifyOnOpen: false };
  }
}

export function setIntegrationConfig(url: string, notifyOnOpen: boolean) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_NOTIFY, String(notifyOnOpen));
}

/**
 * Dispara a integração quando o usuário abre a conversa com a Lorena.
 * Útil para conectar chatbot externo ou call center ao sistema.
 */
export function useChatIntegration() {
  const { user, profile } = useAuth();

  const triggerChatOpened = useCallback(() => {
    const sessionId = `sensori-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      event: "chat_opened",
      source: "sensori_ai",
      sessionId,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      displayName: profile?.display_name ?? null,
      clinicName: profile?.clinic_name ?? null,
      timestamp: new Date().toISOString(),
    };

    // Evento customizado para scripts embutidos ou parent window (iframe)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sensori:chatOpened", { detail: payload })
      );
    }

    const { url, notifyOnOpen } = getIntegrationConfig();
    if (!notifyOnOpen || !url) return;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
    }).catch(() => {});
  }, [user?.id, user?.email, profile?.display_name, profile?.clinic_name]);

  return { triggerChatOpened };
}
