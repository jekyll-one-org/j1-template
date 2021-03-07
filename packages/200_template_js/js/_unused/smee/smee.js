/*
 # -----------------------------------------------------------------------------
 #  ~/js/smee/smee.js
 #  Provides J1 Template JavaScript Core functions
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://smee.io
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

const SmeeClient = require('smee-client');

const smee = new SmeeClient({
  source:   'https://smee.io/bzTe8lpQq1KeSJF',
  target:   'http://localhost:41000/events',
  logger:   console
});

const events = smee.start();

// Stop forwarding events
events.close();
