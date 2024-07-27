export const generateSlug = (name: string): string => {
  return name
    .toLowerCase() // Convert to lowercase
    .trim() // Remove any leading or trailing spaces
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};
