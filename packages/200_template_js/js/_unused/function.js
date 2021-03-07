j1.adapter['octokit'] = (function (j1, window) {
  
  return {

    // -------------------------------------------------------------------------
    // Initialize WebHook Core
    // -------------------------------------------------------------------------
    // Initialize
    init: function () {
      // Setup logger
      logger = log4javascript.getLogger('j1.adapter.octokit');
      state = 'started';
      logger.info('state: ' + state); // Set|Log status

      //
      // code to be implemented goes here
      //

      state = 'finished';
      logger.info('state: ' + state); // Set|Log status
      logger.info('j1.adapter.octokit successfully initialized');

      return true;
    }
    
  }
})(j1, window);