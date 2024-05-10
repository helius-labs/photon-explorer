"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useQueryState } from "nuqs";

export interface Cluster {
  value: string;
  label: string;
  disabled: boolean;
}

export interface UseClusterProps {
  clusters: Cluster[];
  cluster: string;
  setCluster: React.Dispatch<React.SetStateAction<string>>;
  clusterCustomRpcUrl: string;
  setClusterCustomRpcUrl: React.Dispatch<React.SetStateAction<string>>;
  endpoint: string;
  compressionEndpoint: string;
}

const ClusterContext = createContext<UseClusterProps | undefined>(undefined);

const defaultContext: UseClusterProps = {
  clusters: [],
  cluster: "",
  setCluster: (_) => {},
  clusterCustomRpcUrl: "",
  setClusterCustomRpcUrl: (_) => {},
  endpoint: "",
  compressionEndpoint: "",
};

export const useCluster = () => useContext(ClusterContext) ?? defaultContext;

const clusters: Cluster[] = [
  { value: "mainnet-beta", label: "Mainnet Beta", disabled: true },
  { value: "testnet", label: "Testnet", disabled: false },
  { value: "devnet", label: "Devnet", disabled: true },
  { value: "localnet", label: "Localnet", disabled: false },
  { value: "custom", label: "Custom RPC URL", disabled: true },
];

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  // TODO: Store this in local storage and persist across page refreshes
  const [clusterCustomRpcUrl, setClusterCustomRpcUrl] = useState(
    process.env.NEXT_PUBLIC_LOCALNET!,
  );
  const [cluster, setCluster] = useQueryState("cluster", {
    defaultValue: "localnet",
  });

  const endpointMap = useMemo(
    () => ({
      custom: process.env.NEXT_PUBLIC_LOCALNET!,
      localnet: process.env.NEXT_PUBLIC_LOCALNET!,
      testnet: process.env.NEXT_PUBLIC_TESTNET!,
      devnet: process.env.NEXT_PUBLIC_DEVNET!,
      "mainnet-beta": process.env.NEXT_PUBLIC_MAINNET!,
    }),
    [],
  );

  const compressionEndpointMap = useMemo(
    () => ({
      custom: process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!,
      localnet: process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!,
      testnet: process.env.NEXT_PUBLIC_COMPRESSION_TESTNET!,
      devnet: process.env.NEXT_PUBLIC_COMPRESSION_DEVNET!,
      "mainnet-beta": process.env.NEXT_PUBLIC_COMPRESSION_MAINNET!,
    }),
    [],
  );

  // Set default endpoint to mainnet-beta
  const [endpoint, setEndpoint] = useState(endpointMap["localnet"]);

  // Set compression endpoint to mainnet-beta
  const [compressionEndpoint, setCompressionEndpoint] = useState(
    compressionEndpointMap["localnet"],
  );

  // Set endpoint based on cluster
  useEffect(() => {
    if (cluster === "custom") {
      setEndpoint(clusterCustomRpcUrl);
    } else {
      const newEndpoint = endpointMap[cluster as keyof typeof endpointMap];
      if (newEndpoint) {
        setEndpoint(newEndpoint);
      }
      const newCompressionEndpoint =
        compressionEndpointMap[cluster as keyof typeof compressionEndpointMap];
      if (newCompressionEndpoint) {
        setCompressionEndpoint(newCompressionEndpoint);
      }
    }
  }, [cluster, endpointMap, clusterCustomRpcUrl, compressionEndpointMap]);

  const providerValue = useMemo(
    () => ({
      clusters,
      cluster,
      setCluster,
      clusterCustomRpcUrl,
      setClusterCustomRpcUrl,
      endpoint,
      compressionEndpoint,
    }),
    [
      cluster,
      setCluster,
      clusterCustomRpcUrl,
      setClusterCustomRpcUrl,
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
