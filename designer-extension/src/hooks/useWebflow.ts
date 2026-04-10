import { useState, useEffect, useCallback } from "react";

interface ElementInfo {
  id: string;
  type: string;
  tagName?: string;
}

export function useWebflow() {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [isDesignerReady, setIsDesignerReady] = useState(false);

  useEffect(() => {
    // Check if we're running inside the Webflow Designer
    if (typeof webflow !== "undefined") {
      setIsDesignerReady(true);

      const unsubscribe = webflow.subscribe("selectedelement", (element) => {
        if (element) {
          setSelectedElement({
            id: element.id,
            type: element.type,
            tagName: "tagName" in element ? (element.tagName as string) : undefined,
          });
        } else {
          setSelectedElement(null);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  const notify = useCallback(
    (message: string, type: "Info" | "Error" = "Info") => {
      if (isDesignerReady) {
        webflow.notify({ type, message });
      }
    },
    [isDesignerReady]
  );

  const setElementAttribute = useCallback(
    async (elementId: string, name: string, value: string) => {
      if (!isDesignerReady) return;
      const el = await webflow.getSelectedElement();
      if (el && el.id === elementId) {
        await el.setCustomAttribute(name, value);
      }
    },
    [isDesignerReady]
  );

  const getAllPages = useCallback(async () => {
    if (!isDesignerReady) return [];
    const pages = await webflow.getAllPages();
    return pages.map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }, [isDesignerReady]);

  return {
    isDesignerReady,
    selectedElement,
    notify,
    setElementAttribute,
    getAllPages,
  };
}
