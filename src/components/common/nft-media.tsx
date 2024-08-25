import React, { useState, useEffect } from "react";
import Image from "next/image";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import cloudflareLoader from "@/utils/imageLoader";
import { NFTMediaProps } from "@/types/nft";

export const NFTMedia: React.FC<NFTMediaProps> = ({ nft, className, onLoad, onError, onMediaLoad }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<string | null>(null);

    const containerStyle = "relative w-full h-full overflow-hidden rounded-lg";

    useEffect(() => {
        const determineMedia = () => {
            let url = null;
            let type = null;

            if (nft.raw.content?.files && nft.raw.content.files.length > 0) {
                // Prioritize video files, then images as fallbacks
                const videoFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("video/"));
                const imageFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("image/"));
                const audioFile = nft.raw.content.files.find((file: { mime: string; }) => file.mime.startsWith("audio/"));

                if (videoFile) {
                    url = handleArDriveLink(videoFile.cdn_uri || videoFile.uri);
                    type = "video";
                } else if (imageFile) {
                    url = handleArDriveLink(imageFile.cdn_uri || imageFile.uri);
                    type = "image";
                } else if (audioFile) {
                    url = handleArDriveLink(audioFile.cdn_uri || audioFile.uri);
                    type = "audio";
                } else {
                    // If we can't find a video or an image, we use the first file
                    url = handleArDriveLink(nft.raw.content.files[0].cdn_uri || nft.raw.content.files[0].uri);
                    type = nft.raw.content.files[0].mime;
                }
            } else if (nft.raw.copntent?.links?.image) {
                url = handleArDriveLink(nft.raw.content.links.image);
                type = "image";
            } else if (nft.image) {
                url = handleArDriveLink(nft.image);
                type = "image";
            }

            if (mediaUrl && onMediaLoad) {
                onMediaLoad?.(mediaUrl);
            }
            
            // The state remains `null` if we don't find any media
            setMediaUrl(url);
            setMediaType(type);
        };

        determineMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nft, onMediaLoad]);

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