import type {BaseAttribute, FieldType} from "@/generator/attributes/base";
import BaseRelation from "@/generator/attributes/base-relation";
import {getComponentName} from "@/generator/utils/get-component-name";

export type ComponentAttribute = BaseAttribute & {
  type: 'component';
  repeatable: boolean,
  component: string,
  min?: number,
}

export default class Component extends BaseRelation {
  constructor(
    protected readonly name: string,
    protected readonly attribute: ComponentAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    const componentName = getComponentName(this.attribute.component);
    return this.attribute.repeatable ? `${componentName}[]` : componentName;
  }

  public getInputType(): string {
    const typeName = `${getComponentName(this.attribute.component)}Input`;
    return this.attribute.repeatable ? `${typeName}[]` : typeName;
  }

  public getPopulates() {
    return [{
      name: this.name,
      type: `${getComponentName(this.attribute.component)}Query`,
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