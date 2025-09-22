export const generateDigitCode = (length: number) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString();
};
