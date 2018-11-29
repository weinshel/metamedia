import db from './setup'

function getAllPages () {
  return db.pages.reverse().toArray()
}

function getAllTabSessions () {
  return db.tabSessions.toArray()
}

const queries = {
  getAllPages,
  getAllTabSessions
}

function makeQuery (q, args) {
  return (queries[q])(args)
}

export default {
  makeQuery
}
