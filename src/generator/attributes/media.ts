import type {BaseAttribute} from "@/generator/attributes/base";
import BaseRelation from "@/generator/attributes/base-relation";

export type MediaAttribute = BaseAttribute & {
  type: 'media';
  multiple: boolean;
  allowedTypes: string[];
}

export default class Media extends BaseRelation {
  constructor(
    protected readonly name: string,
    protected readonly attribute: MediaAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return this.attribute.multiple ? 'File[]' : 'File';
  }

  public getInputType(): string {
    return 'RelationInput';
  }

  public getPopulates() {
    return [{
      name: this.name,
      type: 'FileQuery',
    }];
  }

  public getFilters() {
    return [{
      name: this.name,
      type: 'FileFilters',
    }];
  }
}
