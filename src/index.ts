import _ from 'lodash';
import qs from 'qs';

import type {RelationInput} from "@/generator/attributes/relation";
import {logger} from "@/logger.ts";
export type {RelationInput};

const log = logger('request');

type Permissions = {
  [key: string]: {
    controllers: {
      [key: string]: {
        [key: string]: {
          enabled: boolean,
          policy: string,
        },
      },
    },
  },
}

export type PermissionAction = 'find' | 'findOne' | 'create' | 'update' | 'delete';

export type SuccessResponse<T> = {
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
  },
  error: undefined,
}

export type ErrorResponse = {
  data: null,
  "error": {
    "status": string,
    "name": 'ApplicationError' | 'ValidationError',
    "message": string,
    "details": {
      [key: string]: any,
    },
  },
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

export type UserResponse<T> = (T & {error: undefined}) | ErrorResponse;

export type AuthResponse<T> = {
  jwt: string,
  user: T,
  error: undefined,
} | ErrorResponse;

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

export type Locale = {
  id: number,
  documentId: string,
  name: string,
  code: string,
  createdAt: string,
  updatedAt: string,
  publishedAt?: string,
  isDefault: boolean,
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
  // Is null
  $null?: boolean,
  // Is not null
  $notNull?: boolean,
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

export type DynamiczoneComponent<ComponentName, ComponentInputType> = ComponentInputType & {
  __component: ComponentName,
};

export type DynamiczonePopulate<T> = {
  on: {
    [K in keyof T]: T[K];
  };
};

export class Strapi {
  constructor(
    private readonly url: string,
    private token?: string,
  ) {}

  public async fetch<T>(endpoint: string, data: object | FormData = {}, params: RequestInit = {}): Promise<Response<T>> {
    return await this.fetchData<Response<T>>(endpoint, params.method === 'GET' ? data : { data }, params);
  }

  private async fetchData<T>(endpoint: string, data: object | FormData = {}, params: RequestInit = {}): Promise<T> {
    const queryString = params.method === 'GET' ? qs.stringify(data) : '';
    return await this.baseFetch<T>(queryString ? `${endpoint}?${queryString}` : endpoint, _.merge({
      headers: {
        'Content-Type': 'application/json',
      },
      ...(params.method && !['GET', 'DELETE'].includes(params.method) ? {
          body: JSON.stringify(data)
        } : {}
      ),
    }, params));
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  protected async baseLogin<T>(identifier: string, password: string) {
    const response = await this.fetchData<AuthResponse<T>>('auth/local', {
      identifier,
      password
    }, {
      method: 'POST',
    });

    if (!response.error) {
      this.setToken(response.jwt);
    }

    return response;
  }

  protected async baseRegister<T, Q>(data: Q) {
    const response = await this.fetchData<AuthResponse<T>>('auth/local/register', data as object, {
      method: 'POST',
    });

    if (!response.error) {
      this.setToken(response.jwt);
    }

    return response;
  }

  public async forgotPassword(email: string) {
    return await this.fetchData<{ok: boolean, error: undefined} | ErrorResponse>('auth/forgot-password', {email}, {
      method: 'POST',
    });
  }

  public async sendEmailConfirmation(email: string) {
    return await this.fetchData<{email: string, sent: boolean, error: undefined} | ErrorResponse>('/auth/send-email-confirmation', {email}, {
      method: 'POST',
    });
  }

  protected async baseResetPassword<T>(password: string, code: string) {
    const response = await this.fetchData<AuthResponse<T>>('auth/reset-password', {
      password,
      passwordConfirmation: password,
      code,
    }, {
      method: 'POST',
    });

    if (!response.error) {
      this.setToken(response.jwt);
    }

    return response;
  }

  protected async baseChangePassword<T>(password: string, currentPassword: string) {
    const response = await this.fetchData<AuthResponse<T>>('auth/change-password', {
      password,
      passwordConfirmation: password,
      currentPassword,
    }, {
      method: 'POST',
    });

    if (!response.error) {
      this.setToken(response.jwt);
    }

    return response;
  }

  protected async baseMe<T, Q>(data: Q) {
    return await this.fetchData<UserResponse<T>>('users/me', data as object, {
      method: 'GET',
    });
  }

  async getLocales(params: RequestInit): Promise<Locale[]> {
    return await this.baseFetch<Locale[]>('i18n/locales', _.merge({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    }, params));
  }

  async getDocuments<T, Q extends object>(endpoint: string, data?: Q, params: RequestInit = {}): Promise<Response<T[]>> {
    return await this.fetch<T[]>(endpoint, data, {
      method: 'GET',
      ...params,
    });
  }

  async getDocument<T, Q extends object>(endpoint: string, data?: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.fetch<T>(endpoint, data, {
      method: 'GET',
      ...params,
    });
  }

  async create<T, Q extends object>(endpoint: string, data: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.fetch<T>(endpoint, data, {
      method: 'POST',
      ...params,
    });
  }

  async update<T, Q extends object>(endpoint: string, id: string, data: Q, params: RequestInit = {}): Promise<Response<T>> {
    return await this.fetch<T>(`${endpoint}/${id}`, data, {
      method: 'PUT',
      ...params,
    });
  }

  async delete<T>(endpoint: string, id: string, params: RequestInit = {}): Promise<Response<T>> {
    return await this.fetch<T>(`${endpoint}/${id}`, {}, {
      method: 'DELETE',
      ...params,
    });
  }

  async uploadForm(form: FormData) {
    return (await this.baseFetch<File[]>('upload', {
      method: 'POST',
      body: form,
    }));
  }

  private async baseFetch<T>(endpoint: string, params: RequestInit = {}): Promise<T> {
    const mergedParams = _.merge({
      ...(this.token ? {
        headers: {
          Authorization: `Bearer ${this.token}`,
        }
      } : {}),
    }, params);

    const response = await fetch(`${this.url}/api/${endpoint}`, mergedParams);
    const data = await response.json();

    log(mergedParams);
    log(response);
    log(data);

    return data;
  }

  private permissions?: Permissions;

  public async can(uid: string, controller: string, action: string) {
    if (!this.permissions) {
      const response = await this.fetchData<{permissions: Permissions}>('users-permissions/permissions');
      this.permissions = response.permissions;
    }

    if (!this.permissions[uid]) {
      throw new Error(`Permissions for ${uid} not found!`);
    }

    if (!this.permissions[uid].controllers[controller]) {
      throw new Error(`Permissions for ${uid}.${controller} not found!`);
    }

    if (!this.permissions[uid].controllers[controller][action]) {
      throw new Error(`Permission for ${uid}.${controller}.${action} not found!`);
    }

    return this.permissions[uid].controllers[controller][action].enabled;
  }
}
