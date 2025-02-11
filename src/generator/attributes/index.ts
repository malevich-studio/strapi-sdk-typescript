import Media from "@/generator/attributes/media";
import Relation from "@/generator/attributes/relation";
import Enumeration from "@/generator/attributes/enumeration";
import DateTime from "@/generator/attributes/date-time";
import Component from "@/generator/attributes/component";
import Blocks from "@/generator/attributes/blocks";
import Json from "@/generator/attributes/json";
import String from "@/generator/attributes/string";
import Number from "@/generator/attributes/number";
import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";
import Boolean from "@/generator/attributes/boolean.ts";
import Date from "@/generator/attributes/date.ts";

const types: Record<string, typeof Base> = {
  'string': String,
  'text': String,
  'password': String,
  'email': String,
  'integer': Number,
  'biginteger': Number,
  'decimal': Number,
  'float': Number,
  'boolean': Boolean,
  'media': Media,
  'relation': Relation,
  'enumeration': Enumeration,
  'date': Date,
  'datetime': DateTime,
  'component': Component,
  'blocks': Blocks,
  'json': Json,
};

export default function getAttributeGenerator(name: string, attribute: BaseAttribute & {type: string}): Base {
  if (!types[attribute.type]) {
    throw new Error(`Attribute type "${attribute.type}" is not defined`);
  }

  return new types[attribute.type](name, attribute);
}
