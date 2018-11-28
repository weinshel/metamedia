import db from './setup'
import queries from './queries'

export async function storePage (info) {
  return db.pages.add({
    id: info.pageId,
    title: info.title,
    domain: info.domain,
    hostname: info.hostname,
    path: info.path,
    protocol: info.protocol
  })
}

export async function storeInference (id, infer) {
  console.log('storing inference', id, infer)
  return db.pages.update(id, {
    inference: infer
  })
}

export async function storeScreenshot (id, screenshot) {
  console.log('storing screenshot', id)
  return db.screenshots.add(id, {
    screenshot: screenshot
  })
}

export default {
  storePage,
  storeInference,
  storeScreenshot,
  query: queries.makeQuery
}
