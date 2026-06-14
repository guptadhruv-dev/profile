import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkShortcodes, { normalizeShortcodes } from '../plugins/remarkShortcodes';
import { shortcodeComponents } from './shortcodes';
import Reveal from './Reveal';

const REMARK_PLUGINS = [remarkGfm, remarkShortcodes];
const REHYPE_PLUGINS = [rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]];

export default function Section({ id, vars = {}, content, isFirst = false }) {
  const normalized = useMemo(() => {
    const withVars = (content ?? '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
    const spaced = withVars.replace(/\n{2,}/g, (m) =>
      '\n\n<div style="height:' + (m.length - 1) + 'em"></div>\n\n'
    );
    return normalizeShortcodes(spaced);
  }, [content, vars]);

  return (
    <section
      id={id}
      className="section-pane"
      data-first={isFirst ? '' : undefined}
    >
      <div className="section-body">
        <Reveal className="prose">
          <ReactMarkdown
            remarkPlugins={REMARK_PLUGINS}
            rehypePlugins={REHYPE_PLUGINS}
            components={shortcodeComponents}
          >
            {normalized}
          </ReactMarkdown>
        </Reveal>
      </div>
    </section>
  );
}
