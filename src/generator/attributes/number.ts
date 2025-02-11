import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type NumberAttribute = BaseAttribute & {
  type: 'integer' | 'biginteger' | 'decimal';
  min?: number;
  max?: number;
}

export default class Number extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: NumberAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'number';
  }
}