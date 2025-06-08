/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/dailymotion/api/dailymotion.js
 # Dailymotion Javascript SDK
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) Dailymotion 2012-2024
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  Dailymotion Javascript SDK is licensed under MIT License.
 #  See: https://github.com/dailymotion/dailymotion-sdk-js/blob/master/LICENSE
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE:
 # Dailymotion does no longer support using this JS SDK for "Player"
 # integration and should only be used for interaction with the Data API
 # The Player can be embedded with any of our embed methods that can be
 # found at: https://developers.dailymotion.com/player.
 # -----------------------------------------------------------------------------
 # NOTE:
 # The LATEST Dailymotion SDK (2024-04-02) does NOT work. Changes of 2024
 # seems the API to break, most probably  for the  Sunset player API.
 # For now, the previous version of 2022-10-18 is used.
 #
 # See: https://developers.dailymotion.com/sdk/platform-sdk/javascript
 # See: https://github.com/dailymotion/dailymotion-sdk-js
 # -----------------------------------------------------------------------------
*/

/* Dailymotion Javascript SDK (J1 Version) - v2022-10-18 */

/**
 * This is the stock JSON2 implementation from www.json.org.
 *
 * Modifications include:
 * 1/ Removal of jslint settings
 *
 * @provides dm.thirdparty.json2
 */

/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides dm.prelude
 */

/**
 * Prelude.
 *
 *     Namespaces are one honking great idea -- let's do more of those!
 *                                                            -- Tim Peters
 *
 * The Prelude is what keeps us from being messy. In order to co-exist with
 * arbitary environments, we need to control our footprint. The one and only
 * rule to follow here is that we need to limit the globals we introduce. The
 * only global we should every have is ``dm``. This is exactly what the prelude
 * enables us to do.
 *
 * The main method to take away from this file is `DM.copy()`_. As the name
 * suggests it copies things. Its powerful -- but to get started you only need
 * to know that this is what you use when you are augmenting the DM object. For
 * example, this is skeleton for how ``DM.Event`` is defined::
 *
 *   DM.provide('Event', {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   });
 *
 * This is similar to saying::
 *
 *   DM.Event = {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   };
 *
 * Except it does some housekeeping, prevents redefinition by default and other
 * goodness.
 *
 * .. _DM.copy(): #method_DM.copy
 *
 * @class DM
 * @static
 * @access private
 */
if (!window.DM)
{
    DM =
    {
        // use the init method to set these values correctly
        _apiKey: null,
        _session: null,
        _userStatus: 'unknown', // or 'notConnected' or 'connected'
        _refreshRequested: false,
        _refreshCallbacks: [],
        _sessionLoadingMethod: null,

        // logging is enabled by default. this is the logging shown to the
        // developer and not at all noisy.
        _logging: true,

        _domain:
        {
            api: 'https://api.dailymotion.com',
            www: '//www.dailymotion.com',
            cdn: '//api.dmcdn.net'
        },
        _oauth:
        {
            logoutUrl: 'https://www.dailymotion.com/oauth/logout',
            authorizeUrl: 'https://www.dailymotion.com/oauth/authorize',
            tokenUrl: 'https://graphql.api.dailymotion.com/oauth/token'
        },

        /**
         * Copies things from source into target.
         *
         * @access private
         * @param target    {Object}  the target object where things will be copied
         *                            into
         * @param source    {Object}  the source object where things will be copied
         *                            from
         * @param overwrite {Boolean} indicate if existing items should be
         *                            overwritten
         * @param tranform  {function} [Optional], transformation function for
         *        each item
         */
        copy: function(target, source, overwrite, transform)
        {
            for (var key in source)
            {
                if (overwrite || typeof target[key] === 'undefined')
                {
                    target[key] = transform ? transform(source[key]) : source[key];
                }
            }
            return target;
        },

        /**
         * Create a namespaced object.
         *
         * @access private
         * @param name {String} full qualified name ('Util.foo', etc.)
         * @param value {Object} value to set. Default value is {}. [Optional]
         * @return {Object} The created object
         */
        create: function(name, value)
        {
            var node = window.DM, // We will use 'DM' as root namespace
                nameParts = name ? name.split('.') : [],
                c = nameParts.length;
            for (var i = 0; i < c; i++)
            {
                var part = nameParts[i];
                var nso = node[part];
                if (!nso)
                {
                    nso = (value && i + 1 == c) ? value : {};
                    node[part] = nso;
                }
                node = nso;
            }
            return node;
        },

        /**
         * Copy stuff from one object to the specified namespace that
         * is DM.<target>.
         * If the namespace target doesn't exist, it will be created automatically.
         *
         * @access private
         * @param target    {Object|String}  the target object to copy into
         * @param source    {Object}         the source object to copy from
         * @param overwrite {Boolean}        indicate if we should overwrite
         * @return {Object} the *same* target object back
         */
        provide: function(target, source, overwrite)
        {
            // a string means a dot separated object that gets appended to, or created
            return DM.copy
            (
                typeof target == 'string' ? DM.create(target) : target,
                source,
                overwrite
            );
        },

        /**
         * Generates a weak random ID.
         *
         * @access private
         * @return {String} a random ID
         */
        guid: function()
        {
            return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
        },

        /**
         * Logs a message for the developer if logging is on.
         *
         * @access private
         * @param args {Object} the thing to log
         */
        log: function(args)
        {
            if (DM._logging)
            {
//#JSCOVERAGE_IF 0
                if (window.Debug && window.Debug.writeln)
                {
                    window.Debug.writeln(args);
                }
                else if (window.console)
                {
                    window.console.log(args);
                }
//#JSCOVERAGE_ENDIF
            }

            // fire an event if the event system is available
            if (DM.Event)
            {
                DM.Event.fire('dm.log', args);
            }
        },

        /**
         * Logs an error message for the developer.
         *
         * @access private
         * @param args {Object} the thing to log
         */
        error: function(args)
        {
//#JSCOVERAGE_IF 0
            if (window.console)
            {
                window.console.error(args);
            }
//#JSCOVERAGE_ENDIF

            // fire an event if the event system is available
            if (DM.Event)
            {
                DM.Event.fire('dm.error', args);
            }
        },

        /**
         * Display a warning message in console.
         *
         * @access private
         * @param msg {string} message to warn in console
         */
        warn: function(msg)
        {
            try {
                if (console && typeof console.warn === 'function') {
                    console.warn(msg);
                }
            } catch (e) {}
        },

        /**
         * Shortcut for document.getElementById
         * @method $
         * @param {string} DOM id
         * @return DOMElement
         * @access private
         */
        $: function(element)
        {
            if (typeof element == "string")
            {
                element = document.getElementById(element);
            }
            return element;
        },

        parseBool: function(value)
        {
            if (value === true || value === false) return value;
            if (value === 0) return false;
            if (typeof value == 'string') return !value.match(/^(?:|false|no|off|0)$/i);
            return !!value;
        },

        type: function(obj)
        {
            if (!DM._class2type)
            {
                DM._class2type = {};
                var classes = 'Boolean Number String Function Array Date RegExp Object'.split(' ');
                for (var i = 0, l = classes.length; i < l; i++)
                {
                    var name = classes[i];
                    DM._class2type['[object ' + name + ']'] = name.toLowerCase();
                }
                DM._class2type['[object Undefined]'] = 'undefined';
            }
            return obj === null ? String(obj) : DM._class2type[Object.prototype.toString.call(obj)] || "object";
        }
    };
}
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides dm.json
 * @requires dm.prelude
 *           dm.thirdparty.json2
 */

/**
 * Simple wrapper around standard JSON to handle third-party library quirks.
 *
 * @class DM.JSON
 * @static
 * @access private
 */
