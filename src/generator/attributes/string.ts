import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type StringAttribute = BaseAttribute & {
  type: 'text' | 'string' | 'password' | 'email';
  minLength?: number;
  maxLength?: number;
  searchable?: boolean;
}

export default class String extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: StringAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'string';
  }
}