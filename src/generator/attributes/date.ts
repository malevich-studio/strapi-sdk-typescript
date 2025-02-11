import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type DateAttribute = BaseAttribute & {
  type: 'date';
}

export default class Date extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: DateAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'string';
  }
}
