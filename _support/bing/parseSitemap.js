var sitemapFile = "sitemap.xml";

      getXMLSitemapObject(sitemapFile, function (sitemapObject) {
        // retrieve properties from the sitemap object
        const urlArray = [];
        var urls = sitemapObject.getElementsByTagName("url");
        for (var i = 0; i < urls.length; i++) {
          var urlElement = urls[i];

          var loc = urlElement.getElementsByTagName("loc")[0].textContent;
          const queryParams = window.location.href.indexOf("?") > -1;
          if (queryParams) {
            console.log("queryParams available");
          } else {
            console.log("queryParams not available");
          }
          urlArray.push(loc);
        }
        // redirectUrl(urlArray);
      });

      // get sitemap content and parse it to Document Object Model
      function getXMLSitemapObject(sitemapFile, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            var sitemapContent = this.responseText;
            var sitemapObject = parseXMLSitemap(sitemapContent);
            callback(sitemapObject);
          }
        };
        xhttp.open("GET", sitemapFile, true);
        xhttp.send();
      }

      // parse a text string into an XML DOM object
      function parseXMLSitemap(sitemapContent) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(sitemapContent, "text/xml");
        return xmlDoc;
      }
