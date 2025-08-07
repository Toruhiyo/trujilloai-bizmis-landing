export const getCurrentDate = (): Date => {
  return new Date();
};

export const getCurrentYear = (): number => {
  return getCurrentDate().getFullYear();
};
