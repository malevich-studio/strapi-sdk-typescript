import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type TimeAttribute = BaseAttribute & {
  type: 'time';
}

export default class Time extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: TimeAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'string';
  }
}
