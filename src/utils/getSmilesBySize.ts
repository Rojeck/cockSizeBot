export default function (size: number): string {
  if (size < 3) {
    return '🤬';
  } else if (size < 5) {
    return '😭';
  } else if (size < 10) {
    return '🥺';
  } else if (size < 15) {
    return '😐';
  } else if (size < 20) {
    return '😏';
  } else if (size < 25) {
    return '🥳';
  } else if (size < 30) {
    return '😌';
  } else if (size < 35) {
    return '😱🙉';
  } else if (size < 40) {
    return '🍌😎👑';
  } else {
    return '🫨🦄🤩';
  }
}
