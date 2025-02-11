import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type EnumerationAttribute = BaseAttribute & {
  type: 'enumeration',
  enum: string[],
  default: string,
};

export default class Enumeration extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: EnumerationAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return `'${this.attribute.enum.join('\' | \'')}'`;
  }
}