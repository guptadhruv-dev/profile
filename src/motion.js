import { motion as tokens } from './design.config';

function toSeconds(value) {
  if (typeof value !== 'string') return 0.4;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0.4;
  return value.trim().endsWith('ms') ? n / 1000 : n;
}

function toEase(value) {
  if (typeof value === 'string') {
    const match = value.match(/cubic-bezier\(([^)]+)\)/);
    if (match) {
      const nums = match[1].split(',').map((s) => Number(s.trim()));
      if (nums.length === 4 && nums.every((x) => !Number.isNaN(x))) return nums;
    }
  }
  return 'easeInOut';
}

const duration = toSeconds(tokens.duration);
const ease     = toEase(tokens.ease);

export const transition = { duration, ease };

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};
