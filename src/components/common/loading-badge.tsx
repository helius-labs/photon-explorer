import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const LoadingBadge = ({ text }: { text: string }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getDotsText = (dots: number) => {
    switch (dots) {
      case 1:
        return `${text}.`;
      case 2:
        return `${text}..`;
      case 3:
        return `${text}...`;
      default:
        return text;
    }
  };

  return (
    <Badge className="mt-4 cursor-pointer" variant="secondary">
      {getDotsText(dots)}
    </Badge>
  );
};

export default LoadingBadge;
