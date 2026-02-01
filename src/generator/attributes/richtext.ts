import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type RichtextAttribute = BaseAttribute & {
  type: "richtext";
};

export default class Richtext extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: RichtextAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return "string";
  }
}
