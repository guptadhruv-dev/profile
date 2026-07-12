import highlightCore from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

const highlightedLanguages = Object.freeze({
  bash,
  cpp,
  css,
  java,
  javascript,
  json,
  python,
  rust,
  sql,
  swift,
  typescript,
  xml,
})
const languageAliases = Object.freeze({
  c: 'cpp',
  cxx: 'cpp',
  html: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  shell: 'bash',
  sh: 'bash',
  ts: 'typescript',
  tsx: 'typescript',
})

for (const [languageName, languageDefinition] of Object.entries(highlightedLanguages)) {
  highlightCore.registerLanguage(languageName, languageDefinition)
}

export default function HighlightedCodeBlock({ languageName, className, children }) {
  const normalizedLanguage = languageAliases[languageName] ?? languageName
  const sourceCode = String(children ?? '')
  if (!highlightCore.getLanguage(normalizedLanguage)) {
    return <code className={className}>{sourceCode}</code>
  }

  const highlightedCode = highlightCore.highlight(sourceCode, {
    language: normalizedLanguage,
    ignoreIllegals: true,
  }).value

  return (
    <code
      className={`hljs ${className ?? ''}`.trim()}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}
