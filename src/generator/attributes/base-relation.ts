import Base, {AttributeMode} from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export default class BaseRelation extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: BaseAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'any';
  }

  public getFields(): string[] {
    return [];
  }

  public getSortFields(): string[] {
    return [];
  }

  public getMode(): AttributeMode {
    return AttributeMode.Relation;
  }
}