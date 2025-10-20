import * as fs from 'fs';
import * as path from 'path';
import {type Permissions, Strapi} from "@/index.ts";
import type {StringAttribute} from "@/generator/attributes/string";
import type {NumberAttribute} from "@/generator/attributes/number";
import type {BooleanAttribute} from "@/generator/attributes/boolean";
import type {MediaAttribute} from "@/generator/attributes/media";
import {AttributeRelation, type RelationAttribute} from "@/generator/attributes/relation";
import type {EnumerationAttribute} from "@/generator/attributes/enumeration";
import type {BlocksAttribute} from "@/generator/attributes/blocks";
import type {JsonAttribute} from "@/generator/attributes/json";
import type {ComponentAttribute} from "@/generator/attributes/component";
import {getComponentName} from "@/generator/utils/get-component-name";
import getAttributeGenerator from "@/generator/attributes";
import {getContentTypeName} from "@/generator/utils/get-content-type-name";
import type {DateTimeAttribute} from "@/generator/attributes/date-time";
import type {FieldType} from "@/generator/attributes/base";
import type {TimeAttribute} from "@/generator/attributes/time.ts";

enum ContentTypeKind {
  CollectionType = 'collectionType',
  SingleType = 'singleType',
}

type Attribute = StringAttribute | NumberAttribute | BooleanAttribute | DateTimeAttribute | TimeAttribute | RelationAttribute | ComponentAttribute | EnumerationAttribute | MediaAttribute | JsonAttribute | BlocksAttribute;
type Attributes = {
  [attributeName: string]: Attribute;
}

/**
 * Response type from /content-type-builder/content-types
 * (Structure is usually the same in Strapi 4/5, but is not officially documented.)
 */
interface ContentType {
  uid: string;
  apiID: string;
  schema: {
    draftAndPublish: boolean,
    displayName: string,
    singularName: string,
    pluralName: string,
    description: string,
    pluginOptions: {
      i18n?: {
        localized: false,
      },
    },
    kind: ContentTypeKind,
    collectionName: string,
    visible: boolean,
    // restrictRelationsTo: null
    attributes: Attributes;
  }
}

/**
 * Response type from /content-type-builder/components
 */
interface Component {
  uid: string;
  category: string;
  apiID: string;
  schema: {
    displayName: string,
    description: string,
    icon: string,
    collectionName: string,
    attributes: Attributes;
  };
}

function getContentTypeMethodName(uid: string): string {
  const typeName = getContentTypeName(uid);
  return typeName.charAt(0).toLowerCase() + typeName.slice(1)
}

/**
 * Generates a TS interface from a content type or component definition
 */
function generateResponseTypeCode(
  name: string,
  attributes: Attributes
): string {
  const lines: string[] = [];
  lines.push(`export type ${name} = {`);

  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    const isRequired = attribute.required ? '' : '?';
    lines.push(`  ${attributeName}${isRequired}: ${getAttributeGenerator(attributeName, attribute).getType()};`);
  }

  lines.push(`}`);
  return lines.join('\n');
}

function generateQueryTypeCode(name: string, attributes: Attributes): string {
  const fields: string[] = [];
  const sortFields: string[] = [];
  const filters: FieldType[] = [];
  const populates: FieldType[] = [];


  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    const attributeGenerator = getAttributeGenerator(attributeName, attribute);
    fields.push(...attributeGenerator.getFields());
    sortFields.push(...attributeGenerator.getSortFields());
    filters.push(...attributeGenerator.getFilters());
    populates.push(...attributeGenerator.getPopulates());
  }

  const lines: string[] = [];
  lines.push(`export type ${name}Filters = Filters<{`);
  lines.push(...filters.map(({name, type}) => `  ${name}?: ${type};`));
  lines.push(`}>`);
  lines.push('');
  lines.push(`export type ${name}Populate = {`);
  lines.push(...populates.map(({name, type}) => `  ${name}?: ${type};`));
  lines.push(`}`);
  lines.push('');
  lines.push(`export type ${name}Query  = Query<`);
  lines.push(`  ${fields.map(field => `'${field}'`).join(' | ')},`);
  lines.push(`  ${sortFields.map(field => `'${field}'`).join(' | ')},`);
  lines.push(`  ${name}Filters,`);
  lines.push(`  ${name}Populate`);
  lines.push(`>`);
  return lines.join('\n');
}

function generateInputTypeCode(name: string, attributes: Attributes): string {
  const fields: FieldType[] = [];

  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    const attributeGenerator = getAttributeGenerator(attributeName, attribute);
    fields.push({
      name: attributeName,
      type: attributeGenerator.getInputType(),
    });
  }

  const lines: string[] = [];
  lines.push(`export type ${name}Input = {`);
  lines.push(...fields.map(({name, type}) => `  ${name}?: ${type};`));
  lines.push(`}`);
  return lines.join('\n');
}

