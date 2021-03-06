/** @module background */

import tldjs from 'tldjs'
// import palette from 'huey/palette'
// import dominant from 'huey/dominant'
// import image from 'get-image-data'
// import {promisify} from 'es6-promisify'
import * as Vibrant from 'node-vibrant'

import InferencingWorker from './inferencing/inferencing.worker'
import dexie from './dexie/dexie'
import db from './dexie/setup'

// const getImg = promisify(image)

// import websiteLogo from '../content_scripts/websiteLogo.js'

const inferencingWorker = new InferencingWorker()
window.queryDexie = dexie.query

let tabData = {}
let tabSessions = {}

async function onInstall (details) {
  // also runs on update
  if (details.reason === 'install') {
    // stub
  }
}
browser.runtime.onInstalled.addListener(onInstall)

/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping () {
  return 'ping'
}
window.ping = ping

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate)
browser.webNavigation.onDOMContentLoaded.addListener(onDOMContentLoaded)
browser.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated)

/* listener for tab close */
browser.tabs.onCreated.addListener(tabOnCreated)
browser.tabs.onRemoved.addListener(clearTabData)

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish)
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish)

// browser.tabs.onUpdated.addListener(onLoadCompleted, ['status'])

function isMainFramePage (details) {
  const { tabId, frameId, url } = details
  return (frameId === 0 &&
    tabId !== -1 &&
    tabId !== browser.tabs.TAB_ID_NONE &&
    url.startsWith('http') &&
    !url.includes('_/chrome/newtab')) &&
    !browser.extension.inIncognitoContext
}

async function onBeforeNavigate (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  const tsId = await browser.sessions.getTabValue(tabId, 'tsId')

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId)
  }

  const pageId = Date.now()
  browser.sessions.setTabValue(tabId, 'pageId', pageId)
  let urlObj = new URL(url)

  const domain = tldjs.getDomain(urlObj.hostname) || urlObj.hostname

  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: domain,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    url: url,
    tsId: tsId
  }

  tabSessions[tsId].push({ pageId })
  console.log('tsId', tsId, tabSessions[tsId])
  // dexie.tabSessionUpdate(tsid, )
  db.tabSessions.update(tsId, { pages: tabSessions[tsId] })
}

async function onDOMContentLoaded (details) {
  const { tabId } = details
  if (!isMainFramePage(details)) return

  // we now have title
  // so we can add that to tabdata and push it to database
  const tab = await browser.tabs.get(details.tabId)
  if (tab.incognito) {
    // we don't want to store private browsing data
    tabData[tabId] = null
    return
  }
  tabData[tabId]['title'] = tab.title

  dexie.storePage(tabData[tabId])
}

async function onHistoryStateUpdated (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  // check if url is changed
  // a lot of pages (yahoo, duckduckgo) do extra redirects
  // that call this function but really aren't a page change
  if (tabData[tabId].hostname) {
    const u = new URL(url)
    const h1 = u.hostname.split('www.').pop()
    const h2 = tabData[tabId].hostname.split('www.').pop()
    const p1 = u.pathname
    const p2 = tabData[tabId].path
    if (h1 === h2 && p1 === p2) return
  }

  // simulate a new page load
  await onBeforeNavigate(details)

  const tab = await browser.tabs.get(details.tabId)
  tabData[tabId]['title'] = tab.title

  dexie.storePage(tabData[tabId])
}

async function tabOnCreated (tab) {
  const tsId = Date.now()
  await browser.sessions.setTabValue(tab.id, 'tsId', tsId)
  tabSessions[tsId] = []

  if (!tab.openerTabId) {
    db.tabSessions.add({ tsId: tsId, parentTsId: null, pages: [] })
  } else {
    const oldId = await browser.sessions.getTabValue(tab.openerTabId, 'tsId')

    // add new tsid to old tab
    if (tabSessions[oldId] && tabSessions[oldId].length > 0) {
      tabSessions[oldId][tabSessions[oldId].length - 1]['childTabSession'] = tsId
      db.tabSessions.update(oldId, { pages: tabSessions[oldId] })
    } else {
      console.log('uh oh')
    }

    db.tabSessions.add({ tsId: tsId, parentTsId: oldId, pages: [] })
  }
}

