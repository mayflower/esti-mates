import { useEffect, useState } from "react";

export interface AppConfig {
  brandName: string;
  brandLogoUrl: string;
  brandPrimaryColor: string;
  brandFooterText: string;
}

const defaults: AppConfig = {
  brandName: "Mayflower GmbH",
  brandLogoUrl: "/assets/logo.svg",
  brandPrimaryColor: "#1a73e8",
  brandFooterText: "Part of Mayflower Agile Tools",
};

let cachedConfig: AppConfig | null = null;

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) return;

    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        cachedConfig = { ...defaults, ...data };
        setConfig(cachedConfig);
      })
      .catch(() => {
        cachedConfig = defaults;
        setConfig(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
