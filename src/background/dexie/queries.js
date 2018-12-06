import db from './setup'

function getAllPages ({ groupBy }) {
  let q = db.pages.orderBy(groupBy)
  if (groupBy === 'tsId') {
    q = q.reverse()
  }
  return q.toArray()
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
