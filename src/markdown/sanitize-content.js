import { defaultSchema } from 'rehype-sanitize'

const safeTextAlignmentPattern = /^text-align:\s*(?:left|right|center|justify|start|end)\s*;?$/i
const forbiddenRawTags = new Set(['iframe', 'script', 'style', 'object', 'embed'])

export function createContentSanitizeSchema(shortcodeTagNames) {
  const tagNames = [
    ...(defaultSchema.tagNames ?? []).filter((tagName) => !forbiddenRawTags.has(tagName)),
    ...shortcodeTagNames,
  ]
  const attributes = {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), ['style', safeTextAlignmentPattern]],
  }

  for (const shortcodeTagName of shortcodeTagNames) {
    attributes[shortcodeTagName] = [['dataProps']]
  }

  return {
    ...defaultSchema,
    tagNames,
    attributes,
  }
}
