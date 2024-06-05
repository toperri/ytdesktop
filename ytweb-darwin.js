var style = document.createElement('style');
style.innerHTML = '* { font-family: "Verdana" !important; } #guide-button { margin-left: 65px !important;} .tp-yt-app-drawer { width: 320px !important; border-right: 2px solid black !important; }';
style.id = 'ytdesktop-style';
document.head.appendChild(style);

document.querySelectorAll('ytd-topbar-menu-button-renderer')[0].remove();