DM.provide('JSON',
{
    /**
     * Stringify an object.
     *
     * @param obj {Object} the input object
     * @return {String} the JSON string
     */
    stringify: function(obj)
    {
        // PrototypeJS is incompatible with native JSON or JSON2 (which is what
        // native JSON is based on)
        if (window.Prototype && Object.toJSON)
        {
            return Object.toJSON(obj);
        }
        else
        {
            return JSON.stringify(obj);
        }
    },

    /**
     * Parse a JSON string.
     *
     * @param str {String} the JSON string
     * @param {Object} the parsed object
     */
    parse: function(str)
    {
        return JSON.parse(str);
    },

    /**
     * Flatten an object to "stringified" values only. This is useful as a
     * pre-processing query strings where the server expects query parameter
     * values to be JSON encoded.
     *
     * @param obj {Object} the input object
     * @return {Object} object with only string values
     */
    flatten: function(obj)
    {
        var flat = {};
        for (var key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                var value = obj[key];
                if (null === value || undefined === value)
                {
                    continue;
                }
                else if (typeof value == 'string')
                {
                    flat[key] = value;
                }
                else
                {
                    flat[key] = DM.JSON.stringify(value);
                }
            }
        }
        return flat;
    }
});
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides dm.array
 * @layer basic
 * @requires dm.prelude
 */

/**
 * Array related helper methods.
 *
 * @class dm.Array
 * @private
 * @static
 */
DM.provide('Array',
{
    /**
     * Get index of item inside an array. Return's -1 if element is not found.
     *
     * @param arr {Array} Array to look through.
     * @param item {Object} Item to locate.
     * @return {Number} Index of item.
     */
    indexOf: function (arr, item)
    {
        if (arr.indexOf)
        {
            return arr.indexOf(item);
        }
        var length = arr.length;
        if (length)
        {
            for (var index = 0; index < length; index++)
            {
                if (arr[index] === item)
                {
                    return index;
                }
            }
        }
        return -1;
    },

    /**
     * Merge items from source into target, but only if they dont exist. Returns
     * the target array back.
     *
     * @param target {Array} Target array.
     * @param source {Array} Source array.
     * @return {Array} Merged array.
     */
    merge: function(target, source)
    {
        for (var i = 0; i < source.length; i++)
        {
            if (DM.Array.indexOf(target, source[i]) < 0)
            {
                target.push(source[i]);
            }
        }
        return target;
    },

    /**
     * flatten arrays of strings in obj to one string concatenated with comma.
     *
     * @param arr {Object} Object to flatten.
     * @return {Object} Flattened object.
     */
    flatten: function(obj)
    {
        for (var param in obj)
        {
            if (obj.hasOwnProperty(param))
            {
                if (DM.type(obj[param]) == 'array')
                {
                    obj[param] = obj[param].join(',');
                }
            }
        }
        return obj;
    },

    /**
     * Create an new array from the given array and a filter function.
     *
     * @param arr {Array} Source array.
     * @param fn {Function} Filter callback function.
     * @return {Array} Filtered array.
     */
    filter: function(arr, fn)
    {
        var b = [];
        for (var i = 0; i < arr.length; i++)
        {
            if (fn(arr[i]))
            {
                b.push(arr[i]);
            }
        }
        return b;
    },

    /**
     * Create an array from the keys in an object.
     *
     * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
     *
     * @param obj {Object} Source object.
     * @param proto {Boolean} Specify true to include inherited properties.
     * @return {Array} The array of keys.
     */
    keys: function(obj, proto)
    {
        var arr = [];
        for (var key in obj)
        {
            if (proto || obj.hasOwnProperty(key))
            {
                arr.push(key);
            }
        }
        return arr;
    },

    /**
     * Create an array by performing transformation on the items in a source
     * array.
     *
     * @param arr {Array} Source array.
     * @param transform {Function} Transformation function.
     * @return {Array} The transformed array.
     */
    map: function(arr, transform)
    {
        var ret = [];
        for (var i = 0; i < arr.length; i++)
        {
            ret.push(transform(arr[i]));
        }
        return ret;
    },

    /**
     * For looping through Arrays and Objects.
     *
     * @param {Object} item   an Array or an Object
     * @param {Function} fn   the callback function for iteration.
     *    The function will be pass (value, [index/key], item) paramters
     * @param {Bool} proto  indicate if properties from the prototype should
     *                      be included
     *
     */
    forEach: function(item, fn, proto)
    {
        if (!item)
        {
            return;
        }

        if (Object.prototype.toString.apply(item) === '[object Array]'
            || (!(item instanceof Function) && typeof item.length == 'number'))
        {
            if (item.forEach)
            {
                item.forEach(fn);
            }
            else
            {
                for (var i = 0, l = item.length; i < l; i++)
                {
                    fn(item[i], i, item);
                }
            }
        }
        else
        {
            for (var key in item)
            {
                if (proto || item.hasOwnProperty(key))
                {
                    fn(item[key], key, item);
                }
            }
        }
    }
});
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides dm.cookie
 * @requires dm.prelude
 *           dm.qs
 */

/**
 * Cookie Support.
 *
 * @class DM.Cookie
 * @static
 * @access private
 */
DM.provide('Cookie',
{
    /**
     * Holds the base_domain property to match the Cookie domain.
     *
     * @access private
     * @type String
     */
    _domain: null,

    /**
     * Indicate if Cookie support should be enabled.
     *
     * @access private
     * @type Boolean
     */
    _enabled: false,

    /**
     * Enable or disable Cookie support.
     *
     * @access private
     * @param val {Boolean} true to enable, false to disable
     */
    setEnabled: function(val)
    {
        DM.Cookie._enabled = val;
    },

    /**
     * Return the current status of the cookie system.
     *
     * @access private
     * @returns {Boolean} true if Cookie support is enabled
     */
    getEnabled: function()
    {
        return DM.Cookie._enabled;
    },

    /**
     * Return a cookie key value pair.
     *
     * @access private
     * @returns {Object} with cookie key and value
     */
    getKeyValuePair: function(cookieStr) {
        var separatorIndex = cookieStr.indexOf('=');

        // IE omits the "=" when the cookie value is an empty string
        separatorIndex = separatorIndex < 0 ? cookieStr.length : separatorIndex;

        var key = cookieStr.substr(0, separatorIndex);
        var value = cookieStr.substr(separatorIndex + 1);
        var decodedKey;
        var decodedValue;

        try {
          decodedKey = decodeURIComponent(key);
        } catch(e) {
          console.error('Could not decode cookie key: ' + key);
        }

        try {
          decodedValue = decodeURIComponent(value);
        } catch(e) {
          console.error('Could not decode cookie value: ' + value);
        }

        return {
          key: decodedKey,
          value: decodedValue
        };
    },

    getCookieValue: function(key)
    {
        var nameEQ = key + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
    },

    /**
     * Try loading the session from the Cookie.
     *
     * @access private
     * @return {Object} the session object from the cookie if one is found
     */
    load: function()
    {
        var cookiesArr = document.cookie.split('; ');
        var dmCookie, session;

        DM.Array.forEach(cookiesArr, function(cookie) {
            var keyValuePair = DM.Cookie.getKeyValuePair(cookie);

            if(keyValuePair.key.match('dms_' + DM._apiKey)) {
                // DM cookie's value has quotes around it, remove them
                keyValuePair.value = keyValuePair.value.replace(/^"(.+(?="$))"$/, '$1');
                dmCookie = keyValuePair;
            }
        });

        if(dmCookie) {
            // url encoded session stored as "sub-cookies"
            session = DM.QS.decode(dmCookie.value);
            // decodes as a string, convert to a number
            session.expires = parseInt(session.expires, 10);
            // capture base_domain for use when we need to clear
            DM.Cookie._domain = session.base_domain;
        }

        return session;
    },

    /**
     * Helper function to set cookie value.
     *
     * @access private
     * @param val    {String} the string value (should already be encoded)
     * @param ts     {Number} a unix timestamp denoting expiry
     * @param domain {String} optional domain for cookie
     */
    setRaw: function(val, ts, domain)
    {
        var safeValue = (val + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);

        document.cookie = 'dms_' + DM._apiKey + '="' + safeValue + '"'
                        + (safeValue && ts == 0 ? '' : '; expires=' + new Date(ts * 1000).toGMTString())
                        + '; path=/'
                        + (domain && domain !== 'localhost' ? '; domain=.' + domain : '');

        // capture domain for use when we need to clear
        DM.Cookie._domain = domain;
    },

    setNeonCookies: function (accessToken, refreshToken, expiresIn)
    {
        if (typeof expiresIn === 'undefined') {
            return;
        }

        var expires = new Date();
        expires.setSeconds(expires.getSeconds() + expiresIn);
        var longerDate = new Date(expires.getTime());
        var longerExpiration = longerDate.setSeconds(longerDate.getSeconds() + 3600 * 24 * 30 * 3); // 3 months

        if (accessToken) {
            document.cookie = 'access_token=' + accessToken
                + '; expires=' + new Date(expires).toUTCString()
                + '; path=/';
        }

        if (refreshToken) {
            document.cookie = 'refresh_token=' + refreshToken
                + '; expires=' + new Date(longerExpiration).toUTCString()
                + '; path=/';
        }
    },

    /**
     * Set the cookie using the given session object.
     *
     * @access private
     * @param session {Object} the session object
     */
    set: function(session)
    {
        if (session)
        {
            DM.Cookie.setRaw(DM.QS.encode(session), session.expires, session.base_domain);
        }
        else
        {
            DM.Cookie.clear();
        }
    },

    /**
     * Clear the cookie.
     *
     * @access private
     */
    clear: function()
    {
        DM.Cookie.setRaw('', 0, DM.Cookie._domain);
    }
});
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides dm.event
 * @requires dm.prelude dm.array
 */

