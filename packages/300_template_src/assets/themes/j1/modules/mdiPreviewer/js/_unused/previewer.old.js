/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/mdiPreviewer/css/previewer.js
 # Provides JS functions for the MDI Icon Previewer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

(function () {

  var icons          = {};
  var icon_database  = '/assets/data/mdi_icons.json';

    function load_data_database() {
      // Returns the icon database object
      return $.ajax({
        url:      icon_database,
        success:  function (data) {
          if (typeof data == 'string') {
            icons = JSON.parse(data);
          }
          if (typeof data == 'object') {
            icons = data;
          }
        }
      })
    };

    $.when( load_data_database() ).done (
      function( load_database_response ) {

        icons.push({ "name": "blank", "codepoint": "F068C" });

        var copyText = function (text) {
            var copyFrom = document.createElement('textarea');
            copyFrom.setAttribute("style", "position:fixed;opacity:0;top:100px;left:100px;");
            copyFrom.value = text;
            document.body.appendChild(copyFrom);
            copyFrom.select();
            document.execCommand('copy');
            var copied = document.createElement('div');
            copied.setAttribute('class', 'copied');
            copied.appendChild(document.createTextNode('Copied to Clipboard'));
            document.body.appendChild(copied);
            setTimeout(function () {
                document.body.removeChild(copyFrom);
                document.body.removeChild(copied);
            }, 1500);
        };
        // Skip info record 0 (j=1)
        for (var j = 1; j < icons.length; j++) {
            var div = document.createElement('div'),
                i = document.createElement('i');
            div.setAttribute("id", "mdi-icon");

            i.className = 'mdi mdi-' + icons[j].name;
            div.appendChild(i);
            var code = document.createElement('code');
            code.appendChild(document.createTextNode('#' + icons[j].codepoint));
            div.appendChild(code);
            var span = document.createElement('span');
            //span.appendChild(document.createTextNode('mdi-' + icons[j].name));
            span.appendChild(document.createTextNode(icons[j].name));
            div.appendChild(span);

            span.onclick = (function (icon) {
                return function () {
                    //document.getElementById('name').innerHTML = icon.name;
                };
            })(icons[j]);

            i.onmouseup = (function (icon) {
                return function () {
                    //copyText(String.fromCharCode(parseInt(icon.value, 16)));
                    copyText('\\' + icon.codepoint);
                };
            })(icons[j]);

            code.onmouseup = (function (icon) {
                return function () {
                    copyText('#' + icon.codepoint);
                };
            })(icons[j]);

            span.onmouseup = (function (icon) {
                return function () {
                    copyText('mdi-' + icon.name);
                    //copyText(icon.name);
                };
            })(icons[j]);

            document.getElementById('icons').appendChild(div);
        }
    });

})();
