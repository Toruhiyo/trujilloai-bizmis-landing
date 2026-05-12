/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_CONTACT_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_WAITLIST_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_PUBLIC_BASE_URL: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_BIZMIS_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