// NOTE: We tag this as DM.Event even though it is actually DM.EventProvider to
// work around limitations in the documentation system.
/**
 * Event handling mechanism for globally named events.
 *
 * @static
 * @class DM.Event
 */
DM.provide('EventProvider',
{
    /**
     * Returns the internal subscriber array that can be directly manipulated by
     * adding/removing things.
     *
     * @access private
     * @return {Object}
     */
    subscribers: function()
    {
        // this odd looking logic is to allow instances to lazily have a map of
        // their events. if subscribers were an object literal itself, we would
        // have issues with instances sharing the subscribers when its being used
        // in a mixin style.
        if (!this._subscribersMap)
        {
            this._subscribersMap = {};
        }
        return this._subscribersMap;
    },

    /**
     * Subscribe to a given event name, invoking your callback function whenever
     * the event is fired.
     *
     * For example, suppose you want to get notified whenever the session
     * changes:
     *
     *     DM.Event.subscribe('auth.sessionChange', function(response) {
     *       // do something with response.session
     *     });
     *
     * Global Events:
     *
     * - auth.login -- fired when the user logs in
     * - auth.logout -- fired when the user logs out
     * - auth.sessionChange -- fired when the session changes
     * - auth.statusChange -- fired when the status changes
     *
     * @access public
     * @param name {String} Name of the event.
     * @param cb {Function} The handler function.
     */
    subscribe: function(name, cb)
    {
        var subs = this.subscribers();

        if (!subs[name])
        {
            subs[name] = [cb];
        }
        else
        {
            subs[name].push(cb);
        }
    },

    /**
     * Removes subscribers, inverse of [DM.Event.subscribe](DM.Event.subscribe).
     *
     * Removing a subscriber is basically the same as adding one. You need to
     * pass the same event name and function to unsubscribe that you passed into
     * subscribe. If we use a similar example to
     * [DM.Event.subscribe](DM.event.subscribe), we get:
     *
     *     var onSessionChange = function(response) {
     *       // do something with response.session
     *     };
     *     DM.Event.subscribe('auth.sessionChange', onSessionChange);
     *
     *     // sometime later in your code you dont want to get notified anymore
     *     DM.Event.unsubscribe('auth.sessionChange', onSessionChange);
     *
     * @access public
     * @param name {String} Name of the event.
     * @param cb {Function} The handler function.
     */
    unsubscribe: function(name, cb)
    {
        var subs = this.subscribers()[name];

        DM.Array.forEach(subs, function(value, key)
        {
            if (value == cb)
            {
                subs[key] = null;
            }
        });
    },

    /**
     * Repeatedly listen for an event over time. The callback is invoked
     * immediately when monitor is called, and then every time the event
     * fires. The subscription is canceled when the callback returns true.
     *
     * @access private
     * @param {string} name Name of event.
     * @param {function} callback A callback function. Any additional arguments
     * to monitor() will be passed on to the callback. When the callback returns
     * true, the monitoring will cease.
     */
    monitor: function(name, callback)
    {
        if (!callback())
        {
            var ctx = this,
                fn = function()
                {
                    if (callback.apply(callback, arguments))
                    {
                        ctx.unsubscribe(name, fn);
                    }
                };

            this.subscribe(name, fn);
        }
    },

    /**
     * Removes all subscribers for named event.
     *
     * You need to pass the same event name that was passed to DM.Event.subscribe.
     * This is useful if the event is no longer worth listening to and you
     * believe that multiple subscribers have been set up.
     *
     * @access private
     * @param name    {String}   name of the event
     */
    clear: function(name)
    {
        delete this.subscribers()[name];
    },

    /**
     * Fires a named event. The first argument is the name, the rest of the
     * arguments are passed to the subscribers.
     *
     * @access private
     * @param name {String} the event name
     */
    fire: function()
    {
        var args = Array.prototype.slice.call(arguments),
            name = args.shift();

        DM.Array.forEach(this.subscribers()[name], function(sub)
        {
            // this is because we sometimes null out unsubscribed rather than jiggle
            // the array
            if (sub)
            {
                sub.apply(this, args);
            }
        });
    }
});

/**
 * Event handling mechanism for globally named events.
 *
 * @class DM.Event
 * @extends DM.EventProvider
 */
DM.provide('Event', DM.EventProvider);
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * JavaScript library providing Dailymtion API integration.
 *
 * @provides dm.init
 * @requires dm.prelude
 *           dm.auth
 *           dm.api
 *           dm.cookie
 */

/**
 * This is the top level for all the public APIs.
 *
 * @class DM
 * @static
 * @access public
 */
DM.provide('',
{
    init: function(options)
    {
        // only need to list values here that do not already have a falsy default.
        // this is why cookie/session/status are not listed here.
        options = DM.copy(options || {},
        {
            logging: true
        });

        DM._apiKey = options.apiKey;

        // disable logging if told to do so, but only if the url doesnt have the
        // token to turn it on. this allows for easier debugging of third party
        // sites even if logging has been turned off.
        if (!options.logging && window.location.toString().indexOf('dm_debug=1') < 0)
        {
            DM._logging = false;
        }

        if (DM._apiKey)
        {
            // store the API secret key if provided. This allow the SDK to perform refresh token queries
            DM._apiSecret = options.apiSecret || null;

            // enable cookie support if told to do so
            DM.Cookie.setEnabled(options.cookie);

            DM.Auth.readFragment();

            var session;

            var siteSession = DM.Auth.loadSiteSession();
            if (null !== siteSession.session) {
                session = siteSession.session;
                DM._sessionLoadingMethod = siteSession.loading_method;
            } else if (options.session) {
                // if an explicit session was not given, or is not already loaded, try to _read_ an existing cookie.
                // we dont enable writing automatically, but we do read automatically.
                session = options.session;
                DM._sessionLoadingMethod = 'init_options';
            } else if (DM.Auth._receivedSession) {
                session = DM.Auth._receivedSession;
                DM._sessionLoadingMethod = 'fragment';
            } else {
                session = DM.Cookie.load();
                DM._sessionLoadingMethod = 'local_cookies';
            }

            if (null !== session && DM.Auth.isSessionExpired(session)) {
                DM.Auth.refreshToken(session, function() {
                    if (options.status)
                    {
                        DM.getLoginStatus();
                    }
                });
            } else {
                DM.Auth.setSession(session, session ? 'connected' : 'unknown');
            }

            // load a fresh session if requested
            if (options.status)
            {
                DM.getLoginStatus();
            }
        }
    }
});,// this is useful when the library is being loaded asynchronously
//
// we do it in a setTimeout to wait until the current event loop as finished.
// this allows potential library code being included below this block (possible
// when being served from an automatically combined version)
window.setTimeout(function() { if (window.dmAsyncInit) { dmAsyncInit(); }}, 0);
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides dm.qs
 * @requires dm.prelude dm.array
 */

/**
 * Query String encoding & decoding.
 *
 * @class DM.QS
 * @static
 * @access private
 */
