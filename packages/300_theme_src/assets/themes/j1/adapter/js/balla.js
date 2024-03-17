var dependencies_met_page_ready = setInterval (() => {
  var pageState      = $('#content').css("display");
  var pageVisible    = (pageState == 'block') ? true : false;
  var j1CoreFinished = (j1.getState() == 'finished') ? true : false;        

  if (j1CoreFinished && pageVisible) {
    startTimeModule = Date.now();

    _this.setState('started');
    logger.debug('\n' + 'set module state to: ' + _this.getState());
    logger.info('\n' + 'initializing module: started');

    {% for select in slim_select_settings.selects %} {% if select.enabled %}
    logger.debug('\n' + 'select is being initialized on id: ' + '{{select.id}}');

    var dependencies_met_wrapper_ready = setInterval (() => {
      var wrapperState = $('#{{select.wrapper_id}}').length;
      var wrapperReady = (wrapperState > 0) ? true : false;

      // process the wrapper if extsts
      if (wrapperReady) {
        logger.debug('\n' + 'select is being placed in wrapper on id: {{select.wrapper_id}}');

        // create|place select <div> element
        selectDIV           = document.createElement('div');
        selectHTML          = `{{select.items}}`;
        selectDIV.innerHTML = selectHTML;
        document.getElementById('{{select.wrapper_id}}').appendChild(selectDIV);

        // store the select HTML code into the adapter for later access
        _this.selectHTML.{{select.id}} = selectDIV;

        // setup new SlimSelect
        // jadams, 2024-03-06: setup events moved to page (test_icon_picker.adoc)
        logger.debug('\n' + 'select is being created on id: ' + '{{select.id}}');
        var $select_{{select.id}} = new SlimSelect ({
          select:                   'select[name ="{{select.name}}"]',
          settings: {
            showSearch:             slimSelectOptions.api_options.showSearch,
            searchPlaceholder:      slimSelectOptions.api_options.searchPlaceholder,
            searchText:             slimSelectOptions.api_options.searchText,
            searchingText:          slimSelectOptions.api_options.searchingText,
            searchHighlight:        slimSelectOptions.api_options.searchHighlight,
            closeOnSelect:          slimSelectOptions.api_options.closeOnSelect,
            contentPosition:        slimSelectOptions.api_options.contentPosition,
            openPosition:           slimSelectOptions.api_options.openPosition,
            placeholderText:        slimSelectOptions.api_options.placeholderText,
            allowDeselect:          slimSelectOptions.api_options.allowDeselect,
            hideSelected:           slimSelectOptions.api_options.hideSelected,
            showOptionTooltips:     slimSelectOptions.api_options.showOptionTooltips,
            minSelected:            slimSelectOptions.api_options.minSelected,
            maxSelected:            slimSelectOptions.api_options.maxSelected,
            timeoutDelay:           slimSelectOptions.api_options.timeoutDelay,
            maxValuesShown:         slimSelectOptions.api_options.maxValuesShown
          }
        });

        // store the select in the adapter for later access
        _this.select.{{select.id}} = $select_{{select.id}};

        logger.debug('\n' + 'initializing select finished on id: {{select.id}}');
      } else {
        logger.debug('\n' + 'wrapper not found for select id: {{select.wrapper_id}}');
      } // END if wrapperReady

      clearInterval(dependencies_met_wrapper_ready);

    }, 10);
    {% endif %} {% endfor %}
    // END (for) all selects          

    _this.setState('finished');
    logger.debug('\n' + 'state: ' + _this.getState());
    logger.info('\n' + 'initializing module: finished');

    endTimeModule = Date.now();
    logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');         

    clearInterval(dependencies_met_page_ready);
  } // END 'pageVisible'

}, 10);