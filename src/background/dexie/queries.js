import db from './setup'

function getAllPages () {
  return db.pages.orderBy('tsId').reverse().toArray()
}

function getAllTabSessions () {
  return db.tabSessions.reverse().toArray()
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
