import { Box } from "@material-ui/core";
import { autorun } from "mobx";
import React, { useEffect } from "react";
import { useStore } from "../store";

export const accessToken =
  "pk.eyJ1IjoibWJmaXNoZXIiLCJhIjoiY2p4ejR4eWVrMDBzeTNsbWNrbzZwbGVycCJ9.1W4vzrsez8evMEBuK8I5Vw";

declare global {
  interface Window {
    _map: mapboxgl.Map;
  }
}

export const getMap = async (): Promise<mapboxgl.Map> => {
  if (window._map) {
    return window._map;
  }

  const mapboxgl = await import("mapbox-gl");

  const map = (window._map = new mapboxgl.Map({
    accessToken,
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    // center: [-0.12162133142464882, 51.47422045369717],
    // zoom: 8,
    bounds: [
      [-0.5469982235132989, 51.2560072093797],
      [0.30375556066678655, 51.69139483020936]
    ]
  }));

  map.on("load", () => {
    map.addSource("results", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });

    map.addLayer({
      id: "results-markers",
      type: "symbol",
      source: "results",
      layout: {
        "icon-image": "grocery-15",
        "icon-size": 1.25,
        "icon-allow-overlap": true
      }
    });

    map.on("click", "results-markers", function(e) {
      if (!e.features) {
        return;
      }

      const features = e.features as Array<GeoJSON.Feature<GeoJSON.Point>>;
      const [lon, lat] = features[0].geometry.coordinates;
      const properties = features[0].properties!;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      // }

      let html = properties.url
        ? `<p><a href="${properties.url}" target="_blank">${properties.name}</a></p>`
        : properties.name;
      if (properties.description) {
        html += `<p>${properties.description}</p>`;
      }

      new mapboxgl.Popup()
        .setLngLat([lon, lat])
        .setHTML(html)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on("mouseenter", "places", function() {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "places", function() {
      map.getCanvas().style.cursor = "";
    });
  });

  return map;
};

interface MapProps {
  className?: string;
}

export const Map: React.ComponentType<MapProps> = ({ className }) => {
  const { query } = useStore();

  useEffect(() => {
    async function renderMap() {
      (await getMap()).on("load", () => query.showBusinessesOnMap());
    }
    renderMap();
  }, []);

  // const location = useObserver(() => query.location);

  useEffect(
    () =>
      autorun(() => {
        console.log("Map", "query.location", query.location);
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <Box id="map" className={className} />;
};
