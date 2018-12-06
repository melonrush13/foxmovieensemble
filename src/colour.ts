export const stringToRGBA = (
  str: string,
  options?: { red?: number; green?: number; blue?: number; alpha?: number }
): string => {
  const cacheStr = str + JSON.stringify(options);
  const cached =
    cache[cacheStr] ||
    (cache[cacheStr] = randomColour({
      ...hexToRGB(stringToHexColour(str)),
      ...options
    }));

  return cached;
};

const cache: { [key: string]: any } = {};

/**
 * Convert any random string to a distinct 6 digit hex color string
 * @returns {string} of format `#000000`
 */
const stringToHexColour = (str: string): string => {
  const hash = str.split("").reduce((carry, char) => {
    // tslint:disable-next-line:no-bitwise
    return char.charCodeAt(0) + ((carry << 5) - carry);
  }, 0);

  let colour = "#";
  for (let i = 0; i < 3; i++) {
    // tslint:disable-next-line:no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    colour = colour + ("00" + value.toString(16)).substr(-2);
  }

  return colour;
};

/**
 * Convert hex colour string to an RGB map
 */
const hexToRGB = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      red: parseInt(result[1], 16),
      green: parseInt(result[2], 16),
      blue: parseInt(result[3], 16)
    };
  }
  throw new Error("Invalid Hex color string provided");
};

/**
 * Generate an HTML usable rgba()
 */
const randomColour = ({
  red = Math.floor(Math.random() * 256),
  green = Math.floor(Math.random() * 256),
  blue = Math.floor(Math.random() * 256),
  alpha = 1.0
}) => `rgba(${red},${green},${blue}, ${alpha})`;
