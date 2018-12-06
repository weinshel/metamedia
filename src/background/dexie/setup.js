import Dexie from 'dexie'

const db = new Dexie('dexieDb')
db.version(1).stores({
  pages: '&pageId,tsId,domain,inference',
  screenshots: '&pageId',
  tabSessions: '&tsId'
})

window.db = db
export default db
