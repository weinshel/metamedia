import React from 'react'
import ReactDOM from 'react-dom'

import Text from '@instructure/ui-elements/lib/components/Text'
import CodeEditor from '@instructure/ui-code-editor/lib/components/CodeEditor'

const RawData = ({ data }) => (
  <Text>
    <CodeEditor
      label='raw data'
      defaultValue={JSON.stringify(data, null, 2)}
      language='json'
      options={{ lineNumbers: true }}
    />
  </Text>
)

export default RawData
