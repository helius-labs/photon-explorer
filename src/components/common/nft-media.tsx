import React, { useState, useEffect } from "react";
import Image from "next/image";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import cloudflareLoader from "@/utils/imageLoader";
import { NFTMediaProps } from "@/types/nft";

export const NFTMedia: React.FC<NFTMediaProps> = ({ nft, className, onLoad, onError }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<string | null>(null);

    const containerStyle = "relative w-full h-full overflow-hidden rounded-lg";

    useEffect(() => {
        const determineMedia = () => {
            if (nft.raw.content?.files && nft.raw.content.files.length > 0) {
                // Prioritize video files, then images as fallbacks
                const videoFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("video/"));

                if (videoFile) {
                    setMediaUrl(handleArDriveLink(videoFile.cdn_uri || videoFile.uri));
                    setMediaType("video");

                    return;
                }

                const imageFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("image/"));

                if (imageFile) {
                    setMediaUrl(handleArDriveLink(imageFile.cdn_uri || imageFile.uri));
                    setMediaType("image");

                    return;
                }

                const audioFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("audio/"));

                if (audioFile) {
                    setMediaUrl(handleArDriveLink(audioFile.cdn_uri || audioFile.uri));
                    setMediaType("audio");

                    return;
                }

                // If we can't find a video or an image, we use the first file
                setMediaUrl(handleArDriveLink(nft.raw.content.files[0].cdn_uri || nft.raw.content.files[0].uri));
                setMediaType(nft.raw.content.files[0].mime);
            } else if (nft.raw.copntent?.links?.image) {
                setMediaUrl(handleArDriveLink(nft.raw.content.links.image));
                setMediaType("image");
            } else if (nft.image) {
                setMediaUrl(handleArDriveLink(nft.image));
                setMediaType("image");
            }
            
            // The state remains `null` if we don't find any media
        };

        determineMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nft]);

    const handleError = () => {
        setMediaUrl(noLogoImg.src);
        setMediaType("image");
        onError?.();
    };

    const handleArDriveLink = (url: string): string => {
        if (url.includes("ardrive.io")) {
            const segments = url.split('/').filter(Boolean);
            const fileIndex = segments.indexOf('file');
    
            if (fileIndex !== -1 && fileIndex + 1 < segments.length) {
                const ardriveId = segments[fileIndex + 1];
                return `https://arweave.net/${ardriveId}`;
            }
        }

        return url;
    }
    
    const cleanUrl = (url: string) => {
        return url.split('#')[0];
    }

    if (!mediaUrl) {
        return (
          <div className={` ${containerStyle} ${className} flex items-center justify-center bg-gray-200`}>
            No media available
          </div>
        );
      }
    
    switch (mediaType) {
        case "video":
            return (
                <video
                    src={cleanUrl(mediaUrl)}
                    className={`${containerStyle} ${className}`}
                    controls
                    autoPlay
                    loop
                    muted
                    onLoadedData={onLoad}
                    onError={handleError}
                />
            );
        case "audio":
            return (
                <div className={`${containerStyle} ${className} flex items-center justify-center bg-gray-100`}>
                    <audio src={cleanUrl(mediaUrl)} controls onLoadedData={onLoad} onError={handleError} />
                </div>
            );
        case "image":
        default:
            return (
                <Image
                    //loader={cloudflareLoader}
                    src={cleanUrl(mediaUrl)}
                    alt={nft.name || "NFT"}
                    width={300}
                    height={300}
                    className={`${containerStyle} ${className}`}
                    onLoad={onLoad}
                    onError={handleError}
                />
            );
    }
};