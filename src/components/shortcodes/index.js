import Toggle from './toggle-shortcode'
import Icon from './icon-shortcode'
import Callout from './callout-shortcode'
import Badge from './badge-shortcode'
import Columns from './columns-shortcode'
import Column from './column-shortcode'
import Card from './card-shortcode'
import Gallery from './gallery-shortcode'
import Embed from './embed-shortcode'
import Bookmark from './bookmark-shortcode'
import Ref from './reference'
import Anchor from './anchor-shortcode'
import Space from './space-shortcode'

const shortcodeRenderers = Object.freeze({
  toggle: Toggle,
  icon: Icon,
  callout: Callout,
  badge: Badge,
  columns: Columns,
  col: Column,
  card: Card,
  gallery: Gallery,
  embed: Embed,
  bookmark: Bookmark,
  ref: Ref,
  anchor: Anchor,
  space: Space,
})

export const shortcodeNames = new Set(Object.keys(shortcodeRenderers))
export const shortcodeComponents = Object.fromEntries(
  Object.entries(shortcodeRenderers).map(([shortcodeName, renderer]) => [
    `shortcode-${shortcodeName}`,
    renderer,
  ]),
)
