/*
 # -----------------------------------------------------------------------------
 # ~/lit3/js/lit-all.mjs
 # Lit (LitElement) is a library (from Google) for building fast,
 # lightweight web components.
 # Version V3.3.3
 #
 # Product/Info:
 # https://github.com/lit/lit
 #
 # Copyright (C) 2017 Goggle LLC
 #
 # Lit is licensed under BSD 3-Clause License
 # See: https://github.com/lit/lit/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE: imports everything: core plus most other modules in lit.
 #       Note that html and svg exports from lit/static-html.js are
 #       aliased to staticHtml and staticSvg, respectively, to avoid
 #       collision.
 #
 # NOTE:
 #        https://lit.dev/docs/getting-started/#use-bundles
 #        https://cdn.jsdelivr.net/gh/lit/dist/
 # -----------------------------------------------------------------------------
*/

import {
    LitElement,
    html,
    css,
    // plus decorators, directives, staticHtml, staticSvg, etc.
} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js';
