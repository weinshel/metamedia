import React from 'react'

const RawData = ({ data }) => (
  <pre>{JSON.stringify(data, null, 2)}</pre>
)

export default RawData
