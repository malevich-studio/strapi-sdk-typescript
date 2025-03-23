import type {BaseAttribute, FieldType} from "@/generator/attributes/base";
import BaseRelation from "@/generator/attributes/base-relation";
import {getComponentName} from "@/generator/utils/get-component-name";

export type DynamiczoneAttribute = BaseAttribute & {
  type: 'dynamiczone';
  components: string[],
}

export default class Dynamiczone extends BaseRelation {
  constructor(
    protected readonly name: string,
    protected readonly attribute: DynamiczoneAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    const types = this.attribute.components
      .map(componentItem => `DynamiczoneComponent<'${componentItem}', ${getComponentName(componentItem)}>`)
      .join(' | ');
    return `(${types})[]`;
  }

  public getInputType(): string {
    const types = this.attribute.components
      .map(componentItem => `DynamiczoneComponent<'${componentItem}', ${getComponentName(componentItem)}Input>`)
      .join(' | ');
    return `(${types})[]`;
  }

  public getPopulates() {
    const types = this.attribute.components
      .map(componentItem => `{ '${componentItem}': ${getComponentName(componentItem)}Query }`)
      .join(' & ');
    return [{
      name: this.name,
      type: `DynamiczonePopulate<${types}>`,
    }];
  }

  public getFilters(): FieldType[] {
    return [
      // {
      //   name: this.name,
      //   type: `${getComponentName(this.attribute.component)}Filters`,
      // }
    ];
  }
}
