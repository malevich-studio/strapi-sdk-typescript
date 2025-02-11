/**
 * Returns the TypeScript interface name from a component UID
 * e.g. "default.test-component" => "DefaultTestComponent"
 */
export function getComponentName(uid: string): string {
  return uid
    .split(/[\.\-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
