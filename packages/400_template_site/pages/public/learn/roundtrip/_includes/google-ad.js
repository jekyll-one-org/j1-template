<!-- Google Ad (Displayanzeige): horizontal-1 -->
<ins class="adsbygoogle mb-5"
     style="display:block"
     data-ad-client="ca-pub-3885670015316130"
     data-ad-slot="5128488466"
     data-ad-format="auto"
     data-adtest="on"
     data-full-width-responsive="true">
</ins>

<!-- Google Ad (Displayanzeige): horizontal-2 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-3885670015316130"
     data-ad-slot="7284712660"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>



++++
<!-- insert Google Ad (Displayanzeige): horizontal-2, adSlot="5128488466" -->
<div class="5128488466 mb-5">
  <ins class="adsbygoogle"
    style="display: block;"
    data-ad-client="ca-pub-3885670015316130"
    data-ad-slot="5128488466"
    data-ad-format="auto"
    data-adtest="on"
    data-full-width-responsive="true">
  </ins>
</div>
++++

++++
<script>

  $(document).ready(function() {
    var logger              = log4javascript.getLogger('j1.google.ads');
    var autoHideOnUnfilled  = false;

    var dependencies_met_page_ready = setInterval (function (options) {
      if ( j1.getState() === 'finished' ) {

        // monitor for state changes on the ad
        // ---------------------------------------------------------------------
        $('.adsbygoogle').attrchange({
          trackValues: true,
          callback: function (event) {
            if (event.newValue === 'unfilled') {
              var elm = event.target.dataset;
              if (elm.adClient) {
                logger.warn('\n' + 'initialized ad detected as: ' + event.newValue);
                if (autoHideOnUnfilled) {
                  logger.info('\n' + ' hide ad for slot: ' + elm.adSlot);
                  $('.' + elm.adSlot ).hide();
                }
              }
            }
          }
        });

        // manage uncaught execeptions
        // ---------------------------------------------------------------------
        // window.onerror = function (msg, url, line) {
        //    alert("Message : " + msg );
        //    alert("url : " + url );
        //    alert("Line number : " + line );
        // }

        logger.info('\n' + 'initialize Google Ad on slot: ' + '5128488466');
        (adsbygoogle = window.adsbygoogle || []).push({});

        clearInterval(dependencies_met_page_ready);
      }
   });

  });

</script>
++++
