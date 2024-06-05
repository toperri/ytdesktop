var style = document.createElement('style');
style.innerHTML = '* { font-family: "Verdana" !important; }';
style.id = 'ytdesktop-style';
document.head.appendChild(style);

document.querySelector('yt-img-shadow').style.marginRight = "100px"; // space for contols of windows

document.querySelectorAll('ytd-topbar-menu-button-renderer')[0].remove();