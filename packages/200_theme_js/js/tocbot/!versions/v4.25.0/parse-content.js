/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/parse-content.js
 #  Tocbot v4.25.0 implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #  Copyright (C) 2016 - 2024 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-var: "off"                                                       */
// -----------------------------------------------------------------------------

/**
 * This file is responsible for parsing the content from the DOM and making
 * sure data is nested properly.
 *
 * @author Tim Scanlin
 */

module.exports = function parseContent (options) {
  var reduce = [].reduce

  /**
   * Get the last item in an array and return a reference to it.
   * @param {Array} array
   * @return {Object}
   */
  function getLastItem (array) {
    return array[array.length - 1]
  }

  /**
   * Get heading level for a heading dom node.
   * @param {HTMLElement} heading
   * @return {Number}
   */
  function getHeadingLevel (heading) {
    return +heading.nodeName.toUpperCase().replace('H', '')
  }

  /**
   * Determine whether the object is an HTML Element.
   * Also works inside iframes. HTML Elements might be created by the parent document.
   * @param {Object} maybeElement
   * @return {Number}
   */
  function isHTMLElement (maybeElement) {
    try {
      return (
        maybeElement instanceof window.HTMLElement ||
        maybeElement instanceof window.parent.HTMLElement
      )
    } catch (e) {
      return maybeElement instanceof window.HTMLElement
    }
  }

  /**
   * Get important properties from a heading element and store in a plain object.
   * @param {HTMLElement} heading
   * @return {Object}
   */
  function getHeadingObject (heading) {
    // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
    // first time heading is real DOM node element, second time it is obj
    // that is causing problem so I am processing only original DOM node
    if (!isHTMLElement(heading)) return heading

    if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
      return null
    }

    const headingLabel = heading.getAttribute('data-heading-label') ||
      (options.headingLabelCallback ? String(options.headingLabelCallback(heading.innerText)) : (heading.innerText || heading.textContent).trim())
    var obj = {
      id: heading.id,
      children: [],
      nodeName: heading.nodeName,
      headingLevel: getHeadingLevel(heading),
      textContent: headingLabel
    }

    if (options.includeHtml) {
      obj.childNodes = heading.childNodes
    }

    if (options.headingObjectCallback) {
      return options.headingObjectCallback(obj, heading)
    }

    return obj
  }

  /**
   * Add a node to the nested array.
   * @param {Object} node
   * @param {Array} nest
   * @return {Array}
   */
  function addNode (node, nest) {
    var obj = getHeadingObject(node)
    var level = obj.headingLevel
    var array = nest
    var lastItem = getLastItem(array)
    var lastItemLevel = lastItem
      ? lastItem.headingLevel
      : 0
    var counter = level - lastItemLevel

    while (counter > 0) {
      lastItem = getLastItem(array)
      // Handle case where there are multiple h5+ in a row.
      if (lastItem && level === lastItem.headingLevel) {
        break
      } else if (lastItem && lastItem.children !== undefined) {
        array = lastItem.children
      }
      counter--
    }

    if (level >= options.collapseDepth) {
      obj.isCollapsed = true
    }

    array.push(obj)
    return array
  }

  /**
   * Select headings in content area, exclude any selector in options.ignoreSelector
   * @param {HTMLElement} contentElement
   * @param {Array} headingSelector
   * @return {Array}
   */
  function selectHeadings (contentElement, headingSelector) {
    var selectors = headingSelector
    if (options.ignoreSelector) {
      selectors = headingSelector.split(',')
        .map(function mapSelectors (selector) {
          return selector.trim() + ':not(' + options.ignoreSelector + ')'
        })
    }
    try {
      return contentElement.querySelectorAll(selectors)
    } catch (e) {
      console.warn('Headers not found with selector: ' + selectors); // eslint-disable-line
      return null
    }
  }

  /**
   * Nest headings array into nested arrays with 'children' property.
   * @param {Array} headingsArray
   * @return {Object}
   */
  function nestHeadingsArray (headingsArray) {
    return reduce.call(headingsArray, function reducer (prev, curr) {
      var currentHeading = getHeadingObject(curr)
      if (currentHeading) {
        addNode(currentHeading, prev.nest)
      }
      return prev
    }, {
      nest: []
    })
  }

  return {
    nestHeadingsArray,
    selectHeadings
  }
}
