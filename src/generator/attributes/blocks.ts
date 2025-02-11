import Base from "@/generator/attributes/base";
import type {BaseAttribute} from "@/generator/attributes/base";

export type BlocksAttribute = BaseAttribute & {
  type: 'blocks';
}

export default class Blocks extends Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: BlocksAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    return 'BlocksContent';
  }

  getImports(): string[] {
    return [
      ...super.getImports(),
      'import {BlocksContent} from "@strapi/blocks-react-renderer";',
    ];
  }

  getPackages(): string[] {
    return [
      ...super.getPackages(),
      '@strapi/blocks-react-renderer',
    ];
  }
}
