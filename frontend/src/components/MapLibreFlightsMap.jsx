import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import { cityCoordinates } from "../data/cityCoordinates.js";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCoordinates(city) {
  return cityCoordinates[normalizeText(city)] || null;
}

function segmentsToFeatures(originCity, destinationCity, segments) {
  const normalized = (segments || [])
    .map((segment) => {
      const from = segment.fromCoordinates || getCoordinates(segment.fromCity);
      const to = segment.toCoordinates || getCoordinates(segment.toCity);
      if (!from || !to) return null;
      return {
        type: "Feature",
        properties: {
          fromCity: segment.fromCity,
          toCity: segment.toCity
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [from.lon, from.lat],
            [to.lon, to.lat]
          ]
        }
      };
    })
    .filter(Boolean);

  if (normalized.length) return normalized;

  const from = getCoordinates(originCity);
  const to = getCoordinates(destinationCity);
  if (!from || !to) return [];
  return [
    {
      type: "Feature",
      properties: { fromCity: originCity, toCity: destinationCity },
      geometry: { type: "LineString", coordinates: [[from.lon, from.lat], [to.lon, to.lat]] }
    }
  ];
}

export default function MapLibreFlightsMap({ originCity, destinationCity, segments = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const lineFeatures = useMemo(
    () => segmentsToFeatures(originCity, destinationCity, segments),
    [originCity, destinationCity, segments]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-30, 30],
      zoom: 1.3,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("flight-routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: lineFeatures
        }
      });

      map.addLayer({
        id: "flight-route-line",
        type: "line",
        source: "flight-routes",
        paint: {
          "line-color": "#facc15",
          "line-width": 3,
          "line-opacity": 0.95
        }
      });

      const points = [];
      lineFeatures.forEach((feature) => {
        const [from, to] = feature.geometry.coordinates;
        points.push({
          type: "Feature",
          properties: { label: feature.properties.fromCity },
          geometry: { type: "Point", coordinates: from }
        });
        points.push({
          type: "Feature",
          properties: { label: feature.properties.toCity },
          geometry: { type: "Point", coordinates: to }
        });
      });

      map.addSource("route-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: points }
      });
      map.addLayer({
        id: "route-points-dot",
        type: "circle",
        source: "route-points",
        paint: {
          "circle-radius": 5,
          "circle-color": "#22c55e",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1
        }
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lineFeatures]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("flight-routes")) return;
    map.getSource("flight-routes").setData({
      type: "FeatureCollection",
      features: lineFeatures
    });
    if (map.getSource("route-points")) {
      const points = [];
      lineFeatures.forEach((feature) => {
        const [from, to] = feature.geometry.coordinates;
        points.push({
          type: "Feature",
          properties: { label: feature.properties.fromCity },
          geometry: { type: "Point", coordinates: from }
        });
        points.push({
          type: "Feature",
          properties: { label: feature.properties.toCity },
          geometry: { type: "Point", coordinates: to }
        });
      });
      map.getSource("route-points").setData({
        type: "FeatureCollection",
        features: points
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    lineFeatures.forEach((feature) => {
      feature.geometry.coordinates.forEach((point) => bounds.extend(point));
    });
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 4, duration: 600 });
    }
  }, [lineFeatures]);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Mapa de Trayectos (MapLibre)</h3>
      <div ref={containerRef} className="h-[360px] w-full overflow-hidden rounded-md" />
    </section>
  );
}
