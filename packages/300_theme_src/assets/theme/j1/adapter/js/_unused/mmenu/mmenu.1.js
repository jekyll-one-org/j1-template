      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true: false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          // Guard: honour the enabled flag from merged config.
          // When enabled is false the adapter registers itself as finished
          // but skips Lightbox3 initialisation so no listeners are attached.
          if (!lightboxOptions.enabled) {
            logger.info('Lightbox3 is disabled via configuration – skipping initialisation');
            _this.setState('finished');
            logger.debug('state: ' + _this.getState());
            clearInterval(dependencies_met_page_ready);
            // claude - J1 Adapter optimizations #1
            // clear safety timeout on the disabled-but-finished path too
            //
            if (dependenciesTimeout) {
              clearTimeout(dependenciesTimeout);
              dependenciesTimeout = null;
            }
            return;
          }

          // _initLightbox() replaces the inline Lightbox3.Lightbox.init() call.
          // The instance is stored in the module-scoped `lb` variable so it is
          // reachable from getLightbox(), open(), destroy() and messageHandler().
          _initLightbox();

          // Start the MutationObserver so that [data-lightbox] elements added
          // dynamically by other J1 modules (galleries, carousels, AJAX) are
          // automatically covered by the same Lightbox3 instance and options.
          _startDomObserver();

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
          // claude - J1 Adapter optimizations #1
          // clear safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END if pageVisible
      }, 10); // END dependencies_met_page_ready

      // claude - J1 Adapter optimizations #1
      // bound the page-ready poller. Previously, if `#content` never reached
      // `display: block` or j1.getState() never reached 'finished' (e.g. a
      // bug elsewhere in the boot sequence, an aborted navigation, an
      // extension hiding #content), this 10ms interval ran for the lifetime
      // of the tab. Cap it at 30s and log a warning so the failure mode is
      // visible in the console instead of silently burning CPU.
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('lightbox3 init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);

    }, // END init lightbox