DM.provide('QS',
{
    /**
     * Encode parameters to a query string.
     *
     * @access private
     * @param   params {Object}  the parameters to encode
     * @param   sep    {String}  the separator string (defaults to '&')
     * @param   encode {Boolean} indicate if the key/value should be URI encoded
     * @return         {String}  the query string
     */
    encode: function(params, sep, encode)
    {
        sep = sep === undefined ? '&' : sep;
        encode = encode === false ? function(s) {return s;} : encodeURIComponent;

        var pairs = [];
        DM.Array.forEach(params, function(val, key)
        {
            if (val !== null && typeof val != 'undefined')
            {
                pairs.push(encode(key) + '=' + encode(val));
            }
        });
        pairs.sort();
        return pairs.join(sep);
    },

    /**
     * Decode a query string into a parameters object.
     *
     * @access private
     * @param   str {String} the query string
     * @return      {Object} the parameters to encode
     */
    decode: function(str)
    {
        var qsParams = str.split('&');
        var decode = decodeURIComponent;

        var params = {};

        for(var index = 0; index < qsParams.length; index += 1) {
            var delimiterIndex = qsParams[index].indexOf('=');
            if (delimiterIndex < 1 ) {
                continue;
            }

            // Get a list of keys and a value from a "depth1[depth2][depth3]=value" string
            var keyList = decode(qsParams[index].substring(0, delimiterIndex)).replace(/\]/g, '').split('[');
            var value = decode(qsParams[index].substring(delimiterIndex + 1));

            // Recursively create all the intermediate objects from the keys list,
            // and set the value when done
            var destinationParam = params;
            while (keyList.length > 0) {
                var keyItem = keyList.shift();
                if (keyList.length === 0) {
                    if (keyItem.length === 0) {
                       destinationParam.push(value);
                    }
                    else {
                        destinationParam[keyItem] = value;
                    }
                }
                else if (typeof destinationParam[keyItem] === 'undefined') {
                    destinationParam[keyItem] = keyList[0].length === 0 ? [] : {};
                }
                destinationParam = destinationParam[keyItem];
            }
        }

        return params;
    }
});
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Contains the public method ``DM.api`` and the internal implementation
 * ``DM.ApiServer``.
 *
 * @provides dm.api
 * @requires dm.prelude
 *           dm.qs
 *           dm.json
 *           dm.array
 */

/**
 * API calls.
 *
 * @class DM
 * @static
 * @access private
 */
DM.provide('',
{
    api: function()
    {
        DM.ApiServer.call.apply(DM.ApiServer, arguments);
    }
});

/**
 * API call implementations.
 *
 * @class DM.ApiServer
 * @access private
 */
