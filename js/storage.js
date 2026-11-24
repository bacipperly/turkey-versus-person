// localStorage wrapper. Every call is wrapped so the game still works when
// storage is blocked (private mode, strict settings): it just forgets.
const PREFIX = 'turkey-vs-person:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}
