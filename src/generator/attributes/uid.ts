import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type UidAttribute = BaseAttribute & {
  type: "uid";
  targetField?: string;
  pluginOptions?: {
    i18n?: {
      localized?: boolean;
    };
  };
};

export default class Uid extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: UidAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return "string";
  }
}
