export default function extractNumberFromCockSizeText(
  inputString: string,
): number | false {
  const regex = /is (\d+)cm/;
  const match = inputString.match(regex);

  if (match && match[1]) {
    const numberValue = parseInt(match[1], 10);
    return isNaN(numberValue) ? false : numberValue;
  } else {
    return false;
  }
}
