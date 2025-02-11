import { generateStrapiTypes } from './generator';
import 'dotenv/config';
import {Strapi} from "./index.ts";

if (!process.env.STRAPI_URL || !process.env.STRAPI_TOKEN) {
  throw new Error('STRAPI_URL and STRAPI_TOKEN must be provided.');
}

const strapi = new Strapi(
  process.env.STRAPI_URL,
  process.env.STRAPI_TOKEN,
);

(async () => {
  await generateStrapiTypes(strapi);
})();
