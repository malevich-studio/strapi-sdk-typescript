# Strapi SDK for TypeScript

A TypeScript SDK for interacting with Strapi APIs.

⚠️ **This SDK is designed specifically for Strapi 5. It will not work with previous versions of Strapi.** ⚠️

## 🚀 Installation

To install the SDK, run:

```sh
npm install @malevich-studio/strapi-sdk-typescript
```

## 🛠 Configuration

Create a `.env` file with your Strapi base URL and API token:

```sh
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=<your_strapi_token>
```

### Generating API Token

To interact with the Strapi API, you need to create an API token with at least `Content-Type Builder` permissions.
Navigate to:

```
<your_strapi_base_url>/admin/settings/api-tokens/create
```

### Generating API Class

Run the following command to generate TypeScript types based on your Strapi schema:

```sh
npx generate-strapi-types
```

## 📌 Usage

### Basic Example

Create `strapi.ts` to initialize the API class:

```ts
import Strapi from "./strapi"; // strapi.ts file

const api = new Strapi(process.env.STRAPI_URL || '', process.env.STRAPI_TOKEN || '');

const articles = api.articles({
  fields: ["documentId", "title", "text"],
  populate: {
    seo: {
      fields: ["slug", "metaTitle", "metaDescription"],
      populate: {
        openGraph: {
          fields: ["title", "description", "url", "type"],
          populate: {
            image: {
              fields: ["url", "width", "height"]
            }
          }
        }
      }
    }
  }
});
```

### Using in Next.js with Caching

If using Next.js, you can integrate caching for better performance:

```ts
import Strapi from "@/strapi"; // strapi.ts file

const api = new Strapi(process.env.STRAPI_URL || '', process.env.STRAPI_TOKEN || '');

const articles = api.articles(
  {
    fields: ["documentId", "title", "text"],
    populate: {
      seo: {
        fields: ["slug", "metaTitle", "metaDescription"],
        populate: {
          openGraph: {
            fields: ["title", "description", "url", "type"],
            populate: {
              image: {
                fields: ["url", "width", "height"]
              }
            }
          }
        }
      }
    }
  },
  // Cache Options
  {
    cache: "force-cache",
    next: {
      revalidate: 24 * 3600, // Revalidate every 24 hours
      tags: ["contact", "regions"]
    }
  }
);
```

### Login Example

Next.js

```ts
'use server';

import Strapi from '@/strapi';
import { cookies } from 'next/headers';

export async function login(email: string, password: string) {
  const strapi = new Strapi(process.env.STRAPI_URL || '');
  const response = await strapi.login(email, password);

  if (!response.error) {
    (await cookies()).set('access_token', response.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 24 * 365 * 10,
    });
  }

  return response;
}
```

## 📌 TODO List

- [ ] Add authentication features:
    - [x] Log In functionality
    - [x] User Registration
    - [ ] User privileges check
- [x] Add localization features
- [ ] Refactor `src/generator/index.ts` for better maintainability
- [ ] Enable passing Strapi credentials via CLI parameters
- [ ] Allow customization of API class path
- [ ] Resolve naming conflicts between Components and Content Types
- [ ] Support custom attributes in `src/generator/attributes/index.ts:15`:
    - [ ] Define attributes by project code
    - [ ] Auto-load attributes from other npm packages by scanning `node_modules`

---

📌 **Contributions are welcome!** If you encounter issues or have feature requests, feel free to open a pull request or an issue. 🚀

📦 [View on NPM](https://www.npmjs.com/package/@malevich-studio/strapi-sdk-typescript)
🔗 [GitHub Repository](https://github.com/malevich-studio/strapi-sdk-typescript)
