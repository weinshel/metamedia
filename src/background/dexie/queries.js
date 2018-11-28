import db from './setup'

function getAllPages () {
  return db.pages.toArray()
}

const queries = {
  getAllPages
}

function makeQuery (q, args) {
  return (queries[q])(args)
}

export default {
  makeQuery
}
