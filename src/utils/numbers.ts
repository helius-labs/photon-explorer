export const formatLargeSize = (value: number | string): string => {
  const number = Number(value);
  if (isNaN(number)) return value.toString();
  if (number < 1000) return number.toFixed(2);
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log(number) / Math.log(1000));
  return parseFloat((number / Math.pow(1000, i)).toFixed(2)) + suffixes[i];
};
