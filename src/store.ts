import { createClient, EntryCollection, EntryFields } from "contentful";
import { GeoJSONSource } from "mapbox-gl";
import { flow, types } from "mobx-state-tree";
import React, { useContext } from "react";
import { getMap } from "../components/Map";

const spaceId = "dzl67q6mcfj7";
const apiKey = "UX3to0-Tfj-niuY877m9wwD9MCCOBbOzdESp5WDptBY";

const client = createClient({
  space: spaceId,
  accessToken: apiKey
});

interface BusinessEntryFields {
  name: string;
  location: EntryFields.Location | undefined;
  url: string[];
  description?: string;
}

interface LocationLike {
  lat: number;
  lon: number;
}
const LocationModel = types.model({
  lat: types.number,
  lon: types.number
});

const BusinessEntryModel = types.model({
  name: types.string,
  location: types.maybe(LocationModel),
  url: types.array(types.string),
  description: types.maybe(types.string)
});

const QueryModel = types
  .model({
    location: types.maybeNull(types.frozen()),
    results: types.array(BusinessEntryModel)
  })
  .actions(self => {
    const showBusinessesOnMap = flow(function* showBusinessesOnMap(
      query: object = {}
    ) {
      // Make Contenful query using postcode location as center
      const response: EntryCollection<BusinessEntryFields> = yield client.getEntries<
        BusinessEntryFields
      >({
        content_type: "business",
        ...query
      });

      console.log("Contentful response", query, response);
      // Map the Contentful entries to BusinessEntryModels
      const results = response.items
        .filter(({ fields }) => fields.location)
        .map(({ fields }) => ({
          name: fields.name,
          url: fields.url && fields.url.length ? fields.url[0] : null,
          location: fields.location,
          description: fields.description
        })) as any;

      // Filter out the businesses without locations, and construct properties to be used
      // for things like tooltips
      const features: Array<{
        coordinates: GeoJSON.Position;
        properties: GeoJSON.GeoJsonProperties;
      }> = [];

      results.forEach(({ location, name, url, description }) => {
        if (!location) {
          return;
        }
        features.push({
          coordinates: [location.lon, location.lat],
          properties: {
            name,
            url,
            description
          }
        });
      });

      const map = yield getMap();

      // Construct a FeatureCollection and update the map
      const resultsSource = map.getSource("results") as GeoJSONSource;
      console.log("Mapbox data", {
        type: "FeatureCollection",
        features: features.map(({ coordinates, properties }) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates
          },
          properties
        }))
      });
      resultsSource.setData({
        type: "FeatureCollection",
        features: features.map(({ coordinates, properties }) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates
          },
          properties
        }))
      });

      return features;
    });

    const setLocation = flow(function* setLocation(location: LocationLike) {
      self.location = location;

      const features = yield showBusinessesOnMap({
        "fields.location[within]": `${location.lat},${location.lon},5`
      });

      const { LngLatBounds, LngLat } = yield import("mapbox-gl");
      const bounds = new LngLatBounds(location, location);

      features.forEach(({ coordinates: [lon, lat] }) => {
        bounds.extend(new LngLat(lon, lat));
      });

      const map = yield getMap();
      map.fitBounds(bounds, { padding: 64, maxZoom: 12 });
    });

    return { showBusinessesOnMap, setLocation };
  });

const StoreModel = types.model({
  query: QueryModel
});

type Store = typeof StoreModel.Type;

export const StoreContext = React.createContext<Store | null>(null);

export const useStore: () => Store = () => {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("No store");
  }

  return store;
};

export const createRootStore = () =>
  StoreModel.create({
    query: {
      location: null,
      results: []
    }
  });