DM.provide('ApiServer',
{
    type: null,
    METHODS: ['get', 'post', 'delete'],
    _callbacks: {},
    _calls: [],

    /**
     * Make a API call to Dailymotion's RESTful API.
     *
     * Except the path, all arguments to this function are optional. So any of
     * these are valid:
     *
     *   DM.api('/me') // throw away the response
     *   DM.api('/me', function(r) { console.log(r) })
     *   DM.api('/me', { fields: 'email' }); // throw away response
     *   DM.api('/me', { fields: 'email' }, function(r) { console.log(r) });
     *   DM.api('/12345678', 'delete', function(r) { console.log(r) });
     *   DM.api(
     *     '/me/feed',
     *     'post',
     *     { body: 'hi there' },
     *     function(r) { console.log(r) }
     *   );
     *
     * @access private
     * @param path   {String}   the url path
     * @param method {String}   the http method
     * @param params {Object}   the parameters for the query
     * @param cb     {Function} the callback function to handle the response
     * @param immediate {Boolean} the trigger for an immediate call if needed
     */
    call: function()
    {
        var args = Array.prototype.slice.call(arguments),
            path = args.shift(),
            next = args.shift(),
            method,
            params,
            cb,
            immediate = false;

        while (typeof next !== 'undefined')
        {
            var type = typeof next;
            if (type === 'string' && !method)
            {
                method = next.toLowerCase();
            }
            else if (type === 'function' && !cb)
            {
                cb = next;
            }
            else if (type === 'object' && !params)
            {
                params = DM.ApiServer.formatCallParams(next);
            }
            else if (type === 'boolean' && !immediate)
            {
                immediate = next;
            }
            else
            {
                DM.log('Invalid argument passed to DM.api(): ' + next);
                return;
            }
            next = args.shift();
        }

        method = method || 'get';
        params = params || {};

        // remove prefix slash if one is given, as it's already in the base url
        if (path[0] === '/')
        {
            path = path.substr(1);
        }

        if (DM.Array.indexOf(DM.ApiServer.METHODS, method) < 0)
        {
            DM.log('Invalid method passed to DM.api(): ' + method);
            return;
        }

        DM.ApiServer.transport(path, method, params, cb, immediate);
    },

    /**
     * Format some params for the API.
     *
     * All params will be taken as is except params.fields and params.subrequest.
     * params.fields is stringified if an array is provided to support nested request
     * params.subrequest is stringified if an object is provided and added to params.fields
     *
     *  Ex:
     *      params.fields = ['id', 'title', 'description'] becomes params.fields = 'id,title,description'
     *  Ex:
     *      params.subrequest = {
     *        'videos': {
     *            fields: ['thumbnail_120_url', 'title'],
     *            limit: 4
     *        }
     *    is added to params.fields like this:
     *        params.fields = 'id,title,description,videos.fields(thumbnail_120_url,title).limit(4)'
     *
     * @access private
     * @param params {Object}   the call parameters
     */
    formatCallParams: function(params)
    {
        var subRequests = params.subrequests,
            subRequestsParams = [],
            subRequestsStr = '';

        if (subRequests)
        {
            var subRequestsType = DM.type(subRequests);

            if (subRequestsType == 'object')
            {
                for (fieldName in subRequests)
                {
                    var subRequest = subRequests[fieldName],
                        subRequestParams = [];

                    subRequestParams.push(fieldName + '.fields(' + (subRequest.fields || []).join(',') + ')');

                    delete(subRequest.fields);

                    for (subRequestParam in subRequest)
                    {
                        subRequestParams.push(subRequestParam + '(' + subRequest[subRequestParam] + ')');
                    }

                    if (subRequestParams.length)
                    {
                        subRequestsParams.push(subRequestParams.join('.'));
                    }
                }
            }
            else
            {
                throw new Error('Unexpected type "' + subRequestsType + '" for "subrequests" parameter. Expected type: object');
            }

            delete(params.subrequests);
        }

        if (subRequestsParams.length)
        {
            subRequestsStr = subRequestsParams.join(',');
        }

        // Fix for nested request in multicall
        if (params.fields)
        {
            var fieldsType = DM.type(params.fields);

            if (fieldsType == 'array')
            {
                params.fields.push(subRequestsStr);
                params.fields = params.fields.join(',');
            }
            else if (fieldsType == 'string')
            {
                if (params.fields.length)
                {
                    params.fields += ',' + subRequestsStr;
                }
                else
                {
                    params.fields = subRequestsStr;
                }
            }
            else
            {
                throw new Error('Unexpected type "' + fieldsType + '"  for "fields" parameter, Allowed types: array, string');
            }
        }
        else if (subRequestsStr)
        {
            params.fields = subRequestsStr;
        }

        return params;
    },

    getSimpleCallURL: function(path, params)
    {
        var encodedParams = DM.QS.encode(params),
            urlQueryParams = encodedParams.length ? (path.indexOf('?') > -1 ? '&' : '?') + encodedParams : '';

        return DM._domain.api + '/' + path + urlQueryParams;
    },

    transport: function(path, method, params, cb, immediate)
    {
        try
        {
            // throw new Error();
            DM.ApiServer.xhr();
            DM.ApiServer.transport = DM.ApiServer.ajax;
            DM.ApiServer.type = 'ajax';
        }
        catch (e)
        {
            DM.ApiServer.transport = DM.ApiServer.jsonp;
            DM.ApiServer.type = 'jsonp';
        }

        DM.ApiServer.transport(path, method, params, cb, immediate);
    },

    /**
     * Basic JSONP Support.
     *
     * @access private
     * @param path   {String}   the request path
     * @param method {String}   the http method
     * @param params {Object}   the parameters for the query
     * @param cb     {Function} the callback function to handle the response
     */
    jsonp: function(path, method, params, cb)
    {
        var g = DM.guid(),
            script = document.createElement('script'),
            callTimeout,
            timeout = 5; // 5 secs

        // jsonp needs method overrides as the request itself is always a GET
        params.method = method;
        params.callback = 'DM.ApiServer._callbacks.' + g;

        var session = DM.getSession();

        // add oauth token if we have one
        if (session && session.access_token && !params.access_token)
        {
            params.access_token = session.access_token;
        }

        params = DM.Array.flatten(params);

        var url = DM.ApiServer.getSimpleCallURL(path, params);

        if (url.length > 2000)
        {
            throw new Error('JSONP only support a maximum of 2000 bytes of input.');
        }

        // this is the JSONP callback invoked by the response
        DM.ApiServer._callbacks[g] = function(response)
        {
            if(cb) cb(response);
            delete DM.ApiServer._callbacks[g];
            script.src = null;
            script.parentNode.removeChild(script);
            if (callTimeout)
            {
                clearTimeout(callTimeout);
                callTimeout = null;
            }
        };

        script.async = true;
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);

        // Only way to report error about script loading - we use a timeout at 5 secs.
        callTimeout = setTimeout(function()
        {
            DM.ApiServer._callbacks[g]({error: {code: 500, message: 'The request has timed out', type: 'transport_error'}});
        }, timeout * 1000);
    },

    /**
     * CORS Ajax Support
     *
     * @access private
     * @param path   {String}   the request path
     * @param method {String}   the http method
     * @param params {Object}   the parameters for the query
     * @param cb     {Function} the callback function to handle the response
     * @param immediate {Boolean} the trigger for an immediate call if needed
     */
    ajax: function(path, method, params, cb, immediate)
    {
        var call = {path: path, method: method, params: params, cb: cb};

        if(!immediate)
        {
            DM.ApiServer._calls.push(call);
            DM.ApiServer.ajaxHandleQueue();
        }
        else
        {
            DM.ApiServer.performSimpleCall(path, method, params, cb);
        }
    },

    ajaxHandleQueue: function()
    {
        if (!DM.ApiServer._callTimeout && DM.ApiServer._calls.length > 0)
        {
            DM.ApiServer._callTimeout = setTimeout(function()
            {
                DM.ApiServer.performMultipleCalls(DM.ApiServer._calls);
                DM.ApiServer._calls = [];
                delete DM.ApiServer._callTimeout;
            }, 0);
        }
        else if (DM.ApiServer._calls.length == 10)
        {
            // Limit of 10 calls per request reached, unqueue immediatly
            if (DM.ApiServer._callTimeout)
            {
                clearTimeout(DM.ApiServer._callTimeout);
                delete DM.ApiServer._callTimeout;
            }
            DM.ApiServer.performMultipleCalls(DM.ApiServer._calls);
            DM.ApiServer._calls = [];
        }
    },

    performSimpleCall: function(path, method, params, cb)
    {
        if (DM._session && DM.Auth.isSessionExpired()) {
            // If the session is expired
            DM.Auth.refreshToken(DM._session, function (result) {
                if (result.error) {
                    if (cb)
                    {
                        cb(result);
                    }
                    return;
                }
                DM.ApiServer.performSimpleCall(path, method, params, cb);
            });
            return;
        }

        var session = DM.getSession();
        // add oauth token if we have one
        if (session && session.access_token && !params.access_token)
        {
            params.access_token = session.access_token;
        }

        params = DM.Array.flatten(params);

        var url = DM.ApiServer.getSimpleCallURL(path, params);

        var xhr = DM.ApiServer.xhr();
        xhr.open(method, url);
        // Lie on Content-Type to prevent from CORS preflight check
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send();

        xhr.onreadystatechange = function()
        {
            if (xhr.readyState == 4)
            {
                var globalError = {error: {code: 500, message: 'Invalid server response', type: 'transport_error'}},
                    response;

                if (xhr.status)
                {
                    try
                    {
                        response = DM.JSON.parse(xhr.responseText);
                    } catch(e) {}
                }

                if (DM.type(response) != 'object')
                {
                    response = globalError;
                    DM.error('Cannot parse call response data ' + xhr.responseText);
                }

                if (cb)
                {
                    cb(response);
                }
            }
        };
    },
    performMultipleCalls: function(calls)
    {
        var multicall = [],
            endpoint = DM._domain.api;

        for (var i = 0, l = calls.length; i < l; i++)
        {
            var call = calls[i];
            multicall.push
            ({
                call: call.method.toUpperCase() + ' /' + call.path,
                args: call.params,
                id: i
            });
        }

        if (DM._session && DM.Auth.isSessionExpired()) {
            // If the session is expired
            DM.Auth.refreshToken(DM._session, function (result) {
                if (result.error) {
                    DM.Array.forEach(calls, function(call)
                    {
                        if (call && call.cb)
                        {
                            call.cb(result);
                        }
                    });

                    return;
                }
                DM.ApiServer.performMultipleCalls(calls);
            });
            return;
        }

        var session = DM.getSession();
        // add oauth token if we have one
        if (session && session.access_token)
        {
            endpoint += '?access_token=' + encodeURIComponent(session.access_token);
        }

        var xhr = DM.ApiServer.xhr();
        xhr.open('POST', endpoint);
        // Lie on Content-Type to prevent from CORS preflight check
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(DM.JSON.stringify(multicall));

        xhr.onreadystatechange = function()
        {
            if (xhr.readyState == 4)
            {
                var globalError = {error: {code: 500, message: 'Invalid server response', type: 'transport_error'}},
                    responses;

                if (xhr.status)
                {
                    try
                    {
                        responses = DM.JSON.parse(xhr.responseText);
                    } catch(e) {}
                }

                var responseType = DM.type(responses);

                if (responseType == 'array')
                {
                    for (var i = 0, l = responses.length; i < l; i++)
                    {
                        var response = responses[i];
                            call = 'id' in response && calls[response.id] ? calls[response.id] : null;

                        if (!call)
                        {
                            DM.error('Response with no valid call id: ' + DM.JSON.stringify(response));
                            continue;
                        }

                        if (call.cb)
                        {
                            if ('result' in response)
                            {
                                call.cb(response.result);
                            }
                            else if ('error' in response)
                            {
                                call.cb({error: response.error}); // cleans the call id or other unwanted stuff
                            }
                            else
                            {
                                call.cb({error: {code: 500, message: 'Missing result or error key', type: 'transport_error'}});
                            }
                        }
                        calls[response.id] = null;
                    }
                }
                else if (responseType == 'object' && 'error' in responses)
                {
                    // Global error
                    globalError = responses;
                }
                else
                {
                    DM.error('Cannot parse multicall response data ' + xhr.responseText);
                }

                DM.Array.forEach(calls, function(call)
                {
                    if (call && call.cb)
                    {
                        call.cb(globalError);
                    }
                });
            }
        };
    },

    xhr: function()
    {
        var xhr = new window.XMLHttpRequest();
        if (!('withCredentials' in xhr))
        {
            // Doesn't support CORS
            throw new Error('Browser is not CORS capable');
        }
        return xhr;
    }
});
,/**
 * Highly inspired from Facebook connect JS SDK available at https://github.com/facebook/connect-js
 *
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides dm.auth
 * @requires dm.prelude
 *           dm.qs
 *           dm.event
 *           dm.json
 *           dm.api
 */

/**
 * Authentication, Authorization & Sessions.
 *
 * @class dm
 * @static
 * @access private
 */
