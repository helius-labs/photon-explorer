"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useQueryState } from "nuqs";

export interface Cluster {
  value: string;
  label: string;
}

export interface UseClusterProps {
  clusters: Cluster[];
  cluster: string;
  setCluster: React.Dispatch<React.SetStateAction<string>>;
  clusterCustomRpcUrl: string;
  setClusterCustomRpcUrl: React.Dispatch<React.SetStateAction<string>>;
  endpoint: string;
}

const ClusterContext = createContext<UseClusterProps | undefined>(undefined);

const defaultContext: UseClusterProps = {
  clusters: [],
  cluster: "",
  setCluster: (_) => {},
  clusterCustomRpcUrl: "",
  setClusterCustomRpcUrl: (_) => {},
  endpoint: "",
};

export const useCluster = () => useContext(ClusterContext) ?? defaultContext;

const clusters: Cluster[] = [
  { value: "mainnet-beta", label: "Mainnet Beta" },
  { value: "devnet", label: "Devnet" },
  { value: "localnet", label: "Localnet" },
  { value: "custom", label: "Custom RPC URL" },
];

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  // TODO: Store this in local storage and persist across page refreshes
  const [clusterCustomRpcUrl, setClusterCustomRpcUrl] = useState(
    process.env.NEXT_PUBLIC_LOCALNET!,
  );
  const [cluster, setCluster] = useQueryState("cluster", {
    defaultValue: "mainnet-beta",
  });

  const endpointMap = useMemo(
    () => ({
      custom: process.env.NEXT_PUBLIC_LOCALNET!,
      localnet: process.env.NEXT_PUBLIC_LOCALNET!,
      devnet: process.env.NEXT_PUBLIC_DEVNET!,
      "mainnet-beta": process.env.NEXT_PUBLIC_MAINNET!,
    }),
    [],
  );

  // Set default endpoint to mainnet-beta
  const [endpoint, setEndpoint] = useState(endpointMap["mainnet-beta"]);

  // Set endpoint based on cluster
  useEffect(() => {
    if (cluster === "custom") {
      setEndpoint(clusterCustomRpcUrl);
    } else {
      const newEndpoint = endpointMap[cluster as keyof typeof endpointMap];
      if (newEndpoint) {
        setEndpoint(newEndpoint);
      }
    }
  }, [cluster, endpointMap, clusterCustomRpcUrl]);

  const providerValue = useMemo(
    () => ({
      clusters,
      cluster,
      setCluster,
      clusterCustomRpcUrl,
      setClusterCustomRpcUrl,
      endpoint,
    }),
    [
      cluster,
      setCluster,
      clusterCustomRpcUrl,
      setClusterCustomRpcUrl,
      endpoint,
    ],
  );

  return (
    <ClusterContext.Provider value={providerValue}>
      {children}
    </ClusterContext.Provider>
  );
}
