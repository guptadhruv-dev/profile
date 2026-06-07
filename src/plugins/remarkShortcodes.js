const OPEN_RE   = /^::([a-zA-Z][a-zA-Z0-9_-]*)(?:\s*\{([^}]*)\})?\s*$/;
const CLOSE_RE  = /^::end\s*$/;
const INLINE_RE = /::([a-zA-Z][a-zA-Z0-9_-]*)\s*\{([^}]*)\}/g;
const PROP_RE   = /([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;

const BLOCK_NAMES  = new Set(['toggle', 'callout', 'columns', 'col', 'card', 'gallery', 'embed', 'bookmark']);
const VOID_NAMES   = new Set(['gallery', 'embed', 'bookmark']);
const INLINE_NAMES = new Set(['icon', 'badge', 'ref', 'anchor']);

const FENCE_RE = /^(`{3,}|~{3,})/;

export function normalizeShortcodes(input) {
  if (typeof input !== 'string') return input;
  const lines = input.split('\n');
  const out = [];
  let inFence = false;
  let fenceChar = '';

  for (let i = 0; i < lines.length; i++) {
    const line    = lines[i];
    const trimmed = line.trim();

    const fenceMatch = trimmed.match(FENCE_RE);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceChar = fenceMatch[1][0];
      } else if (trimmed.startsWith(fenceChar.repeat(3))) {
        inFence = false;
      }
      out.push(line);
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    if (OPEN_RE.test(trimmed) || CLOSE_RE.test(trimmed)) {
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(trimmed);
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
    } else {
      out.push(line);
    }
  }

  return out.join('\n');
}

function parseProps(input) {
  const out = {};
  if (typeof input !== 'string' || input.length === 0) return out;
  PROP_RE.lastIndex = 0;
  let m;
  while ((m = PROP_RE.exec(input)) !== null) {
    out[m[1]] = castValue(m[2] !== undefined ? m[2] : m[3]);
  }
  return out;
}

function castValue(value) {
  if (value === 'true')  return true;
  if (value === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function paragraphText(node) {
  if (!node || node.type !== 'paragraph') return null;
  if (!Array.isArray(node.children) || node.children.length === 0) return null;

  let out = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      out += child.value;
    } else if (child.type === 'link' && typeof child.url === 'string') {
      out += child.url;
    } else {
      return null;
    }
  }
  return out.trim();
}

function makeData(name, props) {
  return {
    hName: 'shortcode-' + name,
    hProperties: { dataProps: JSON.stringify(props) },
  };
}

function splitParagraphLines(parent) {
  if (!parent || !Array.isArray(parent.children)) return;
  const out = [];

  for (const node of parent.children) {
    const onlyChild = node.type === 'paragraph'
      && Array.isArray(node.children)
      && node.children.length === 1
      && node.children[0].type === 'text'
      && typeof node.children[0].value === 'string'
      ? node.children[0]
      : null;

    if (onlyChild && onlyChild.value.includes('\n')) {
      const groups = [];
      let buffer = [];
      for (const line of onlyChild.value.split('\n')) {
        const trimmed = line.trim();
        if (OPEN_RE.test(trimmed) || CLOSE_RE.test(trimmed)) {
          if (buffer.length) {
            groups.push(buffer.join('\n'));
            buffer = [];
          }
          groups.push(trimmed);
        } else {
          buffer.push(line);
        }
      }
      if (buffer.length) groups.push(buffer.join('\n'));

      if (groups.length > 1) {
        for (const value of groups) {
          if (value.length === 0) continue;
          out.push({ type: 'paragraph', children: [{ type: 'text', value }] });
        }
        continue;
      }
    }

    if (Array.isArray(node.children)) splitParagraphLines(node);
    out.push(node);
  }

  parent.children = out;
}

function transformBlocks(parent) {
  if (!parent || !Array.isArray(parent.children)) return;
  const arr = parent.children;
  const out = [];
  let i = 0;

  while (i < arr.length) {
    const node = arr[i];
    const text = paragraphText(node);
    const open = text ? text.match(OPEN_RE) : null;

    if (open && BLOCK_NAMES.has(open[1])) {
      const name  = open[1];
      const props = parseProps(open[2]);

      if (VOID_NAMES.has(name)) {
        out.push({
          type: 'shortcode',
          name,
          props,
          children: [],
          data: makeData(name, props),
        });
        i++;
        continue;
      }

      let depth = 1;
      let j = i + 1;

      while (j < arr.length) {
        const t = paragraphText(arr[j]);
        if (t) {
          const om = t.match(OPEN_RE);
          if (om && BLOCK_NAMES.has(om[1]) && !VOID_NAMES.has(om[1])) {
            depth++;
          } else if (CLOSE_RE.test(t)) {
            depth--;
            if (depth === 0) break;
          }
        }
        j++;
      }

      if (j >= arr.length) {
        i++;
        continue;
      }

      const innerParent = { type: 'root', children: arr.slice(i + 1, j) };
      transformBlocks(innerParent);

      out.push({
        type: 'shortcode',
        name,
        props,
        children: innerParent.children,
        data: makeData(name, props),
      });

      i = j + 1;
      continue;
    }

    if (text && CLOSE_RE.test(text)) {
      i++;
      continue;
    }

    if (Array.isArray(node.children)) transformBlocks(node);
    out.push(node);
    i++;
  }

  parent.children = out;
}

function transformInlines(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if (child.type === 'text' && typeof child.value === 'string') {
      const value = child.value;
      INLINE_RE.lastIndex = 0;
      const replacements = [];
      let last = 0;
      let matched = false;
      let m;

      while ((m = INLINE_RE.exec(value)) !== null) {
        const name = m[1];
        if (!INLINE_NAMES.has(name)) continue;
        matched = true;

        if (m.index > last) {
          replacements.push({ type: 'text', value: value.slice(last, m.index) });
        }

        const props = parseProps(m[2]);
        replacements.push({
          type: 'shortcode',
          name,
          props,
          data: makeData(name, props),
        });

        last = m.index + m[0].length;
      }

      if (matched) {
        if (last < value.length) {
          replacements.push({ type: 'text', value: value.slice(last) });
        }
        node.children.splice(i, 1, ...replacements);
        i += replacements.length - 1;
      }
    } else {
      transformInlines(child);
    }
  }
}

export default function remarkShortcodes() {
  return (tree) => {
    splitParagraphLines(tree);
    transformBlocks(tree);
    transformInlines(tree);
  };
}
