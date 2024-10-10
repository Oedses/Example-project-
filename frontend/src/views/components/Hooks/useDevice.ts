import { useState, useEffect } from "react";

export enum Device {
  mobile = 'mobile',
  desktop = 'desktop',
}

const useDevice = () => {
  const [device, setDeviceType] = useState<Device>(Device.mobile);

  useEffect(() => {
    if ("maxTouchPoints" in navigator || "msMaxTouchPoints" in navigator) {
      return setDeviceType(navigator.maxTouchPoints > 0 ? Device.mobile : Device.desktop);
    }

    const mQ = Boolean(window.matchMedia) && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
      return setDeviceType(Boolean(mQ.matches) ? Device.mobile : Device.desktop);
    }

    // deprecated, but good fallback
    if ("orientation" in window) {
      return setDeviceType(Device.mobile);
    }

    const { userAgent } = navigator;
    const hasTouchScreen =
      /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
      /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);

    setDeviceType(hasTouchScreen ? Device.mobile : Device.desktop);
  }, [window, document, window.innerWidth]);

  return {
    device
  };
};

export default useDevice;