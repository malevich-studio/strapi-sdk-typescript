import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type DateTimeAttribute = BaseAttribute & {
  type: 'datetime';
}

export default class DateTime extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: DateTimeAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'string';
  }
}
