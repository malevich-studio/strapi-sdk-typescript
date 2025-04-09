import type {BaseAttribute} from "@/generator/attributes/base";
import BaseRelation from "@/generator/attributes/base-relation";
import {getContentTypeName} from "@/generator/utils/get-content-type-name";

export enum AttributeRelation {
  MorphToMany = 'morphToMany',
  ManyToOne = 'manyToOne',
  ManyToMany = 'manyToMany',
  OneToMany = 'oneToMany',
  OneToOne = 'oneToOne',
}

type RelationData = {
  documentId: string;
  before?: string;
  after?: string;
  start?: true;
  end?: true;
  locale?: string;
  status?: 'published' | 'draft',
} | string;

export type RelationInput = {
  connect?: RelationData[];
  disconnect?: RelationData[];
  set?: RelationData[];
} | RelationData[];

export type RelationAttribute = BaseAttribute & {
  type: 'relation';
  relation: AttributeRelation;
  target: string,
  targetAttribute?: string,
  inversedBy?: string,
  mappedBy?: string,
}

export default class Relation extends BaseRelation {
  constructor(
    protected readonly name: string,
    protected readonly attribute: RelationAttribute,
  ) {
    super(name, attribute);
  }

  public getType() {
    if (this.attribute.relation === AttributeRelation.MorphToMany) {
      return 'any';
    }

    const ContentTypeName = getContentTypeName(this.attribute.target);

    switch (this.attribute.relation) {
      case AttributeRelation.ManyToMany:
      case AttributeRelation.OneToMany:
        return `${ContentTypeName}[]`;
      case AttributeRelation.ManyToOne:
      case AttributeRelation.OneToOne:
      default:
        return ContentTypeName;
    }
  }

  public getInputType(): string {
    return 'RelationInput';
  }

  public getPopulates() {
    if (this.attribute.relation === AttributeRelation.MorphToMany) {
      return [];
    }

    return [{
      name: this.name,
      type: `${getContentTypeName(this.attribute.target)}Query`,
    }];
  }

  public getFilters() {
    if (this.attribute.relation === AttributeRelation.MorphToMany) {
      return [];
    }

    return [{
      name: this.name,
      type: `${getContentTypeName(this.attribute.target)}Filters`,
    }];
  }

  getImports(): string[] {
    return [
      ...super.getImports(),
      'import {RelationInput} from "@strapi/blocks-react-renderer";',
    ];
  }
}
