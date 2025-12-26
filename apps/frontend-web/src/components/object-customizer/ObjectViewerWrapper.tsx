import React, { useRef, useEffect } from "react";
import ObjectViewer from "@/lib/ObjectViewer";
import { CustomizationConfig } from "./ConfigType";

export default function ObjectViewerWrapper({
  modelName, scale, autoRotate, autoRotateSpeed, configs
}: {
  modelName: string,
  scale?: number,
  autoRotate?: boolean,
  autoRotateSpeed?: number,
  configs: CustomizationConfig[]
}
) {
  // containerRef will hold the div element
  const containerRef = useRef<HTMLDivElement | null>(null);

  // viewerRef will hold the ObjectViewer instance
  const viewerRef = useRef<ObjectViewer | null>(null);

  // init
  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new ObjectViewer(containerRef.current, {
        modelName, scale, autoRotate, autoRotateSpeed
      });
    }

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  // handle scale update
  useEffect(() => {
    if (scale === undefined) return;

    if (viewerRef.current) {
      viewerRef.current.updateScale(scale);
    }
  }, [scale])

  // handle customization configurations
  useEffect(() => {
    if (viewerRef.current) {
      for (const config of configs)
      {
        switch (config?.type) {
          case "color":
            viewerRef.current.applyColor(config.partName, config.value);
            break;
  
          case "texture":
            viewerRef.current.applyTextureByUrl(config.partName, config.value);
            break;
  
          case "sticker":
            viewerRef.current.applyTextureByUrl(config.partName, config.value, true);
            break;

          case "sticker-size":
            viewerRef.current.setTextureSize(config.partName, Number(config.value));
            break;

          case "sticker-position":
            viewerRef.current.setTextureOffset(config.partName, Number(config.value));
            break;
        }
      }
    }

  }, [configs])

  // handle window resize
  useEffect(() => {
    if (!viewerRef.current) return;

    const el = viewerRef.current.container;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      viewerRef.current?.onCanvasResize();
    });

    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
