import Dexie from 'dexie'

const db = new Dexie('dexieDb')
db.version(1).stores({
  pages: '&pageId,domain,inference',
  screenshots: '&pageId',
  tabSessions: '&tsId'
})

export default db
