/**
 * Returns the TypeScript interface name from a content type UID
 * e.g. "api::article.article" => "Article"
 */
export function getContentTypeName(uid: string): string {
  // Usually, UIDs look like "api::<api-name>.<model-name>"
  // We'll split at "::" and then take the part after the dot.
  const namePart = uid.split('::')[1] || uid;
  const modelName = namePart.split('.')[1] || namePart;
  // Convert to PascalCase
  return modelName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}