"use client";

export default function Loading({ }) {
  return (
    <div className="flex items-center">
      <div className="relative mr-2 flex h-3 w-3 items-center justify-center">
        <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-100 opacity-75"></div>
        <div className="relative inline-flex h-2 w-2 rounded-full bg-zinc-100"></div>
      </div>
      <div>Loading</div>
    </div>
  );
}
