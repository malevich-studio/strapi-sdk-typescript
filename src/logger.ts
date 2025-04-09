import createDebug from 'debug';
export const logger = (namespace: string) => createDebug(`strapi-sdk-typescript:${namespace}`);