/**
 * Extracts variable names from a string.
 * Variables are expected to be in the format {{variableName}}.
 * It extracts unique variable names.
 *
 * @param content The string to extract variables from.
 * @returns An array of unique variable names.
 */
export const extractVariablesFromString = (content: string): string[] => {
  if (!content) {
    return [];
  }
  const regex = /{{\s*(\w+)\s*}}/g;
  const matches = [...content.matchAll(regex)];
  const newVariables = matches.map((match) => match[1]);
  // Return unique variable names
  return [...new Set(newVariables)];
};

/**
 * Substitutes variables in a template string with their corresponding values.
 *
 * @param template The template string with {{variable}} placeholders.
 * @param variables An array of variable names to look for (though not strictly necessary if values object is comprehensive).
 * @param values A record/object where keys are variable names and values are their substitution values.
 * @returns The processed string with variables substituted.
 */
export const substituteVariables = (
  template: string,
  values: Record<string, string>
): string => {
  if (!template) {
    return "";
  }
  let processedString = template;
  // Iterate over the values provided for substitution
  for (const variable in values) {
    if (Object.prototype.hasOwnProperty.call(values, variable)) {
      const value = values[variable] || ""; // Use empty string if value is null/undefined
      // Ensure replacement is global for each variable
      processedString = processedString.replace(
        new RegExp(`{{\\s*${variable}\\s*}}`, "g"),
        value
      );
    }
  }
  // Optional: remove any placeholders that were not in the 'values' object
  // processedString = processedString.replace(/{{\s*\w+\s*}}/g, ""); // Uncomment if un-substituted vars should be blanked
  return processedString;
};
