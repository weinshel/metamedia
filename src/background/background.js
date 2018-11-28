/** @module background */

import tldjs from 'tldjs'

import InferencingWorker from './inferencing/inferencing.worker'
import dexie from './dexie/dexie'

const inferencingWorker = new InferencingWorker()
window.queryDexie = dexie.query

let tabData = {}

async function onInstall (details) {
  // also runs on update
  if (details.reason === 'install') {
    // stub
  }
}
browser.runtime.onInstalled.addListener(onInstall)

// set up default for logging, currently it is true.

// console.log('Here I am');
// loggingDefault.setLoggingDefault();

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
browser.tabs.onRemoved.addListener(clearTabData)

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish)
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish)

function isMainFramePage (details) {
  const { tabId, frameId, url } = details
  return (frameId === 0 &&
    tabId !== -1 &&
    tabId !== browser.tabs.TAB_ID_NONE &&
    url.startsWith('http') &&
    !url.includes('_/chrome/newtab')) &&
    !browser.extension.inIncognitoContext
}

function onBeforeNavigate (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId)
  }

  const pageId = Date.now()
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
    webRequests: []
  }
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
  // now fetch and store the favicon database
  // fetchSetGetFavicon(url, faviconUrl)
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
  onBeforeNavigate(details)

  const tab = await browser.tabs.get(details.tabId)
  tabData[tabId]['title'] = tab.title

  dexie.storePage(tabData[tabId])
}

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/
/*
async function fetchSetGetFavicon(url, faviconurl){
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    //already stored favicon
    //and the favicon is same as before
    if(checkFav[x]['faviconurl']==faviconurl){
      return checkFav[x]['favicondata'];
    }
  }
  if(faviconurl==''){
    //no favicon for this tab
    await browser.storage.local.set(
      {[x]: {
        'url':url,
        'faviconurl':faviconurl,
        'favicondata':''}
      }
    );
    return '';
  }
  var favicon = new XMLHttpRequest();
  favicon.responseType = 'blob';
  favicon.open('get', faviconurl);
  favicon.onload = function() {
    var fileReader = new FileReader();
    fileReader.onloadend = async function() {
      // fileReader.result is a data-URL (string) in base 64 format
      x = 'favicon_'+url
      await browser.storage.local.set(
        {
          [x]: {
            'url':url,
            'faviconurl':faviconurl,
            'favicondata':fileReader.result
          }
        });
    };
    // favicon.response is a Blob object
    fileReader.readAsDataURL(favicon.response);
  };
  favicon.send();
  checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  return checkFav[x]['favicondata'];
}
window.fetchSetGetFavicon=fetchSetGetFavicon;
*/

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
/*
async function getFavicon(url) {
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    return checkFav[x]['favicondata'];
  }
  return ''
}
window.getFavicon=getFavicon;
*/

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

    const data = await getTabData(tabId)
    // const screenshot = await browser.tabs.captureTab(tabId)
    // dexie.storeScreenshot(tabData[tabId]['pageId'], screenshot)
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
