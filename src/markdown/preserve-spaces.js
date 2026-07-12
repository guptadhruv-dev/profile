const multipleWhitespacePattern = /[ \t]{2,}/g
const nonBreakingSpace = '\u00a0'

function preserveSpaces(node) {
  if (!node) return

  if (node.type === 'text' && typeof node.value === 'string') {
    node.value = node.value.replace(multipleWhitespacePattern, (matchedWhitespace) =>
      nonBreakingSpace.repeat(matchedWhitespace.length),
    )
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) preserveSpaces(child)
  }
}

export default function remarkPreserveSpaces() {
  return (tree) => preserveSpaces(tree)
}
