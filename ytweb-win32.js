var style = document.createElement('style');
style.innerHTML = '* { font-family: "Verdana" !important; }';
style.id = 'ytdesktop-style';
document.head.appendChild(style);

document.querySelector('yt-img-shadow').style.marginRight = "100px"; // space for contols of windows

document.querySelectorAll('ytd-topbar-menu-button-renderer')[0].remove();

console.log('ytdesktop code injected successfully! this is the win32 (Windows) variation');



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