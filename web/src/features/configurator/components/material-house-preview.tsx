"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  buildMaterialPreviewScene,
  type MaterialPreviewConfiguration,
  type MaterialPreviewLayer,
} from "../presentation/material-preview-scene";
import styles from "./material-house-preview.module.css";

type MaterialHousePreviewProps = {
  configuration: MaterialPreviewConfiguration;
  priority?: boolean;
  sizes: string;
  className?: string;
};

function MaterialLayerImage({
  layer,
  sizes,
  className,
  ready,
  onLoad,
  onError,
}: {
  layer: MaterialPreviewLayer;
  sizes: string;
  className: string;
  ready: boolean;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`${styles.layer} ${className}`}
      data-category={layer.category}
      data-option={layer.optionId}
      data-ready={ready ? "true" : "false"}
      data-testid="material-preview-layer"
      fill
      onError={onError}
      onLoad={onLoad}
      sizes={sizes}
      src={layer.src}
    />
  );
}

function CrossfadeMaterialLayer({
  layer,
  sizes,
}: {
  layer?: MaterialPreviewLayer;
  sizes: string;
}) {
  const [current, setCurrent] = useState(layer);
  const [incoming, setIncoming] = useState<MaterialPreviewLayer>();
  const [incomingReady, setIncomingReady] = useState(false);
  const currentSrc = current?.src;
  const layerCategory = layer?.category;
  const layerOptionId = layer?.optionId;
  const layerSrc = layer?.src;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!layerCategory || !layerOptionId || !layerSrc) {
        setCurrent(undefined);
        setIncoming(undefined);
        setIncomingReady(false);
        return;
      }

      const nextLayer = {
        category: layerCategory,
        optionId: layerOptionId,
        src: layerSrc,
      };

      if (!currentSrc) {
        setCurrent(nextLayer);
        return;
      }

      if (layerSrc !== currentSrc) {
        setIncoming(nextLayer);
        setIncomingReady(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentSrc, layerCategory, layerOptionId, layerSrc]);

  useEffect(() => {
    if (!incoming || !incomingReady) return;

    const timer = window.setTimeout(() => {
      setCurrent(incoming);
      setIncoming(undefined);
      setIncomingReady(false);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [incoming, incomingReady]);

  return (
    <>
      {current ? (
        <MaterialLayerImage
          className={styles.currentLayer}
          layer={current}
          ready
          sizes={sizes}
        />
      ) : null}
      {incoming ? (
        <MaterialLayerImage
          className={incomingReady ? styles.incomingLayerReady : styles.incomingLayer}
          layer={incoming}
          onError={() => {
            setIncoming(undefined);
            setIncomingReady(false);
          }}
          onLoad={() => setIncomingReady(true)}
          ready={incomingReady}
          sizes={sizes}
        />
      ) : null}
    </>
  );
}

export function MaterialHousePreview({
  configuration,
  priority = false,
  sizes,
  className,
}: MaterialHousePreviewProps) {
  const scene = buildMaterialPreviewScene(configuration);
  const alt = `${scene.label} ${scene.floors} ชั้น`;

  return (
    <div
      className={[styles.scene, className].filter(Boolean).join(" ")}
      data-available={scene.available}
      data-scene={scene.sceneId}
      data-testid="material-preview-scene"
    >
      <Image
        alt={alt}
        className={styles.base}
        fill
        priority={priority}
        sizes={sizes}
        src={scene.baseSrc}
      />
      {scene.layers.map((layer) => (
        <CrossfadeMaterialLayer key={layer.category} layer={layer} sizes={sizes} />
      ))}
      {scene.featureLayers.map((layer) => (
        <Image
          alt=""
          aria-hidden="true"
          className={styles.featureLayer}
          data-feature={layer.featureId}
          data-testid="special-feature-preview-layer"
          fill
          key={layer.featureId}
          sizes={sizes}
          src={layer.src}
        />
      ))}
      {!scene.available ? (
        <p className={styles.status}>ภาพวัสดุของแบบนี้อยู่ระหว่างจัดเตรียม</p>
      ) : null}
    </div>
  );
}
