declare global {
  interface Window {
    Neutralino: any;
    NL_OS: string;
    NL_APPID: string;
    NL_PORT: number;
    NL_MODE: string;
    NL_VERSION: string;
    NL_CVERSION: string;
  }

  const Neutralino: any;
  const NL_OS: string;
  const NL_APPID: string;
  const NL_PORT: number;
  const NL_MODE: string;
  const NL_VERSION: string;
  const NL_CVERSION: string;
}

export {};
