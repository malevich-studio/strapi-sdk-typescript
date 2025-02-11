import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type JsonAttribute = BaseAttribute & {
  type: 'json';
};

export default class Json extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: JsonAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'object';
  }

  public getFilters() {
    return [];
  }
}