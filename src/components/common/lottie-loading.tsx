import React from 'react';
import Lottie from 'lottie-react';

interface LottieLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({ animationData, loop = true, autoplay = true, className, ...props }) => {
  return (
    <div className={className} {...props}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
};

export default LottieLoader;
