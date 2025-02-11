import _ from 'lodash';
import qs from 'qs';
import mime from 'mime';
import { readFile } from 'fs/promises';
import { basename } from 'node:path';

import type {RelationInput} from "@/generator/attributes/relation";
export type {RelationInput};

type Response<T> = {
  data: T,
  meta: {
    pagination: {
      total?: number,
    } & ({
      page: number,
      pageSize: number,
      pageCount?: number,
    } | {
      start: number,
      limit: number,
    }),
  }
}

export type File = {
  id?: number;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: object;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: object;
  related?: any;
  folder?: Folder;
  folderPath: string;
}

export type Folder = {
  id?: number;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  pathId: number;
  parent?: Folder;
  children?: Folder[];
  files?: File[];
  path: string;
}

// export type

export type Filters<T> = {
  // Joins the filters in an "or" expression
  $or?: Filters<T>[],
  // Joins the filters in an "and" expression
  $and?: Filters<T>[],
  // Joins the filters in a "not" expression
  $not?: Filters<T>[],
} | T;

export type FilterValue<T> = {
  // Equal
  $eq?: T,
  // Equal (case-insensitive)
  $eqi?: string,
  // Not equal
  $ne?: T,
  // Not equal (case-insensitive)
  $nei?: string,
  // Less than
  $lt?: T,
  // Less than or equal to
  $lte?: T,
  // Greater than
  $gt?: T,
  // Greater than or equal to
  $gte?: T,
  // Included in an array
  $in?: T[],
  // Not included in an array
  $notIn?: T[],
  // Contains
  $contains?: string,
  // Does not contain
  $notContains?: string,
  // Contains (case-insensitive)
  $containsi?: string,
  // Does not contain (case-insensitive)
  $notContainsi?: string,
  // Is between
  $between?: [T, T],
  // Starts with
  $startsWith?: string,
  // Starts with (case-insensitive)
  $startsWithi?: string,
  // Ends with
  $endsWith?: string,
  // Ends with (case-insensitive)
  $endsWithi?: string,
} | T;

export type Query<Fields, Sort, Filters, Populate> = {
  populate?: Populate,
  fields?: Fields[] | '*',
  filters?: Filters,
  locale?: string,
  status?: 'published' | 'draft',
  sort?: Sort[] | Sort,
  pagination?: {
    withCount?: boolean,
  } & ({
    page?: number,
    pageSize?: number,
  } | {
    start?: number,
    limit?: number,
  }),
}

export class Strapi {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  public async request<T>(endpoint: string, data: object | FormData = {}, params: RequestInit = {}): Promise<Response<T>> {
    const queryString = params.method === 'GET' ? qs.stringify(data) : '';

    return await this.baseRequest<Response<T>>(queryString ? `${endpoint}?${queryString}` : endpoint, _.merge({
      headers: {
        'Content-Type': 'application/json',
      },
      ...(params.method && !['GET', 'DELETE'].includes(params.method) ? {
          body: JSON.stringify({
            data,
          })
        } : {}
      ),
    }, params));
  }

  async getDocuments<T, Q extends object>(endpoint: string, data?: Q, params: RequestInit = {}): Promise<Response<T[]>> {
    return await this.request<T[]>(endpoint, data, {
      method: 'GET',
      ...params,
    });
  }

  async getDocument<T, Q extends object>(endpoint: string, data?: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.request<T>(endpoint, data, {
      method: 'GET',
      ...params,
    });
  }

  async create<T, Q extends object>(endpoint: string, data: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.request<T>(endpoint, data, {
      method: 'POST',
      ...params,
    });
  }

  async update<T, Q extends object>(endpoint: string, id: string, data: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.request<T>(`${endpoint}/${id}`, data, {
      method: 'PUT',
      ...params,
    });
  }

  async delete<T>(endpoint: string, id: string, params: RequestInit = {}): Promise<Response<T>> {
    return await this.request<T>(`${endpoint}/${id}`, {}, {
      method: 'DELETE',
      ...params,
    });
  }

  /**
   * For Node.js
   *
   * @param files list of files names which will be uploaded, example: ['/app/data/cover.js']
   */
  async upload(files: { path: string, filename?: string }[]) {
    const form = new FormData();
    await Promise.all(files.map(async (item) => {
      const fileBuffer = await readFile(item.path);
      const file = new File([fileBuffer], item.filename || basename(item.path), {type: mime.getType(item.path) || 'image/jpeg'});
      form.append( 'files', file);
    }));
    return await this.uploadForm(form);
  }

  async uploadForm(form: FormData) {
    return (await this.baseRequest<File[]>('upload', {
      method: 'POST',
      body: form,
    }));
  }

  private async baseRequest<T>(endpoint: string, params: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.url}/api/${endpoint}`, _.merge({
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }, params));

    if (!response.ok) {
      console.log(`${this.url}/api/${endpoint}`);
      console.log(response);
      const data: {
        data: any,
        error?: {
          details?: {
            errors?: any[],
          },
        },
      } = await response.json();
      console.log(data);
      console.log(data?.error?.details?.errors);
      throw new Error(`Помилка запиту до Strapi: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
  }
}