DM.provide('',
{
    getLoginStatus: function(cb)
    {
        if (cb)
        {
            DM.Auth.refreshToken(DM._session, function (session) {
                cb({status: DM._userStatus, session: session});
            });
        }
    },

    getSession: function()
    {
        if (DM.Auth.isSessionExpired())
        {
            DM.Auth.setSession(null, 'notConnected');
        }

        return DM._session;
    },

    login: function(cb, opts)
    {
        // we try to place it at the center of the current window
        var screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
            screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
            outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.documentElement.clientWidth,
            outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.documentElement.clientHeight - 22), // 22 = IE toolbar height
            width = 500,
            height = 520,
            left = parseInt(screenX + ((outerWidth - width) / 2), 10),
            top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
            features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',status,scrollbars=yes';

        opts = DM.copy(opts || {},
        {
            client_id: DM._apiKey,
            response_type: 'token',
            display: 'popup',
            scope: '',
            redirect_uri: document.location.href,
            state: 'dmauth_' + DM.guid()
        });

        if (opts.display === 'popup')
        {
            var win = window.open(DM._oauth.authorizeUrl + '?' + DM.QS.encode(opts), 'dmauth', features);

            DM.Auth._active[opts.state] = {cb: cb ? cb : function() {}, win: win};
            DM.Auth._popupMonitor();
        }
        else
        {
            location.href = DM._oauth.authorizeUrl + '?' + DM.QS.encode(opts);
        }
    },

    logout: function(cb)
    {
        var endpoint = DM._oauth.logoutUrl;
        var session = DM.getSession();
        var parameters = [];
        var scriptID = 'dm_l_o_sc';
        var callbackName;

        if (session && session.access_token)
        {
            parameters.push('access_token=' + encodeURIComponent(session.access_token));
            callbackName = '_' + session.access_token + '_logout';
            window[callbackName] = function(jsonResponse)
            {
                if (DM.type(jsonResponse) == 'array' && !jsonResponse.length)
                {
                    // {} is provided to cb to maintain retro-compat with previous result of https://api.dailymotion.com/logout
                    cb({});
                    DM.Auth.setSession(null, 'notConnected');
                }
                else
                {
                    cb(jsonResponse);
                }

                window[callbackName] = null;
            };
            parameters.push('callback=' + callbackName);
        }

        var sc = document.getElementById(scriptID);

        if (sc)
        {
            sc.parentNode.removeChild(sc);
        }

        sc = document.createElement('script');
        sc.type = 'text/javascript';
        sc.id = scriptID;
        document.body.appendChild(sc);
        sc.src = endpoint + (parameters.length ? ('?' + parameters.join('&')) : '');
    }
});

/**
 * Internal Authentication implementation.
 *
 * @class DM.Auth
 * @static
 * @access private
 */
DM.provide('Auth',
{
    _active: {},
    _receivedSession: null,

    /**
     * If SDK is loaded on DM's site, use current site's session
     */
    loadSiteSession: function()
    {
        var emptySession = true;
        var session = {};
        var result = {
            session: null,
            loading_method: null
        };

        if (window.location.host.match(/dailymotion\.com$/))
        {
            var sidCookieValue = DM.Cookie.getCookieValue('sid');
            var accessTokenCookieValue = DM.Cookie.getCookieValue('access_token');
            var refreshTokenCookieValue = DM.Cookie.getCookieValue('refresh_token');

            if (refreshTokenCookieValue) {
                session.refresh_token = refreshTokenCookieValue;
                emptySession = false;
            }

            var loadingMethod = 'neon_cookie';
            if (accessTokenCookieValue)
            {
                session.access_token = accessTokenCookieValue;
                emptySession = false;
            }

            if (!refreshTokenCookieValue && !accessTokenCookieValue && sidCookieValue)
            {
                session.access_token = sidCookieValue;
                loadingMethod = 'sid_cookie';
                emptySession = false;
            }

            if (refreshTokenCookieValue && !session.access_token) {
                // If the refresh cookie was found but not the access_token, this means
                // that the access_token is probably expired (since the access_token cookie is probably absent
                // due to it's passed expiration date)
                // We then explicitly forced the expiration here
                session.expires = Math.round(new Date().getTime() / 1000) - 10;
            }
        }

        if (!emptySession) {
            result.session = session;
            result.loading_method = loadingMethod;
        }

        return result;
    },

    refreshToken: function(session, cb)
    {
        cb  = cb || function() {};

        DM._refreshCallbacks.push(cb);

        if (DM._refreshRequested) {
            return;
        }

        DM._refreshRequested = true;

        var callCallbacks = function(result) {
            while(DM._refreshCallbacks.length > 0) {
                var cb = DM._refreshCallbacks.pop();
                cb(result);
            }
            DM._refreshRequested = false;
        };

        if (!DM.Auth.isSessionExpired(session)) {
            callCallbacks(session);
            return;
        }

        if (DM._apiKey && DM._apiSecret && session && session.refresh_token) {
            var xhr = DM.ApiServer.xhr();

            var params = {
                'grant_type': 'refresh_token',
                'client_id': DM._apiKey,
                'client_secret': DM._apiSecret,
                'refresh_token': session.refresh_token
            };

            var encodedParams = DM.QS.encode(params);

            xhr.open('POST', DM._oauth.tokenUrl);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(encodedParams);

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var globalError = {error: {code: 500, message: 'Invalid server response', type: 'transport_error'}},
                        response;

                    if (xhr.status)
                    {
                        try
                        {
                            response = DM.JSON.parse(xhr.responseText);
                        } catch(e) {}
                    }

                    if (DM.type(response) != 'object')
                    {
                        response = globalError;
                        DM.error('Cannot parse call response data ' + xhr.responseText);
                    }
                    if (xhr.status && xhr.status !== 200)
                    {
                        response = globalError;
                    }

                    var newSession = response.access_token ? response : null;
                    DM.Auth.setSession(newSession, newSession ? 'connected' : 'notConnected');

                    callCallbacks(response);
                }
            };
        } else {
            callCallbacks(session);
        }
    },

    /**
     * Check if session info are present in the URL fragment
     *
     * @access private
     */
    readFragment: function()
    {
        var h = window.location.hash.replace('%23', '#'), fragment = h.substr(h.lastIndexOf('#') + 1);
        if (fragment.indexOf('access_token=') >= 0 || fragment.indexOf('error=') >= 0)
        {
            var session = DM.QS.decode(fragment);

            if (window.opener && window.opener.DM.Auth.setSession && window.name == 'dmauth' && window.opener.name != 'dmauth')
            {
                // Display none helps prevent loading of some stuff
                document.documentElement.style.display = 'none';

                window.opener.DM.Auth.recvSession(session);
            }
            else if (session && ('state' in session) && session.state.indexOf('dmauth_') == 0) // Ensure it's our session
            {
                // The session have been received as fragment, but we can't find a valid opener.
                // This happen either when the user is redirected to the authorization page or when the agent
                // doesn't fully support window.open, and replace the current window by the opened one
                // (i.e.: iPhone fullscreen webapp mode)
                if ('access_token' in session)
                {
                    DM.Auth._receivedSession = session;
                }
                // Remove the session from the fragment
                window.location.hash = h.substr(0, h.lastIndexOf('#'));
            }
        }
    },

    /**
     * Recieve the authorization server response
     *
     * @access private
     * @param session {Object}  the new Session
     */
    recvSession: function(session)
    {
        if (!session)
        {
            DM.error('Received invalid session');
        }

        if ('error' in session)
        {
            DM.error('Received auth error `' + session.error + '\': ' + session.error_description);
        }

        if (!('state' in session))
        {
            DM.error("Received a session with not `state' field");
            return;
        }

        if (!(session.state in DM.Auth._active))
        {
            DM.error('Received a session from an inactive window');
            return;
        }

        // Don't remove this "stupid" clone logic, it's needed for IE8 to IE11
        var parsedSession;
        if (session) {
            parsedSession = {};
            for (k in session) parsedSession[k] = session[k];
        }
        else {
            parsedSession = session;
        }
        // end of clone logic, f*ck you IE.

        DM.Auth._active[session.state].session = parsedSession;
    },

    /**
     * Set a new session value. Invokes all the registered subscribers
     * if needed.
     *
     * @access private
     * @param session {Object}  the new Session
     * @param status  {String}  the new status
     * @return        {Object}  the "response" object
     */
    setSession: function(session, status)
    {
        // detect special changes before changing the internal session
        var login = !DM._session && session,
            logout = DM._session && !session,
            both = false, // DM._session && session && DM._session.uid != session.uid,
            sessionChange = login || logout || (DM._session && session && DM._session.access_token != session.access_token),
            statusChange = status != DM._userStatus;

        if (session && 'expires_in' in session)
        {
            // CAVEAT: the expires here will actually only be valid on the client as end-user machines
            //         clock is rarely synced
            session.expires = Math.round(new Date().getTime() / 1000) + parseInt(session.expires_in, 10);

            var expiresIn = parseInt(session.expires_in, 10);
            delete session.expires_in;
        }

        var response =
        {
            session: session,
            status: status
        };

        DM._session = session;
        DM._userStatus = status;

        // If cookie support is enabled, set the cookie. Cookie support does not
        // rely on events, because we want the cookie to be set _before_ any of the
        // event handlers are fired. Note, this is a _weak_ dependency on Cookie.
        if (sessionChange && DM.Cookie && DM.Cookie.getEnabled())
        {
            DM.Cookie.set(session);
        }

        if (DM._sessionLoadingMethod === 'neon_cookie') {
            DM.Cookie.setNeonCookies(session.access_token, session.refresh_token, expiresIn);
        }

        // events
        if (statusChange)
        {
            /**
             * Fired when the status changes.
             *
             * @event auth.statusChange
             */
            DM.Event.fire('auth.statusChange', response);
        }
        if (logout || both)
        {
            /**
             * Fired when a logout action is performed.
             *
             * @event auth.logout
             */
            DM.Event.fire('auth.logout', response);
        }
        if (login || both)
        {
            /**
             * Fired when a login action is performed.
             *
             * @event auth.login
             */
            DM.Event.fire('auth.login', response);
        }
        if (sessionChange)
        {
            /**
             * Fired when the session changes. This includes a session being
             * refreshed, or a login or logout action.
             *
             * @event auth.sessionChange
             */
            DM.Event.fire('auth.sessionChange', response);
        }

        return response;
    },

    isSessionExpired: function(session, sessionLoadingMethod)
    {
        if (typeof(session) === 'undefined') {
            session = DM._session;
        }

        if (typeof(sessionLoadingMethod) === 'undefined') {
            sessionLoadingMethod = DM._sessionLoadingMethod;
        }

        if (!session) {
            return true;
        }

        if (sessionLoadingMethod === 'neon_cookie') {
            // Live check if the access token cookie is still present.
            // If not, the access token expired since the cookie lifetime is the same as the access token
            return !DM.Cookie.getCookieValue('access_token');
        }

        return session && 'expires' in session && new Date().getTime() > session.expires * 1000;
    },

    /**
     * Start and manage the window monitor interval. This allows us to invoke
     * the default callback for a window when the user closes the window
     * directly.
     *
     * @access private
     */
    _popupMonitor: function()
    {
        // check all open windows
        for (var id in DM.Auth._active)
        {
            if ('win' in DM.Auth._active[id])
            {
                try
                {
                    // found a closed window
                    if (DM.Auth._active[id].win.closed)
                    {
                        delete DM.Auth._active[id].win;
                        DM.Auth.recvSession({error:'access_denied', error_description:'Client closed the window', state:id});
                    }
                }
                catch (e)
                {
                }
            }

            if ('session' in DM.Auth._active[id])
            {
                var callInfo = DM.Auth._active[id];
                delete DM.Auth._active[id];

                var session = callInfo.session;
                if ('access_token' in session)
                {
                    DM.Auth.setSession(session, 'connected');
                }
                else
                {
                    DM.Auth.setSession(null, 'notConnected');
                }

                if ('win' in callInfo)
                {
                    callInfo.win.close();
                }

                if ('cb' in callInfo)
                {
                    callInfo.cb({status: DM._userStatus, session: DM._session});
                }
            }
        }

        var hasActive = false;
        for (var id in DM.Auth._active)
        {
            hasActive = true;
            break;
        }
        if (hasActive && !DM.Auth._popupInterval)
        {
            // start the monitor if needed and it's not already running
            DM.Auth._popupInterval = window.setInterval(DM.Auth._popupMonitor, 100);
        }
        else if (!hasActive && DM.Auth._popupInterval)
        {
            // shutdown if we have nothing to monitor but it's running
            window.clearInterval(DM.Auth._popupInterval);
            DM.Auth._popupInterval = null;
        }
    }
});
,/**
 * Copyright Dailymotion S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides dm.player
 * @requires dm.prelude
 *           dm.qs
 */

