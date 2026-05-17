/* eslint-disable react-refresh/only-export-components */
import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Loader2, Locate, Maximize, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const MapContext = createContext(null);
const MarkerContext = createContext(null);

function getDocumentTheme() {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useResolvedTheme(themeProp) {
  const [detectedTheme, setDetectedTheme] = useState(
    () => getDocumentTheme() ?? getSystemTheme(),
  );

  useEffect(() => {
    if (themeProp) return undefined;

    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event) => {
      if (!getDocumentTheme()) {
        setDetectedTheme(event.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

function getViewport(map) {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const Map = forwardRef(function Map(
  {
    children,
    className,
    theme: themeProp,
    styles,
    projection,
    viewport,
    onViewportChange,
    loading = false,
    ...props
  },
  ref,
) {
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef(null);
  const styleTimeoutRef = useRef(null);
  const onViewportChangeRef = useRef(onViewportChange);
  const resolvedTheme = useResolvedTheme(themeProp);

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles],
  );

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  // MapLibre owns this lifecycle; prop changes are synchronized in dedicated effects.
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });

    const forceRender = () => {
      map.resize();
      map.triggerRepaint();
    };

    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) map.setProjection(projection);
        forceRender();
      }, 100);
    };
    const loadHandler = () => {
      setIsLoaded(true);
      forceRender();
    };
    const handleMove = () => onViewportChangeRef.current?.(getViewport(map));

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);

    const resizeFrame = requestAnimationFrame(() => {
      forceRender();
      requestAnimationFrame(forceRender);
    });
    const resizeTimers = [120, 350, 800, 1500].map((delay) =>
      window.setTimeout(forceRender, delay),
    );
    const resizeObserver = new ResizeObserver(forceRender);
    resizeObserver.observe(containerRef.current);
    map.on("idle", forceRender);

    return () => {
      cancelAnimationFrame(resizeFrame);
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver.disconnect();
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.off("idle", forceRender);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !viewport) return;
    if (mapInstance.isMoving()) return;
    mapInstance.jumpTo(viewport);
  }, [mapInstance, viewport]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;

    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;

    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <div ref={containerRef} className="absolute inset-0" />
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

function MapMarker({
  longitude,
  latitude,
  children,
  draggable = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  ...markerOptions
}) {
  const { map } = useMap();
  const [marker] = useState(
    () =>
      new MapLibreGL.Marker({
        ...markerOptions,
        element: document.createElement("div"),
        draggable,
      }).setLngLat([longitude, latitude]),
  );

  useEffect(() => {
    if (!map) return undefined;
    marker.addTo(map);
    return () => marker.remove();
  }, [map, marker]);

  useEffect(() => {
    const element = marker.getElement();
    if (onClick) element.addEventListener("click", onClick);
    if (onMouseEnter) element.addEventListener("mouseenter", onMouseEnter);
    if (onMouseLeave) element.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (onClick) element.removeEventListener("click", onClick);
      if (onMouseEnter) element.removeEventListener("mouseenter", onMouseEnter);
      if (onMouseLeave) element.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [marker, onClick, onMouseEnter, onMouseLeave]);

  useEffect(() => {
    const handleDragStart = () => {
      const lngLat = marker.getLngLat();
      onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = marker.getLngLat();
      onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = marker.getLngLat();
      onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };

    marker.on("dragstart", handleDragStart);
    marker.on("drag", handleDrag);
    marker.on("dragend", handleDragEnd);

    return () => {
      marker.off("dragstart", handleDragStart);
      marker.off("drag", handleDrag);
      marker.off("dragend", handleDragEnd);
    };
  }, [marker, onDrag, onDragEnd, onDragStart]);

  marker.setLngLat([longitude, latitude]);
  marker.setDraggable(draggable);

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

function MarkerContent({ children, className }) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative flex items-center justify-center", className)}>
      {children || (
        <div className="h-4 w-4 rounded-full border-2 border-white bg-primary shadow-lg" />
      )}
    </div>,
    marker.getElement(),
  );
}

function MarkerPopup({ children, className, ...popupOptions }) {
  const { marker, map } = useMarkerContext();
  const [container] = useState(() => document.createElement("div"));
  const [popup] = useState(
    () =>
      new MapLibreGL.Popup({
        offset: 16,
        closeButton: false,
        ...popupOptions,
      })
        .setMaxWidth("none")
        .setDOMContent(container),
  );

  useEffect(() => {
    if (!map) return undefined;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => marker.setPopup(null);
  }, [map, marker, popup, container]);

  return createPortal(
    <div
      className={cn(
        "rounded-md border bg-popover p-3 text-popover-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

function MarkerTooltip({ children, className, ...popupOptions }) {
  const { marker, map } = useMarkerContext();
  const [container] = useState(() => document.createElement("div"));
  const [tooltip] = useState(
    () =>
      new MapLibreGL.Popup({
        offset: 16,
        closeButton: false,
        closeOnClick: false,
        ...popupOptions,
      })
        .setMaxWidth("none")
        .setDOMContent(container),
  );

  useEffect(() => {
    if (!map) return undefined;
    const show = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const hide = () => tooltip.remove();
    const element = marker.getElement();
    element.addEventListener("mouseenter", show);
    element.addEventListener("mouseleave", hide);
    return () => {
      element.removeEventListener("mouseenter", show);
      element.removeEventListener("mouseleave", hide);
      tooltip.remove();
    };
  }, [map, marker, tooltip]);

  return createPortal(
    <div
      className={cn(
        "rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

const controlPositions = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-8 left-2",
  "bottom-right": "bottom-8 right-2",
};

function ControlButton({ label, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center border-b border-border bg-background text-foreground shadow-sm transition-colors last:border-b-0 hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setWaitingForLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        map?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1200,
        });
        onLocate?.(coords);
        setWaitingForLocation(false);
      },
      () => setWaitingForLocation(false),
    );
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  return (
    <div
      className={cn(
        "absolute z-10 overflow-hidden rounded-md border border-border",
        controlPositions[position],
        className,
      )}
    >
      {showZoom && (
        <>
          <ControlButton label="Phóng to" onClick={handleZoomIn}>
            <Plus className="h-4 w-4" />
          </ControlButton>
          <ControlButton label="Thu nhỏ" onClick={handleZoomOut}>
            <Minus className="h-4 w-4" />
          </ControlButton>
        </>
      )}
      {showCompass && (
        <ControlButton label="Đặt lại hướng" onClick={() => map?.resetNorthPitch()}>
          <Locate className="h-4 w-4 rotate-45" />
        </ControlButton>
      )}
      {showLocate && (
        <ControlButton
          label="Vị trí của tôi"
          onClick={handleLocate}
          disabled={waitingForLocation}
        >
          {waitingForLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </ControlButton>
      )}
      {showFullscreen && (
        <ControlButton label="Toàn màn hình" onClick={handleFullscreen}>
          <Maximize className="h-4 w-4" />
        </ControlButton>
      )}
    </div>
  );
}

export {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  useMap,
};
