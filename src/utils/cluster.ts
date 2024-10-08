export enum ClusterStatus {
  Connected,
  Connecting,
  Failure,
}

export enum Cluster {
  MainnetBeta = "mainnet-beta",
  Testnet = "testnet",
  Devnet = "devnet",
  Localnet = "localnet",
  Custom = "custom",
}

export const CLUSTERS = [
  Cluster.MainnetBeta,
  // Cluster.Testnet, Testnet is deprecated for ZK compression
  Cluster.Devnet,
  Cluster.Localnet,
  Cluster.Custom,
];

export function clusterSlug(cluster: Cluster): string {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return "mainnet-beta";
    case Cluster.Testnet:
      return "testnet";
    case Cluster.Devnet:
      return "devnet";
    case Cluster.Localnet:
      return "localnet";
    case Cluster.Custom:
      return "custom";
  }
}

export function clusterName(cluster: Cluster): string {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return "Mainnet Beta";
    case Cluster.Testnet:
      return "Testnet";
    case Cluster.Devnet:
      return "Devnet";
    case Cluster.Localnet:
      return "Localnet";
    case Cluster.Custom:
      return "Custom";
  }
}

export function clusterUrl(cluster: Cluster, customUrl: string): string {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return process.env.NEXT_PUBLIC_MAINNET!;
    case Cluster.Devnet:
      return process.env.NEXT_PUBLIC_DEVNET!;
    case Cluster.Testnet:
      return process.env.NEXT_PUBLIC_TESTNET!;
    case Cluster.Localnet:
      return process.env.NEXT_PUBLIC_LOCALNET!;
    case Cluster.Custom:
      return customUrl;
  }
}

export function clusterCompressionUrl(
  cluster: Cluster,
  customUrl: string,
): string {
  switch (cluster) {
    case Cluster.MainnetBeta:
      return process.env.NEXT_PUBLIC_COMPRESSION_MAINNET!;
    case Cluster.Devnet:
      return process.env.NEXT_PUBLIC_COMPRESSION_DEVNET!;
    case Cluster.Testnet:
      return process.env.NEXT_PUBLIC_COMPRESSION_TESTNET!;
    case Cluster.Localnet:
      return process.env.NEXT_PUBLIC_COMPRESSION_LOCALNET!;
    case Cluster.Custom:
      return customUrl;
  }
}

export const DEFAULT_CLUSTER = Cluster.MainnetBeta;
export const MAINNET_BETA_URL = clusterUrl(Cluster.MainnetBeta, "");
