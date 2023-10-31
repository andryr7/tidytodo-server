export const preprocessSearchTerms = (searchTerm: string) => {
  const tsquerySpecialChars = /[()|&:*!]/g;
  return searchTerm
    .trim()
    .replace(tsquerySpecialChars, ' ')
    .split(/\s+/)
    .join(' & ');
};
