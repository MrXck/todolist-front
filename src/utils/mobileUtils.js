//使用userAgent判断
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
// 使用媒体查询判断
function isMobileViewport() {
    return window.matchMedia("(max-width: 767px)").matches;
}
export function isMobile() {
    return isMobileDevice() || isMobileViewport();
}
