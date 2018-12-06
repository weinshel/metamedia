// SCRIPT ADAPTED FROM https://github.com/jhermsmeier/node-website-logo/blob/master/lib/logo.js

var logoSelector = [
  '[id=logo] img',
  '[id*=logo] img',
  '[class=logo] img',
  '[class*=logo] img'
].join()

var svgSelector = [
  '[id=logo] svg',
  '[id*=logo] svg',
  '[class=logo] svg',
  '[class*=logo] svg'
].join()

var touchIcons = [
  'link[rel="apple-touch-icon"]',
  'link[rel="icon"]'
]

var colorSelector = [
  'meta[name="theme-color"]',
  'meta[name="msapplication-TileColor"]'
].join()

function getAttribute (window, selector, attr) {
  var node = window.document.querySelector(selector)
  return node && node.getAttribute(attr)
}

function getTag (window, selector, prefix) {
  var node = window.document.querySelector(selector)
  return node && ((prefix || '') + node.outerHTML)
}

function getTouchIcons (window) {
  return touchIcons.map(function (selector) {
    return window.document.querySelector(selector)
  }).filter(function (node) {
    return node && !!node.getAttribute('href')
  }).map(function (node) {
    var img = {
      href: node.getAttribute('href'),
      size: node.getAttribute('sizes')
    }

    if (img.size) {
      img.size = img.size.split('x')
        .map((x) => parseInt(x, 10))
    }

    img.href = (new URL(value, document.location)).href

    return img
  })
}

function getLogo (window) {
  var value = getAttribute(window, logoSelector, 'href') ||
    getTag(window, svgSelector, 'data:image/svg+xml,')
  return value ? (new URL(value, document.location)).href : null
}

// <meta property="og:image" content="https://www.npmjs.com/static/images/touch-icons/open-graph.png">
function getOpenGraphImage (window) {
  var value = getAttribute(window, 'meta[property="og:image"]', 'content')
  return value ? (new URL(value, document.location)).href : null
}

// <meta name="msapplication-TileColor" content="#cb3837">
// <meta name="theme-color" content="#cb3837">
function getColor (window) {
  var value = getAttribute(window, colorSelector, 'content')
  return value
}

// <link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">
function getFluidIcon (window) {
  var value = getAttribute(window, 'link[rel="fluid-icon"]', 'href')
  return value ? (new URL(value, document.location)).href : null
}

// <link rel="mask-icon" href="https://assets-cdn.github.com/pinned-octocat.svg" color="#4078c0">
function getMaskIcon (window) {
  var value = getAttribute(window, 'link[rel="mask-icon"]', 'href')
  return value ? (new URL(value, document.location)).href : null
}

function getFavicon (window) {
  var value = getAttribute(window, 'link[rel="icon"]', 'href') ||
    getAttribute(window, 'link[rel="shortcut icon"]', 'href') ||
    '/favicon.ico'
  return value ? (new URL(value, document.location)).href : null
}

(function getData () {
  const res = {
    logo: getLogo(window),
    icon: getFavicon(window),
    themeColor: getColor(window),
    touchIcons: getTouchIcons(window),
    openGraph: getOpenGraphImage(window),
    maskIcon: getMaskIcon(window),
    fluidIcon: getFluidIcon(window)
  }
  console.log(res)

  return res
})()
