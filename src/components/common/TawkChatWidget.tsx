"use client";

import { useEffect } from "react";

interface TawkChatWidgetProps {
  propertyId?: string | null;
  widgetId?: string | null;
}

export default function TawkChatWidget({ propertyId, widgetId }: TawkChatWidgetProps) {
  useEffect(() => {
    if (!propertyId || !widgetId) return;

    // Load Tawk.to Script dynamically
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    return () => {
      s1.remove();
    };
  }, [propertyId, widgetId]);

  return null;
}
