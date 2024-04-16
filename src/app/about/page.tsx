import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Photon Block Explorer",
  description: "",
};

export default function About() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">About</h2>
      </div>
    </>
  );
}
