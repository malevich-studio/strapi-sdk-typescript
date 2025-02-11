import * as fs from 'fs';
import * as path from 'path';
import { Strapi } from "@/index.ts";
import type {StringAttribute} from "@/generator/attributes/string";
import type {NumberAttribute} from "@/generator/attributes/number";
import type {BooleanAttribute} from "@/generator/attributes/boolean";
import type {MediaAttribute} from "@/generator/attributes/media";
import type {RelationAttribute} from "@/generator/attributes/relation";
import type {EnumerationAttribute} from "@/generator/attributes/enumeration";
import type {BlocksAttribute} from "@/generator/attributes/blocks";
import type {JsonAttribute} from "@/generator/attributes/json";
import type {ComponentAttribute} from "@/generator/attributes/component";
import {getComponentName} from "@/generator/utils/get-component-name";
import getAttributeGenerator from "@/generator/attributes";
import {getContentTypeName} from "@/generator/utils/get-content-type-name";
import type {DateTimeAttribute} from "@/generator/attributes/date-time";
import type {FieldType} from "@/generator/attributes/base";

enum ContentTypeKind {
  CollectionType = 'collectionType',
  SingleType = 'singleType',
}

type Attribute = StringAttribute | NumberAttribute | BooleanAttribute | DateTimeAttribute | RelationAttribute | ComponentAttribute | EnumerationAttribute | MediaAttribute | JsonAttribute | BlocksAttribute;
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
    // pluginOptions: {},
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

function generateMethodsCode(contentType: ContentType) {
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
    `    return await this.update<${modelName}, ${modelName}Input>('${contentType.schema.pluralName}', id, data, params);`,
    '  }',
  ].join('\n'));

  methods.push([
    `  public async delete${getContentTypeName(contentType.schema.singularName)}(id: string, params?: RequestInit) {`,
    `    return await this.delete<${modelName}>('${contentType.schema.pluralName}', id, params);`,
    '  }',
  ].join('\n'));

  return methods;
}

/**
 * Main function to fetch Strapi (v5) data and generate the d.ts file
 */
export async function generateStrapiTypes(strapi: Strapi) {
  const contentTypes = (await strapi.request<ContentType[]>('content-type-builder/content-types')).data;
  const components = (await strapi.request<Component[]>('content-type-builder/components')).data;

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

    methods.push(...generateMethodsCode(contentType));
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
      ...contentType.schema.attributes,
    }
    allInterfaces.push(generateResponseTypeCode(modelName, attributes));
    allInterfaces.push(generateQueryTypeCode(modelName, attributes));
    allInterfaces.push(generateInputTypeCode(modelName, attributes));
  }

  const output = [
    'import {Strapi as StrapiBase, Query, Filters, FilterValue, RelationInput} from "@malevich-studio/strapi-sdk-typescript";',
    'import {BlocksContent} from "@strapi/blocks-react-renderer";',
    '',
    'export default class Strapi extends StrapiBase {',
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
