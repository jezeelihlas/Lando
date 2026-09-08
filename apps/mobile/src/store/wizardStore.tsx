import {
  LandCondition,
  LandExtentUnit,
  NearbyPlaceType,
  PropertyNearbyPlaceDto,
  PropertyType,
  RoadAccess,
  RoadWidthUnit,
  SellerPropertyDto,
  SellerPropertyImageDto,
} from "@lando/shared";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createProperty, updateProperty } from "../api/properties";
import { useAuth } from "./authStore";

interface WizardState {
  propertyId: string | null;
  type: PropertyType | null;
  images: SellerPropertyImageDto[];
  roadWidth: string;
  roadWidthUnit: RoadWidthUnit;
  roadAccess: RoadAccess | null;
  landCondition: LandCondition | null;
  landExtent: string;
  landExtentUnit: LandExtentUnit;
  selectedNearbyTypes: NearbyPlaceType[];
  nearbyPlaceSelections: PropertyNearbyPlaceDto[];
  deedUploaded: boolean;
  price: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  locationDisplayName: string | null;
  contactPhoneNumber: string;
}

const initialState: WizardState = {
  propertyId: null,
  type: null,
  images: [],
  roadWidth: "",
  roadWidthUnit: "FEET",
  roadAccess: null,
  landCondition: null,
  landExtent: "",
  landExtentUnit: "PERCHES",
  selectedNearbyTypes: [],
  nearbyPlaceSelections: [],
  deedUploaded: false,
  price: "",
  description: "",
  latitude: null,
  longitude: null,
  locationDisplayName: null,
  contactPhoneNumber: "",
};

interface WizardContextValue extends WizardState {
  startNewDraft: (type: PropertyType) => Promise<string>;
  loadExistingDraft: (property: SellerPropertyDto) => void;
  patch: (partial: Partial<Omit<WizardState, "propertyId" | "images" | "nearbyPlaceSelections">>) => Promise<void>;
  setImages: (images: SellerPropertyImageDto[]) => void;
  setSelectedNearbyTypes: (types: NearbyPlaceType[]) => void;
  setNearbyPlaceSelections: (selections: PropertyNearbyPlaceDto[]) => void;
  setDeedUploaded: (uploaded: boolean) => void;
  setLocation: (latitude: number, longitude: number, displayName: string | null) => Promise<void>;
  reset: () => void;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [state, setState] = useState<WizardState>(initialState);

  const startNewDraft = useCallback(
    async (type: PropertyType) => {
      if (!accessToken) throw new Error("Not authenticated");
      const property = await createProperty(accessToken, type);
      setState({ ...initialState, propertyId: property.id, type });
      return property.id;
    },
    [accessToken]
  );

  const loadExistingDraft = useCallback((property: SellerPropertyDto) => {
    setState({
      propertyId: property.id,
      type: property.type,
      images: property.images ?? [],
      roadWidth: property.roadWidth ?? "",
      roadWidthUnit: property.roadWidthUnit,
      roadAccess: property.roadAccess,
      landCondition: property.landCondition,
      landExtent: property.landExtent ?? "",
      landExtentUnit: property.landExtentUnit,
      selectedNearbyTypes: [],
      nearbyPlaceSelections: [],
      deedUploaded: false,
      price: property.price ?? "",
      description: property.description ?? "",
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null,
      locationDisplayName: null,
      contactPhoneNumber: property.contactPhoneNumber ?? "",
    });
  }, []);

  const patch = useCallback(
    async (partial: Partial<Omit<WizardState, "propertyId" | "images" | "nearbyPlaceSelections">>) => {
      if (!accessToken || !state.propertyId) throw new Error("No active draft");
      setState((prev) => ({ ...prev, ...partial }));

      const body: Record<string, unknown> = {};
      if (partial.roadWidth !== undefined && partial.roadWidth !== "") body.roadWidth = Number(partial.roadWidth);
      if (partial.roadWidthUnit !== undefined) body.roadWidthUnit = partial.roadWidthUnit;
      if (partial.roadAccess !== undefined && partial.roadAccess !== null) body.roadAccess = partial.roadAccess;
      if (partial.landCondition !== undefined && partial.landCondition !== null)
        body.landCondition = partial.landCondition;
      if (partial.landExtent !== undefined && partial.landExtent !== "") body.landExtent = Number(partial.landExtent);
      if (partial.landExtentUnit !== undefined) body.landExtentUnit = partial.landExtentUnit;
      if (partial.price !== undefined && partial.price !== "") body.price = Number(partial.price);
      if (partial.description !== undefined && partial.description !== "") body.description = partial.description;
      if (partial.contactPhoneNumber !== undefined && partial.contactPhoneNumber !== "")
        body.contactPhoneNumber = partial.contactPhoneNumber;

      if (Object.keys(body).length > 0) {
        await updateProperty(accessToken, state.propertyId, body);
      }
    },
    [accessToken, state.propertyId]
  );

  const setLocation = useCallback(
    async (latitude: number, longitude: number, displayName: string | null) => {
      if (!accessToken || !state.propertyId) throw new Error("No active draft");
      setState((prev) => ({ ...prev, latitude, longitude, locationDisplayName: displayName }));
      await updateProperty(accessToken, state.propertyId, { latitude, longitude });
    },
    [accessToken, state.propertyId]
  );

  const setImages = useCallback((images: SellerPropertyImageDto[]) => {
    setState((prev) => ({ ...prev, images }));
  }, []);

  const setSelectedNearbyTypes = useCallback((types: NearbyPlaceType[]) => {
    setState((prev) => ({ ...prev, selectedNearbyTypes: types }));
  }, []);

  const setNearbyPlaceSelections = useCallback((selections: PropertyNearbyPlaceDto[]) => {
    setState((prev) => ({ ...prev, nearbyPlaceSelections: selections }));
  }, []);

  const setDeedUploaded = useCallback((uploaded: boolean) => {
    setState((prev) => ({ ...prev, deedUploaded: uploaded }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<WizardContextValue>(
    () => ({
      ...state,
      startNewDraft,
      loadExistingDraft,
      patch,
      setImages,
      setSelectedNearbyTypes,
      setNearbyPlaceSelections,
      setDeedUploaded,
      setLocation,
      reset,
    }),
    [
      state,
      startNewDraft,
      loadExistingDraft,
      patch,
      setImages,
      setSelectedNearbyTypes,
      setNearbyPlaceSelections,
      setDeedUploaded,
      setLocation,
      reset,
    ]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return ctx;
}
