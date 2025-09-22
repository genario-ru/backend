export const getExpirationDate = (duration: number) => {
  const sessionExpiresAtTimestamp = Date.now() + duration;

  return new Date(sessionExpiresAtTimestamp);
};
