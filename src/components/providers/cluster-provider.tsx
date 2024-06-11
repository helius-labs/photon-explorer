"use client";

import { useQueryState } from "nuqs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Cluster {
  value: string;
  label: string;
  disabled: boolean;
}

export interface UseClusterProps {
  clusters: Cluster[];
  cluster: string;
  setCluster: React.Dispatch<React.SetStateAction<string>>;
  customEndpoint: string;
  setCustomEndpoint: React.Dispatch<React.SetStateAction<string>>;
  customCompressionEndpoint: string;
  setCustomCompressionEndpoint: React.Dispatch<React.SetStateAction<string>>;
  endpoint: string;
  compressionEndpoint: string;
}

const ClusterContext = createContext<UseClusterProps | undefined>(undefined);

const defaultContext: UseClusterProps = {
  clusters: [],
  cluster: "",
  setCluster: (_) => {},
  customEndpoint: "",
  setCustomEndpoint: (_) => {},
  customCompressionEndpoint: "",
  setCustomCompressionEndpoint: (_) => {},
  endpoint: "",
  compressionEndpoint: "",
};

const endpointMap = {
  custom: process.env.NEXT_PUBLIC_LOCALNET!,
  localnet: process.env.NEXT_PUBLIC_LOCALNET!,
  testnet: process.env.NEXT_PUBLIC_TESTNET!,
  devnet: process.env.NEXT_PUBLIC_DEVNET!,
  "mainnet-beta": process.env.NEXT_PUBLIC_MAINNET!,
};

const compressionEndpointMap = {
  custom: process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!,
  localnet: process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!,
  testnet: process.env.NEXT_PUBLIC_COMPRESSION_TESTNET!,
  devnet: process.env.NEXT_PUBLIC_COMPRESSION_DEVNET!,
  "mainnet-beta": process.env.NEXT_PUBLIC_COMPRESSION_MAINNET!,
};

export const useCluster = () => useContext(ClusterContext) ?? defaultContext;

const clusters: Cluster[] = [
  { value: "mainnet-beta", label: "Mainnet Beta", disabled: false },
  { value: "testnet", label: "Testnet", disabled: true },
  { value: "devnet", label: "Devnet", disabled: false },
  { value: "localnet", label: "Localnet", disabled: true },
  { value: "custom", label: "Custom RPC URL", disabled: true },
];

const defaultCluster = "mainnet-beta";
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

  const [cluster, setCluster] = useQueryState("cluster", {
    defaultValue: defaultCluster,
  });

  // Set default endpoint to testnet
  const [endpoint, setEndpoint] = useState(() => getEndpoint(cluster));

  // Set compression endpoint to testnet
  const [compressionEndpoint, setCompressionEndpoint] = useState(() =>
    getCompressionEndpoint(cluster),
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
    if (cluster === "custom") {
      setEndpoint(customEndpoint);
      setCompressionEndpoint(customCompressionEndpoint);
    } else {
      const newEndpoint = getEndpoint(cluster);
      if (newEndpoint) {
        setEndpoint(newEndpoint);
      }
      const newCompressionEndpoint = getCompressionEndpoint(cluster);
      if (newCompressionEndpoint) {
        setCompressionEndpoint(newCompressionEndpoint);
      }
    }
  }, [cluster, customCompressionEndpoint, customEndpoint]);

  const providerValue = useMemo(
    () => ({
      clusters,
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

// Helpers
const getEndpoint = (cluster: string) => {
  return endpointMap[cluster as keyof typeof endpointMap];
};

const getCompressionEndpoint = (cluster: string) => {
  return compressionEndpointMap[cluster as keyof typeof compressionEndpointMap];
};

const getCustomEndpoint = (key: string, fallback: string) => {
  let customEndpoint;
  try {
    customEndpoint = localStorage.getItem(key) || undefined;
  } catch (e) {
    // Unsupported
  }
  return customEndpoint || fallback;
};