/**
 * Dailymotion Player.
 *
 * @class dm
 * @static
 * @access private
 */
DM.provide('',
{
    player: function(element, options)
    {
        element = DM.$(element);
        if (!element || element.nodeType !== Node.ELEMENT_NODE)
            throw new Error("Invalid first argument sent to DM.player(), requires a HTML element or element id: " + element);
        if (!options || typeof options !== 'object')
            throw new Error("Missing 'options' parameter for DM.player()");

        if (DM.Player._INSTANCES[element.id] !== undefined) {
            element = DM.Player.destroy(element.id);
        }

        return DM.Player.create(element, options);
    },

    destroy: function(id)
    {
        if (!id) {  // destroy all players of the page
            if (DM.Array.keys(DM.Player._INSTANCES).length === 0) {
                DM.warn("DM.destroy(): no player to destroy");
                return;
            }

            for (var key in DM.Player._INSTANCES) {
                DM.Player.destroy(key);
            }
        } else {  // destroy a single player
            if (DM.Player._INSTANCES[id] === undefined) {
                DM.warn("Invalid first argument sent to DM.destroy(), requires a player id: " + id);
                return;
            }

            DM.Player.destroy(id);
        }
    }
});

/**
 * The Player object.
 *
 * @class DM.Player
 * @access private
 */
