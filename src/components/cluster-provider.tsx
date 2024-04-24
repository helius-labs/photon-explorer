"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";

export interface Cluster {
  value: string;
  label: string;
}

export interface UseClusterProps {
  clusters: Cluster[];
  cluster: string;
  setCluster: React.Dispatch<React.SetStateAction<string>>;
  endpoint: string;
}

const ClusterContext = createContext<UseClusterProps | undefined>(undefined);

const defaultContext: UseClusterProps = {
  setCluster: (_) => {},
  clusters: [],
  cluster: "",
  endpoint: "",
};

export const useCluster = () => useContext(ClusterContext) ?? defaultContext;

const clusters: Cluster[] = [
  { value: "mainnet-beta", label: "Mainnet Beta" },
  { value: "testnet", label: "Testnet" },
  { value: "devnet", label: "Devnet" },
  { value: "localnet", label: "Localnet" },
];

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const [cluster, setCluster] = useState("mainnet-beta");

  // TODO: Add cluster to the URL for easy sharing
  // const [cluster, setCluster] = useQueryState("cluster", {
  //   defaultValue: "mainnet-beta",
  // });

  // TODO: Make this configurable in the frontend
  // And store it locally
  const endpointMap = useMemo(
    () => ({
      localnet: process.env.NEXT_PUBLIC_LOCALNET!,
      devnet: process.env.NEXT_PUBLIC_DEVNET!,
      testnet: process.env.NEXT_PUBLIC_TESTNET!,
      "mainnet-beta": process.env.NEXT_PUBLIC_MAINNET!,
    }),
    [],
  );

  // Set default endpoint to mainnet-beta
  const [endpoint, setEndpoint] = useState(endpointMap["mainnet-beta"]);

  useEffect(() => {
    const newEndpoint = endpointMap[cluster as keyof typeof endpointMap];
    if (newEndpoint) {
      setEndpoint(newEndpoint);
    }
  }, [cluster, endpointMap]);

  const providerValue = useMemo(
    () => ({
      clusters,
      cluster,
      setCluster,
      endpoint,
    }),
    [cluster, endpoint, setCluster],
  );

  return (
    <ClusterContext.Provider value={providerValue}>
      {children}
    </ClusterContext.Provider>
  );
}
