function hashSeed(value) {
  return String(value).split("").reduce(
    (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
    2166136261
  );
}

export function stableShuffle(items, seed) {
  const copy = [...items];
  let state = hashSeed(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}