DM.provide('Player',
{
    _IFRAME_ORIGIN: null,
    _INSTANCES: {},
    _EVENTS: {},
    _ANCHORS: {},
    _INTERVAL_ID: null,
    API_MODE: null,
    EVENT_HANDLERS: {},

    // video properties
    _environmentInfo: null,
    apiReady: false,
    autoplay: false,
    currentTime: 0,
    bufferedTime: 0,
    duration: NaN,
    seeking: false,
    error: null,
    ended: false,
    muted: false,
    volume: 1,
    paused: true,
    fullscreen: false,
    controls: undefined,
    rebuffering: false,
    qualities: [],
    quality: undefined,
    subtitles: [],
    subtitle: undefined,
    video: null,
    companionAds: null,
    loop: false,
    adData: {},

    play: function() {this.api('play');},
    togglePlay: function() {this.api('toggle-play');},
    pause: function() {this.api('pause');},
    seek: function(time) {this.api('seek', time);},
    load: function(id, settings) {this.api('load', id, settings);},
    setMuted: function(muted) {this.api('muted', muted);},
    toggleMuted: function() {this.api('toggle-muted');},
    setVolume: function(volume) {this.api('volume', volume);},
    setQuality: function(quality) {this.api('quality', quality);},
    setSubtitle: function(subtitle) {this.api('subtitle', subtitle);},
    setFullscreen: function(fullscreen) {this.api('fullscreen', fullscreen);},
    setControls: function (visible) { this.api('controls', visible);},
    toggleControls: function () { this.api('toggle-controls');},
    setProp: function() {this.api.apply(this, ['set-prop'].concat([].slice.call(arguments)));}, // onsite use only
    setAdsConfig: function (config) {this.api("set-ads-config", config);},
    setCustConfig: function (config) {this.api("set-ads-config", config);},
    watchOnSite: function(muted) {this.api('watch-on-site');},
    setLoop: function (loop) { this.api('loop', loop);},

    api: function(command)
    {
        var parameters = (2 <= arguments.length) ? [].slice.call(arguments, 1) : [];
        this._send(command, parameters);
    },

    create: function(element, options)
    {
        options = DM.copy(options,
        {
            width: 480,
            height: 270,
            title: "video player",
            referrerPolicy: null,
            params: {},
            events: {}
        });

        // Look at query-string for a "dm:params" parameter, and pass them to the player
        if (location.search.length > 1 && location.search.indexOf('dm:params') !== -1)
        {
            var params = DM.QS.decode(location.search.substr(1));
            if ('dm:params' in params)
            {
                // Decode the double encoded params
                options.params = DM.copy(DM.QS.decode(params['dm:params']), options.params);
            }
        }

        // see #5 : _domain.www should be protocol independent
        // remove protocol from existing value to preserve backward compatibility
        DM._domain.www = DM._domain.www.replace(/^https?\:/, '');

        var player = document.createElement("iframe");
        DM.Array.forEach(['id', 'style', 'class'], function(attr)
        {
            var val = element.getAttribute(attr);
            if (val) player.setAttribute(attr, val);
        });
        player.setAttribute("frameborder", "0");
        player.setAttribute("allowfullscreen", "true");
        player.setAttribute("allow", "autoplay");
        if (typeof options.referrerPolicy === 'string') {
            player.referrerPolicy = options.referrerPolicy
        }
        player.title = "Dailymotion " + options.title;
        player.type = "text/html";
        player.width = options.width;
        player.height = options.height;
        element.parentNode.replaceChild(player, element);

        DM.copy(player, DM.Player);

        player.init(options.video, options.params, options.playlist, options.events, element);

        if (typeof options.events == "object")
        {
            for (var name in options.events)
            {
                player.addEventListener(name, options.events[name], false);
            }
        }

        return player;
    },

    destroy: function(id)
    {
        var player = DM.Player._INSTANCES[id];
        var anchor = DM.Player._ANCHORS[id];

        // remove options events listeners
        DM.Array.forEach(DM.Player._EVENTS[id], function(event)
        {
            var name = DM.Array.keys(event)[0];
            player.removeEventListener(name, event[name], false);
        });

        player.parentNode.replaceChild(anchor, player);  // replace the iframe by its initial anchor
        delete DM.Player._INSTANCES[id];  // remove player instance
        delete DM.Player._ANCHORS[id];  // remove anchor of player instance
        delete DM.Player._EVENTS[id];  // remove events of player instance
        return anchor;
    },

    _getPathname: function(video, playlist)
    {
        if (playlist && !video) {
            return "/embed/playlist/" + playlist
        }
        if (video) {
            return "/embed/video/" + video
        }
        return "/embed"
    },

    init: function(video, params, playlist, events, element)
    {
        var self = this;
        DM.Player._installHandlers();
        params = typeof params == "object" ? params : {};
        params.api = DM.Player.API_MODE;

        // Support for old browser without location.origin
        if (location.origin)
            params.origin = location.origin;
        else
            params.origin = '*';

        if (DM._apiKey)
        {
            params.apiKey = DM._apiKey;
        }

        if (video && playlist) {
            params.playlist = playlist;
        }

        // CPE is using SDK under the hood. So if params.pubtool is already set, we use it
        // so CPE integration will have pubtool = cpe
        params.pubtool = params.pubtool || 'jssdk'

        if (params.pubtool === 'jssdk') {
            console.warn('DEPRECATED: Legacy JS SDK integration method is deprecated. Please consider using Player Embeds https://faq.dailymotion.com/hc/en-us/articles/4411096679954-Integrate-your-Player-Embed');
        }

        this.id = params.id = this.id ? this.id : DM.guid();
        this.src = 'https:' + DM._domain.www + this._getPathname(video, playlist) + '?' + DM.QS.encode(params);
        if (DM.Player._INSTANCES[this.id] != this)
        {
            DM.Player._INSTANCES[this.id] = this;
            DM.Player._EVENTS[this.id] = events;
            DM.Player._ANCHORS[this.id] = element;
            this.addEventListener('unload', function() {
                delete DM.Player._INSTANCES[this.id];
                delete DM.Player._ANCHORS[this.id];
                delete DM.Player._EVENTS[this.id];
            });
        }

        this.autoplay = DM.parseBool(params.autoplay);
    },

    _installHandlers: function()
    {
        if (DM.Player.API_MODE !== null) return;
        if (window.postMessage)
        {
            DM.Player.API_MODE = "postMessage";

            var handler = function(e)
            {
                var originDomain = e.origin ? e.origin.replace(/^https?:/, '') : null;
                if (!originDomain || originDomain.indexOf(DM._domain.www) !== 0) return;
                if (!e.data || typeof e.data !== 'string') return;
                if (!DM.Player._IFRAME_ORIGIN) {
                  DM.Player._IFRAME_ORIGIN = e.origin;
                }
                var event = DM.Player._decodePostMessage(e.data);
                if (!event.id || !event.event) return;
                var player = DM.$(event.id);
                if (!player || typeof player._recvEvent !== 'function') return;
                player._recvEvent(event);
            };
            if (window.addEventListener) window.addEventListener("message", handler, false);
            else if (window.attachEvent) window.attachEvent("onmessage", handler);
        }
    },

    _decodePostMessage: function(rawMessage)
    {
      if (rawMessage.substring(0, 1) === '{') {
        try {
          var data = JSON.parse(rawMessage);
          return data;
        }
        catch(e) {
          return {};
        }
      }
      return DM.QS.decode(rawMessage);
    },

    _send: function(command, parameters)
    {
        if (!this.apiReady) {
            DM.warn('Player not ready. Ignoring command : "'+command+'"');
            return;
        }

        if (DM.Player.API_MODE == 'postMessage')
        {
            if (!this.contentWindow || typeof this.contentWindow.postMessage !== 'function') {
                DM.warn('Player not reachable anymore. You may have destroyed it.');
                return;
            }

            this.contentWindow.postMessage(JSON.stringify({
                command    : command,
                parameters : parameters || []
            }), DM.Player._IFRAME_ORIGIN);
        }
    },

    _dispatch: document.createEvent ? function(event)
    {
        const type = event.event
        const e = document.createEvent("HTMLEvents");
        // args is set when the player emit a ad_log event with data
        if (event.event === 'ad_log' && event.args) {
          e.data = event.args;
        }
        e.initEvent(type, true, true);
        this.dispatchEvent(e);
    }
    : function(event) // IE compat
    {
        const type = event.event
        if ('on' + type in this)
        {
            e = document.createEventObject();
            this.fireEvent('on' + type, e);
        }
        else if (type in this.EVENT_HANDLERS)
        {
            var e = {type: type, target: this};
            DM.Array.forEach(this.EVENT_HANDLERS[type], function(handler)
            {
                handler(e);
            });
        }
    },

    _recvEvent: function(event)
    {
        switch (event.event)
        {
            case 'apiready': if (this.apiReady) return /* dispatch only once */; else this.apiReady = true; this._environmentInfo = event.info || null; break;
            case 'start': this.ended = false; break;
            case 'loadedmetadata': this.error = null; break;
            case 'timeupdate': // no break statement here
            case 'ad_timeupdate': this.currentTime = parseFloat(event.time); break;
            case 'progress': this.bufferedTime = parseFloat(event.time); break;
            case 'durationchange': this.duration = parseFloat(event.duration); break;
            case 'seeking': this.seeking = true; this.currentTime = parseFloat(event.time); break;
            case 'seeked': this.seeking = false; this.currentTime = parseFloat(event.time); break;
            case 'fullscreenchange': this.fullscreen = DM.parseBool(event.fullscreen); break;
            case 'controlschange': this.controls = DM.parseBool(event.controls); break;
            case 'volumechange': this.volume = parseFloat(event.volume); this.muted = DM.parseBool(event.muted); break;
            case 'ad_start': this.adData = event.adData;
            case 'video_start':
            case 'ad_play':
            case 'playing':
            case 'play': this.paused = false; break;
            case 'end': this.ended = true; break; // no break, also set paused
            case 'ad_end': this.adData = {};
            case 'ad_pause':
            case 'video_end':
            case 'pause': this.paused = true; break;
            case 'error': this.error = {code: event.code, title: event.title, message: event.message}; break;
            case 'rebuffer': this.rebuffering = DM.parseBool(event.rebuffering); break;
            case 'qualitiesavailable': this.qualities = event.qualities; break;
            case 'qualitychange': this.quality = event.quality; break;
            case 'subtitlesavailable': this.subtitles = event.subtitles; break;
            case 'subtitlechange': this.subtitle = event.subtitle; break;
            case 'videochange': this.video = { videoId: event.videoId, title: event.title, duration: parseFloat(event.duration) }; break;
            case 'ad_companions': this.companionAds = event.companionAds; break;
        }

        this._dispatch(event);
    },

    // IE compat (DM.copy won't set this if already defined)
    addEventListener: function(name, callback, capture)
    {
        if ('on' + name in this && this.attachEvent)
        {
            this.attachEvent("on" + name, callback, capture);
        }
        else
        {
            if (!(name in this.EVENT_HANDLERS))
            {
                this.EVENT_HANDLERS[name] = [];
            }
            this.EVENT_HANDLERS[name].push(callback);
        }
    }
});
