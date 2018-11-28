import Dexie from 'dexie'

const db = new Dexie('dexieDb')
db.version(1).stores({
  pages: '&id,domain,inference',
  screenshots: '&id'
})

export default db
