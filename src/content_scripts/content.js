import makeInference from './inferencing'

async function runtimeOnMessage (m) {
  if (browser.extension.inIncognitoContext) {
    return
  }

  switch (m.type) {
    case 'make_inference':
      makeInference()
      break
  }
  return true
}

chrome.runtime.onMessage.addListener(runtimeOnMessage)
