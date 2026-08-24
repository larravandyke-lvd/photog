// Maps the raw sequential item_number (1, 2, 3, ...) to the color-coded
// sticker scheme: B1-B100, then G1-G100, then R1-R100, then O1-O100, then
// wraps back to B101... no — wraps back to B1 with a new "set" suffix isn't
// needed since 400 stickers (4 colors x 100) covers the whole roll pack.
// If you ever pass item 401, it cycles back to B1 — buy another pack before then.

export const STICKER_COLORS = [
  { letter: 'B', name: 'Blue', hex: '#2f5fa8', bg: '#2f5fa8', text: '#ffffff' },
  { letter: 'G', name: 'Green', hex: '#3f8a4a', bg: '#3f8a4a', text: '#ffffff' },
  { letter: 'R', name: 'Red', hex: '#c23b3b', bg: '#c23b3b', text: '#ffffff' },
  { letter: 'Or', name: 'Orange', hex: '#d9822b', bg: '#d9822b', text: '#ffffff' },
] as const;

export function getItemCode(itemNumber: number) {
  const zeroIndexed = itemNumber - 1;
  const colorIndex = Math.floor(zeroIndexed / 100) % STICKER_COLORS.length;
  const numberInColor = (zeroIndexed % 100) + 1;
  const color = STICKER_COLORS[colorIndex];
  return {
    code: `${color.letter}${numberInColor}`,
    number: numberInColor,
    ...color,
  };
}
