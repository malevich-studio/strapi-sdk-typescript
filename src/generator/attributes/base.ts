export type BaseAttribute = {
  configurable?: boolean;
  required?: boolean;
  private?: boolean;
}

export enum AttributeMode {
  Field = 'field',
  Relation = 'relation',
}

export type FieldType = {
  name: string;
  type: string;
}

export default class Base {
  constructor(
    protected readonly name: string,
    protected readonly attribute: BaseAttribute,
  ) {}

  public getType(): string {
    return 'any';
  }

  public getInputType(): string {
    return this.getType();
  }

  public getImports(): string[] {
    return [];
  }

  public getPackages(): string[] {
    return [];
  }

  public getFields(): string[] {
    return [
      this.name,
    ];
  }

  public getSortFields(): string[] {
    return [
      this.name,
      `${this.name}:asc`,
      `${this.name}:desc`,
    ];
  }

  public getPopulates(): FieldType[] {
    return [];
  }

  public getFilters(): FieldType[] {
    return [
      {
        name: this.name,
        type: `FilterValue<${this.getType()}>`,
      },
    ];
  }

  public getMode(): AttributeMode {
    return AttributeMode.Field;
  }
}