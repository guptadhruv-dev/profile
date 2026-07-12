import { lazy, Suspense, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkDirectiveShortcodes from '../markdown/remark-directives'
import remarkPreserveSpaces from '../markdown/preserve-spaces'
import { createContentSanitizeSchema } from '../markdown/sanitize-content'
import { shortcodeComponents } from './shortcodes'
import { externalLinkProps, proxyProtectedUrl, proxySectionMediaUrl } from '../lib/proxy'
import Reveal from './content-reveal'

const remarkPlugins = [remarkGfm, remarkDirective, remarkDirectiveShortcodes, remarkPreserveSpaces]
const variablePattern = /\{\{(\w+)\}\}/g
const contentSanitizeSchema = createContentSanitizeSchema(Object.keys(shortcodeComponents))
const rehypePlugins = [rehypeRaw, [rehypeSanitize, contentSanitizeSchema]]
const codeLanguagePattern = /(?:^|\s)language-([a-zA-Z0-9-]+)(?:\s|$)/
const HighlightedCodeBlock = lazy(() => import('./highlighted-code-block'))

function MarkdownCode({ node, className, children, ...properties }) {
  const languageName = codeLanguagePattern.exec(className ?? '')?.[1]
  if (!languageName) {
    return (
      <code className={className} {...properties}>
        {children}
      </code>
    )
  }

  return (
    <Suspense fallback={<code className={className}>{children}</code>}>
      <HighlightedCodeBlock className={className} languageName={languageName}>
        {children}
      </HighlightedCodeBlock>
    </Suspense>
  )
}

const markdownComponents = {
  ...shortcodeComponents,
  code: MarkdownCode,
  a({ node, href, children, ...properties }) {
    const linkUrl = proxyProtectedUrl(href, 'link')
    if (!linkUrl) return <span>{children}</span>
    return (
      <a href={linkUrl} {...externalLinkProps(linkUrl)} {...properties}>
        {children}
      </a>
    )
  },
  img({ src, alt, title }) {
    const imageUrl = proxySectionMediaUrl(src)
    return imageUrl ? <img src={imageUrl} alt={alt ?? ''} title={title} loading="lazy" /> : null
  },
}

export default function Section({ id, vars = {}, content }) {
  const markdown = useMemo(
    () =>
      String(content ?? '').replace(variablePattern, (matchedVariable, variableName) => {
        const variableValue = vars[variableName]
        return variableValue === undefined || variableValue === null ? '' : String(variableValue)
      }),
    [content, vars],
  )
  return (
    <section id={id} className="section-pane">
      <div className="section-body">
        <Reveal className="prose">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={markdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </Reveal>
      </div>
    </section>
  )
}
