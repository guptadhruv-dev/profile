import { readProps } from './props';

const COLOR_MAP = {
  primary:   'var(--color-fg-primary)',
  secondary: 'var(--color-fg-secondary)',
};

const WEIGHT_MAP = {
  thin:       100,
  extralight: 200,
  light:      300,
  regular:    400,
  medium:     500,
  semibold:   600,
  bold:       700,
};

const GRAD_MAP = {
  low:    -25,
  normal:   0,
  high:   200,
};

function toNumber(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return fallback;
}

export default function Icon({ node }) {
  const { name, size, weight, color, fill, grad, opsz, gap } = readProps(node);

  if (typeof name !== 'string' || name.length === 0) return null;
  const iconName = name.trim().toLowerCase().replace(/\s+/g, '_');

  const fontSize  = toNumber(size, 28);
  const weightVal = typeof weight === 'string' && weight in WEIGHT_MAP
    ? WEIGHT_MAP[weight]
    : toNumber(weight, 400);
  const fillVal   = fill === true || fill === 1 || fill === 'true' || fill === '1' ? 1 : 0;
  const gradVal   = typeof grad === 'string' && grad in GRAD_MAP
    ? GRAD_MAP[grad]
    : toNumber(grad, 0);
  const opszVal   = toNumber(opsz, Math.min(48, Math.max(20, fontSize)));

  const resolvedColor = typeof color === 'string'
    ? (COLOR_MAP[color] ?? color)
    : 'currentColor';

  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{
        fontSize:              fontSize+1 + 'px',
        lineHeight:            '1.0em',
        paddingBottom:         '0.2em',
        display:               'inline-block',
        verticalAlign:         'middle',
        color:                 resolvedColor,
        marginRight:           toNumber(gap, 6) + 'px',
        fontVariationSettings: `'FILL' ${fillVal}, 'wght' ${weightVal}, 'GRAD' ${gradVal}, 'opsz' ${opszVal}`,
      }}
    >
      {iconName}
    </span>
  );
}
