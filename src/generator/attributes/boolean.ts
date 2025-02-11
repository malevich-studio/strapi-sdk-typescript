import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type BooleanAttribute = BaseAttribute & {
  type: 'boolean';
}

export default class Boolean extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: BooleanAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'boolean';
  }
}