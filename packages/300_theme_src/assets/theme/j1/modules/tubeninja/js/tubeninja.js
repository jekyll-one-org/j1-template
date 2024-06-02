// https://www.tubeninja.net/widget.js
//
window.tubeninja = (function () {
    Element.prototype.appendAfter = function (element) {
        element.parentNode.insertBefore(this, element.nextSibling);
    };
    String.prototype.contains = function (it) {
        return this.indexOf(it) !== -1;
    };
    var tubeninja = {
        text: 'Download',
        title: 'Download with TubeNinja',
        target: '_blank',
        btnClass: 'btn-tubeninja',
        init: function () {
            var els = document.getElementsByTagName('iframe');
            for (var i = 0; i < els.length; i++) {
                var iframe = els[i];
                if (iframe.src.contains('youtube.com') || iframe.src.contains('vimeo.com')) {
                    var dlbtn = document.createElement('a');
                    dlbtn.className = tubeninja.btnClass;
                    dlbtn.style = 'display:block;width:60px;';
                    dlbtn.textContent = tubeninja.text;
                    dlbtn.title = tubeninja.title;
                    dlbtn.target = tubeninja.target;
                    dlbtn.href = 'https://tubeninja.net/?url=' + iframe.src + '&utm_source=widget&utm_medium=widget';
                    dlbtn.rel = 'nofollow';
                    dlbtn.appendAfter(iframe);
                }
            }
        }
    };
    document.addEventListener("DOMContentLoaded", function (event) {
        tubeninja.init();
    });
    return tubeninja;
}());
