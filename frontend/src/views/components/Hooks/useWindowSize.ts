import { useState, useLayoutEffect } from "react";
import useDevice, { Device } from "./useDevice";

type Size = {
  width: number | undefined;
  height: number | undefined;
};

export const useWindowSize = (): Size => {
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  const { device } = useDevice();

  const handleResize = () => {
    setWindowSize({
      width: device === Device.mobile ? window.screen.width : window.innerWidth,
      height: window.innerHeight,
    });
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [window, document, device]);

  return windowSize;
};