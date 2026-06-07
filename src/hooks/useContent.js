import { useState, useEffect } from 'react';

const BASE_URL = 'https://data.guptadhruv.dev';

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { meta: {}, content: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, content: raw };
  const block = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trim();
  const meta = {};
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val === 'true')       meta[key] = true;
    else if (val === 'false') meta[key] = false;
    else if (/^\d+$/.test(val)) meta[key] = Number(val);
    else                      meta[key] = val;
  }
  return { meta, content };
}

export function useContent() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/index.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch index (' + res.status + ')');
        return res.json();
      })
      .then(filenames =>
        Promise.all(
          filenames.map(filename =>
            fetch(`${BASE_URL}/${filename}`)
              .then(res => {
                if (!res.ok) throw new Error('Failed to fetch ' + filename);
                return res.text();
              })
              .then(raw => {
                const { meta, content } = parseFrontmatter(raw);
                const id = filename.replace(/\.md$/, '');
                const vars = {};
                for (const [k, v] of Object.entries(meta)) {
                  if (k.startsWith('$')) vars[k.slice(1)] = v;
                }
                return { id, label: meta.label, rank: meta.rank, vars, content };
              })
          )
        )
      )
      .then(data => {
        setSections(data.sort((a, b) => a.rank - b.rank));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { sections, loading };
}
