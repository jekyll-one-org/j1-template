++++
<script>

var options = {};
var j1 = window.j1;

options.spec      = 'jekyll-one/nbinteract-notebooks/main';
options.baseUrl   = 'https://mybinder.org';
options.provider  = 'gh';

var coreLogger    = log4javascript.getLogger('nbinteract.core');
var interact      = new NbInteract({
  spec:     options.spec,
  baseUrl:  options.baseUrl,
  provider: options.provider,
  logger:   coreLogger,
  j1API:    j1,
})

setInterval(myTimer, 5000);

function myTimer() {
  const d = new Date();
  interact.prepare();
  console.log('Init nbinteract on: ' + d.toLocaleTimeString());
}

</script>
++++
