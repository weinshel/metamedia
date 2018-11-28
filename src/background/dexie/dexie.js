import db from './setup'
import queries from './queries'

export async function storePage (info) {
  return db.pages.add({
    pageId: info.pageId,
    title: info.title,
    domain: info.domain,
    hostname: info.hostname,
    path: info.path,
    protocol: info.protocol,
    tsId: info.tsId
  })
}

export async function storeInference (id, infer) {
  return db.pages.update(id, {
    inference: infer
  })
}

export default {
  storePage,
  storeInference,
  query: queries.makeQuery
}
