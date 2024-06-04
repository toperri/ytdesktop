console.log('this works i think');

window.try = function() {
    var css = document.createElement('style');
    css.innerHTML = '* { font-family: "Verdana" !important; }';
    document.head.appendChild(css);
};