/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 *
 * @param  {number} tabId - tab's id
 */
function clearTabData (tabId) {
  if (!tabData[tabId]) {
    return
  }

  tabData[tabId] = null
}

async function onPageLoadFinish (details) {
  if (!isMainFramePage(details)) return

  if (details.frameId === 0) {
    // not an iframe
    const tabId = details.tabId
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'make_inference'
      })
    } catch (e) {
      console.log(e)
    }
//   }
// }

// async function onLoadCompleted (tabId, details) {
//   console.log('hi')
  // if (details.status === 'complete') {
    // const data = await getTabData(tabId)
    const pageId = await browser.sessions.getTabValue(tabId, 'pageId')

    // take screenshot
    const screenshot = await browser.tabs.captureTab(tabId)
    db.screenshots.add({ pageId, screenshot })

    browser.tabs.executeScript(tabId, {file: '/websiteLogo.js'})
      .then(logos => {
        if (logos && logos.length > 0) {
          db.pages.update(pageId, { logos: logos[0] })
        }
      })

    let v = new Vibrant(screenshot, {})
    v.getPalette()
      .then(palette => db.pages.update(pageId, { palette: palette }))

    // get prominent colors on page
    // let simage = document.createElement('img')
    // simage.setAttribute('src', screenshot)
    // simage.setAttribute('width', 400)
    // simage.setAttribute('height', 400)

    // let canvas = document.createElement('canvas')

    // var context = canvas.getContext('2d')
    // canvas.width = simage.width
    // canvas.height = simage.height
    // context.drawImage(simage, 0, 0, simage.width, simage.height)
    // const imageData = context.getImageData(
    //   0, 0, simage.width, simage.height
    // )

    // // const pal = palette(imageData.data, 5)
    // const dom = dominant(imageData.data)
    // console.log('dominant color', dom)
    // db.pages.update(pageId, { dominantColor: dom })

    // let color = l.themeColor || iconColor || dom
    // if (Array.isArray(color)) {
    //   color = 'rgb(' + color.join(',') + ')'
    // }
    // console.log('master color', color)
    // db.pages.update(pageId, { color: color })
  }
}

/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// note that we are using the CHROME api and not the BROWSER api
// because the webextension polyfill does NOT work with sending a response because of reasons
chrome.runtime.onMessage.addListener(runtimeOnMessage)

inferencingWorker.onmessage = onInferencingWorkerMessage

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 *
 * @param  {number} tabId
 * @return {Object} tabData object
 */
async function getTabData (tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return null
  } else {
    let data = tabData[tabId]

    return data
  }
}
window.getTabData = getTabData // exposes function to other extension components

async function onInferencingWorkerMessage (m) {
  const tabId = m.data.info.tabId
  const pageId = m.data.info.pageId
  if (m.data.type === 'page_inference') {
    console.log(m.data)
    const infer = m.data.info.inference
    tabData[tabId].inference = infer
    dexie.storeInference(pageId, infer)
  }
}

/**
 * listener function for messages from content script
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 *
 */
function runtimeOnMessage (message, sender, sendResponse) {
  let pageId
  let tabDataRes
  // sendResponse('swhooo');
  switch (message.type) {
    case 'parsed_page':

      if (!sender.tab || !sender.url || sender.frameId !== 0) {
      // message didn't come from a tab, so we ignore
        break
      }
      if (!tabData[sender.tab.id]) break
      pageId = tabData[sender.tab.id].pageId

      inferencingWorker.postMessage({
        type: 'content_script_to_inferencing',
        article: message.article,
        mainFrameReqId: pageId,
        tabId: sender.tab.id
      })
      break

    case 'getTabData':
      tabDataRes = getTabData(sender.tab.id)
      tabDataRes.then(res => sendResponse(res))
      return true // must do since calling sendResponse asynchronously
  }
}

browser.browserAction.onClicked.addListener(() => browser.tabs.create({
  active: true,
  url: '../dist/metamedia.html'
}))
