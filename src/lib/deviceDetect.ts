export function getDeviceType(): string {
  const userAgent =
    typeof navigator === "undefined" ? "SSR" : navigator.userAgent;

  if (/android/i.test(userAgent)) {
    return "Android";
  }
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return "iOS";
  }
  if (/Windows NT/i.test(userAgent)) {
    return userAgent;
  }
  if (/Macintosh/i.test(userAgent)) {
    return "MacOS";
  }
  return "Unknown";
}

export function getBrowserInfo(): string {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "SSR";

  if (userAgent.indexOf("Firefox") > -1) {
    return "Mozilla Firefox";
  } else if (userAgent.indexOf("SamsungBrowser") > -1) {
    return "Samsung Internet";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return "Opera";
  } else if (userAgent.indexOf("Trident") > -1) {
    return "Microsoft Internet Explorer";
  } else if (userAgent.indexOf("Edge") > -1) {
    return "Microsoft Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Google Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Apple Safari";
  } else {
    return "Unknown";
  }
}
