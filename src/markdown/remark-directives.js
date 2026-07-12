import { shortcodeNames } from '../components/shortcodes'

const directiveTypes = new Set(['textDirective', 'leafDirective', 'containerDirective'])

function castValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

function toShortcode(node) {
  if (!shortcodeNames.has(node.name)) {
    node.data = {
      ...node.data,
      hName: node.type === 'containerDirective' ? 'div' : 'span',
    }
    return
  }

  const attributes = node.attributes ?? {}
  const props = {}
  for (const key of Object.keys(attributes)) {
    const value = attributes[key]
    props[key] = typeof value === 'string' ? castValue(value) : value
  }
  node.data = {
    ...node.data,
    hName: `shortcode-${node.name}`,
    hProperties: { dataProps: JSON.stringify(props) },
  }
}

function walk(node) {
  if (directiveTypes.has(node.type)) toShortcode(node)
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child)
  }
}

export default function remarkDirectiveShortcodes() {
  return (tree) => walk(tree)
}
