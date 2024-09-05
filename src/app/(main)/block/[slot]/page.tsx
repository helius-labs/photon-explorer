'use client';

import React from 'react';
import { useGetBlock } from '@/hooks/web3';
import BlockHeader from '@/components/block/block-header';
import BlockHistory from '@/components/block/block-history';
import BlockOverview from '@/components/block/block-overview';
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";

export default function BlockPage({ params }: { params: { slot: string } }) {
  const { slot } = params;
  const { data: block, isLoading, isError } = useGetBlock(Number(slot));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader animationData={loadingBarAnimation} className="h-32 w-32" />
      </div>
    );
  }

  if (isError || !block) {
    return <div className="text-white">Error loading block data</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <BlockHeader slot={Number(slot)} />
      <BlockOverview slot={Number(slot)} />
      <BlockHistory slot={params.slot} />
    </div>
  );
}