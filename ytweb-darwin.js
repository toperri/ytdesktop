var style = document.createElement('style');
style.innerHTML = '* { font-family: "Verdana" !important; } #guide-button { margin-left: 65px !important;} .tp-yt-app-drawer { width: 320px !important; border-right: 2px solid black !important; }';
style.id = 'ytdesktop-style';
document.head.appendChild(style);

document.querySelectorAll('ytd-topbar-menu-button-renderer')[0].remove();

console.log('ytdesktop code injected successfully! this is the darwin (macOS) variation');

// ad blocker
// (BETA)
const clear = (() => {
    const defined = v => v !== null && v !== undefined;
    const timeout = setInterval(() => {
        const ad = [...document.querySelectorAll('.ad-showing')][0];
        if (defined(ad)) {
            const video = document.querySelector('video');
            if (defined(video)) {
                video.currentTime = video.duration;
            }
        }
    }, 500);
    return function() {
        clearTimeout(timeout);
    }
})();
// clear();