import React, { useState, useEffect } from "react";
import Image from "next/image";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { NFTMediaProps } from "@/types/nft";
import { Asset, ExtensionType, getExtension } from '@nifty-oss/asset';

export const NFTMedia: React.FC<NFTMediaProps> = ({ nft, className, onLoad, onError, onMediaLoad }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<string | null>(null);
    const [isOnChainImage, setIsOnChainImage] = useState(false);

    const containerStyle = "relative w-full h-full overflow-hidden rounded-lg";

    useEffect(() => {
        const determineMedia = () => {
            let url = null;
            let type = null;
            let onChainImage = false;

            if ('raw' in nft) {
                // This is a regular NFT
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
                } else if (nft.raw.content?.links?.image) {
                    url = handleArDriveLink(nft.raw.content.links.image);
                    type = "image";
                } else if (nft.image) {
                    url = handleArDriveLink(nft.image);
                    type = "image";
                }
            } else {
                // Handle Nifty assets
                const blob = getExtension(nft as Asset, ExtensionType.Blob);
                const metadata = getExtension(nft as Asset, ExtensionType.Metadata);
                if (blob && 'data' in blob && 'contentType' in blob) {
                    const base64String = Buffer.from(blob.data).toString('base64');
                    url = `data:${blob.contentType};base64,${base64String}`;
                    type = blob.contentType.split('/')[0];
                    onChainImage = true;
                } else if (metadata?.imageUri) {
                    url = metadata.imageUri;
                    type = "image";
                }
            }

            if (url && onMediaLoad) {
                onMediaLoad(url);
            }

            // The state remains `null` if we don't find any media
            setMediaUrl(url);
            setMediaType(type);
            setIsOnChainImage(onChainImage);
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
                <>
                    <Image
                        src={cleanUrl(mediaUrl)}
                        alt={('name' in nft ? nft.name : '') || "Asset"}
                        width={300}
                        height={300}
                        className={`${containerStyle} ${className}`}
                        onLoad={onLoad}
                        onError={handleError}
                    />
                    {isOnChainImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-xs py-1 px-2 text-center rounded-b-lg">
                            ON-CHAIN IMAGE
                        </div>
                    )}
                </>
            );
    }
};