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
  urls: string[];
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
  urls: types.array(types.string)
});

const QueryModel = types
  .model({
    location: types.maybeNull(types.frozen()),
    results: types.array(BusinessEntryModel)
  })
  .actions(self => ({
    setLocation: flow(function* setLocation(location: LocationLike) {
      self.location = location;

      // Make Contenful query using postcode location as center
      const response: EntryCollection<BusinessEntryFields> = yield client.getEntries<
        BusinessEntryFields
      >({
        content_type: "business",
        "fields.location[within]": `${location.lat},${location.lon},5`
      });

      console.log("Contentful response", response);
      // Map the Contentful entries to BusinessEntryModels
      self.results = response.items
        .filter(({ fields }) => fields.location)
        .map(({ fields }) => ({
          name: fields.name,
          urls: fields.urls
        })) as any;

      // Filter out the businesses without locations, and construct properties to be used
      // for things like tooltips
      const features: Array<{
        coordinates: GeoJSON.Position;
        properties: GeoJSON.GeoJsonProperties;
      }> = [];
      self.results.forEach(({ location, name, urls }) => {
        if (!location) {
          return;
        }
        features.push({
          coordinates: [location.lon, location.lat],
          properties: {
            name,
            urls
          }
        });
      });

      const map = yield getMap();
      const { LngLatBounds, LngLat } = yield import("mapbox-gl");

      // Construct a FeatureCollection and update the map
      const resultsSource = map.getSource("results") as GeoJSONSource;
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

      const bounds = new LngLatBounds(location, location);

      features.forEach(({ coordinates: [lon, lat] }) => {
        bounds.extend(new LngLat(lon, lat));
      });

      map.fitBounds(bounds, { padding: 64, maxZoom: 12 });
    })
  }));

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
