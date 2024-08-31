import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NFTMedia } from "@/components/common/nft-media";
import { NFT } from '@/types/nft';
import { Asset } from '@nifty-oss/asset';

interface ViewMediaButtonProps {
    nft: NFT | Asset;
}

const ViewMediaButton: React.FC<ViewMediaButtonProps> = ({ nft }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const handleMediaLoad = (url: string) => {
    setMediaUrl(url);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NFTMedia 
        nft={nft}
        className="w-full h-full rounded-lg shadow-md object-contain"
        onMediaLoad={handleMediaLoad}
      />
      {isHovered && mediaUrl && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 opacity-90 hover:opacity-100 z-10"
          onClick={() => window.open(mediaUrl, '_blank')}
        >
          View Media <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ViewMediaButton;