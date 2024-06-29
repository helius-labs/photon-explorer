"use client";

import { parseAsStringEnum, useQueryState } from "nuqs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Cluster,
  DEFAULT_CLUSTER,
  clusterCompressionUrl,
  clusterUrl,
} from "@/utils/cluster";

export interface UseClusterProps {
  cluster: Cluster;
  setCluster: React.Dispatch<React.SetStateAction<Cluster>>;
  customEndpoint: string;
  setCustomEndpoint: React.Dispatch<React.SetStateAction<string>>;
  customCompressionEndpoint: string;
  setCustomCompressionEndpoint: React.Dispatch<React.SetStateAction<string>>;
  endpoint: string;
  compressionEndpoint: string;
}

const ClusterContext = createContext<UseClusterProps | undefined>(undefined);

const defaultContext: UseClusterProps = {
  cluster: DEFAULT_CLUSTER,
  setCluster: (_) => {},
  customEndpoint: "",
  setCustomEndpoint: (_) => {},
  customCompressionEndpoint: "",
  setCustomCompressionEndpoint: (_) => {},
  endpoint: "",
  compressionEndpoint: "",
};

export const useCluster = () => useContext(ClusterContext) ?? defaultContext;

const storageKeyCustomEndPoint = "CustomEndPoint";
const storageKeyCustomCompressionEndPoint = "CustomCompressionEndPoint";

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const [customEndpoint, setCustomEndpointState] = useState(() =>
    getCustomEndpoint(
      storageKeyCustomEndPoint,
      process.env.NEXT_PUBLIC_LOCALNET!,
    ),
  );

  const [customCompressionEndpoint, setCustomCompressionEndpointState] =
    useState(() =>
      getCustomEndpoint(
        storageKeyCustomCompressionEndPoint,
        process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!,
      ),
    );

  const [cluster, setCluster] = useQueryState(
    "cluster",
    parseAsStringEnum<Cluster>(Object.values(Cluster)) // pass a list of allowed values
      .withDefault(DEFAULT_CLUSTER), // default value
  );

  const [endpoint, setEndpoint] = useState(() =>
    clusterUrl(cluster, customEndpoint),
  );

  // Set compression endpoint to testnet
  const [compressionEndpoint, setCompressionEndpoint] = useState(() =>
    clusterCompressionUrl(cluster, customCompressionEndpoint),
  );

  const setCustomEndpoint = useCallback((value: any) => {
    setCustomEndpointState(() => value);

    // Save to storage
    try {
      localStorage.setItem(storageKeyCustomEndPoint, value);
    } catch (e) {
      // Unsupported
    }
  }, []);

  const setCustomCompressionEndpoint = useCallback((value: any) => {
    setCustomCompressionEndpointState(() => value);

    // Save to storage
    try {
      localStorage.setItem(storageKeyCustomCompressionEndPoint, value);
    } catch (e) {
      // Unsupported
    }
  }, []);

  // Set endpoint based on cluster
  useEffect(() => {
    setEndpoint(clusterUrl(cluster, customEndpoint));
    setCompressionEndpoint(
      clusterCompressionUrl(cluster, customCompressionEndpoint),
    );
  }, [cluster, customCompressionEndpoint, customEndpoint]);

  const providerValue = useMemo(
    () => ({
      cluster,
      setCluster,
      customEndpoint,
      setCustomEndpoint,
      customCompressionEndpoint,
      setCustomCompressionEndpoint,
      endpoint,
      compressionEndpoint,
    }),
    [
      cluster,
      setCluster,
      customEndpoint,
      setCustomEndpoint,
      customCompressionEndpoint,
      setCustomCompressionEndpoint,
      endpoint,
      compressionEndpoint,
    ],
  );

  return (
    <ClusterContext.Provider value={providerValue}>
      {children}
    </ClusterContext.Provider>
  );
}

const getCustomEndpoint = (key: string, fallback: string) => {
  let customEndpoint;
  try {
    customEndpoint = localStorage.getItem(key) || undefined;
  } catch (e) {
    // Unsupported
  }
  return customEndpoint || fallback;
};