function generateMethodsCode(contentType: ContentType, permissions: Permissions): string[] {
  const methods: string[] = []
  const modelName = getContentTypeName(contentType.uid);

  if (contentType.schema.kind === ContentTypeKind.CollectionType) {
    methods.push([
      `  public async ${getContentTypeMethodName(contentType.schema.pluralName)}(query?: ${modelName}Query, params?: RequestInit) {`,
      `    return await this.getDocuments<${modelName}, ${modelName}Query>('${contentType.schema.pluralName}', query, params);`,
      '  }',
    ].join('\n'));
  }
  methods.push([
    `  public async ${getContentTypeMethodName(contentType.schema.singularName)}(query?: ${modelName}Query, params?: RequestInit) {`,
    `    return await this.getDocument<${modelName}, ${modelName}Query>('${contentType.schema.singularName}', query, params);`,
    '  }',
  ].join('\n'));

  methods.push([
    `  public async create${getContentTypeName(contentType.schema.singularName)}(data: ${modelName}Input, params?: RequestInit) {`,
    `    return await this.create<${modelName}, ${modelName}Input>('${contentType.schema.pluralName}', data, params);`,
    '  }',
  ].join('\n'));

  methods.push([
    `  public async update${getContentTypeName(contentType.schema.singularName)}(id: string, data: ${modelName}Input, params?: RequestInit) {`,
    `    return await this.update${modelName === 'User' ? 'BaseUser' : ''}<${modelName}, ${modelName}Input>('${contentType.schema.pluralName}', id, data, params);`,
    '  }',
  ].join('\n'));

  methods.push([
    `  public async delete${getContentTypeName(contentType.schema.singularName)}(id: string, params?: RequestInit) {`,
    `    return await this.delete<${modelName}>('${contentType.schema.pluralName}', id, params);`,
    '  }',
  ].join('\n'));

  if (contentType.uid.startsWith('api::')) {
    const actions = Object.keys(permissions[contentType.uid.split('.')[0]].controllers[contentType.schema.singularName]);
    methods.push([
      `  public async can${getContentTypeName(contentType.schema.singularName)}(action: '${actions.join('\' | \'')}') {`,
      `    return await this.can('${contentType.uid.split('.')[0]}', '${contentType.schema.singularName}', action);`,
      '  }',
    ].join('\n'));
  }

  return methods;
}

/**
 * Main function to fetch Strapi (v5) data and generate the d.ts file
 */
export async function generateStrapiTypes(strapi: Strapi) {
  const contentTypes = (await strapi.fetch<ContentType[]>('content-type-builder/content-types')).data || [];
  const components = (await strapi.fetch<Component[]>('content-type-builder/components')).data || [];
  const permissions = (await strapi.fetchData<{permissions: Permissions}>('users-permissions/permissions')).permissions || {};

  const allInterfaces: string[] = [];
  const methods: string[] = [];

  for (const component of components) {
    const componentName = getComponentName(component.uid);
    const attributes: Attributes = {
      id: {
        type: 'integer',
      },
      ...component.schema.attributes,
    }
    allInterfaces.push(generateResponseTypeCode(componentName, attributes));
    allInterfaces.push(generateQueryTypeCode(componentName, attributes));
    allInterfaces.push(generateInputTypeCode(componentName, attributes));
  }

  for (const contentType of contentTypes) {
    if (!['api::', 'plugin::upload', 'plugin::users-permissions'].filter(prefix => contentType.uid.startsWith(prefix)).length) {
      continue;
    }

    methods.push(...generateMethodsCode(contentType, permissions));
    const modelName = getContentTypeName(contentType.uid);
    const attributes: Attributes = {
      id: {
        type: 'integer',
      },
      documentId: {
        type: 'string',
      },
      createdAt: {
        type: 'datetime',
      },
      updatedAt: {
        type: 'datetime',
      },
      ...(contentType.schema.draftAndPublish ? {
        publishedAt: {
          type: 'datetime',
        },
      } : {}),
      ...(contentType.schema.pluginOptions?.i18n?.localized ? {
        locale: {
          type: 'string',
        },
        localizations: {
          type: 'relation',
          target: contentType.uid,
          relation: AttributeRelation.OneToMany,
          required: true,
        },
      } : {}),
      ...contentType.schema.attributes,
    }
    allInterfaces.push(generateResponseTypeCode(modelName, attributes));
    allInterfaces.push(generateQueryTypeCode(modelName, attributes));
    allInterfaces.push(generateInputTypeCode(modelName, attributes));
  }

  const output = [
    'import {Strapi as StrapiBase, Query, Filters, FilterValue, RelationInput, DynamiczonePopulate, DynamiczoneComponent, PermissionAction} from "@malevich-studio/strapi-sdk-typescript";',
    'import {BlocksContent} from "@strapi/blocks-react-renderer";',
    '',
    'export default class Strapi extends StrapiBase {',
    `  public async login(identifier: string, password: string) {`,
    `    return await this.baseLogin<User>(identifier, password);`,
    '  }',
    '  ',
    `  public async register(data: UserInput) {`,
    `    return await this.baseRegister<User, UserInput>(data);`,
    '  }',
    '  ',
    `  public async resetPassword(password: string, code: string) {`,
    `    return await this.baseResetPassword<User>(password, code);`,
    '  }',
    '  ',
    `  public async changePassword(password: string, currentPassword: string) {`,
    `    return await this.baseChangePassword<User>(password, currentPassword);`,
    '  }',
    '  ',
    `  public async me(data: UserQuery) {`,
    `    return await this.baseMe<User, UserQuery>(data);`,
    '  }',
    '  ',
    methods.join('\n\n'),
    '}',
    '',
    allInterfaces.join('\n\n'),
    '',
  ].join('\n');
  const outPath = path.join(process.cwd(), 'strapi.ts');
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`✅ "strapi.ts" has been successfully generated!`);
}
