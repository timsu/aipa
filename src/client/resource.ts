import { AxiosInstance } from "axios";

import { ItemResponse, ItemsResponse } from "./apiTypes";

type Connector = { axios: AxiosInstance };

interface GenericModel {
  id: string;
}

export class Resource<Type extends GenericModel> {
  constructor(public conn: Connector, public name: string) {}

  async list(): Promise<ItemsResponse<Type>> {
    const response = await this.conn.axios.get(`/${this.name}`);
    return response.data;
  }

  async create(item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.post(`/${this.name}`, item);
    return response.data;
  }

  async get(id: string): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.get(`/${this.name}/${id}`);
    return response.data;
  }

  async update(id: string, item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.put(`/${this.name}/${id}`, item);
    return response.data;
  }
}

export class ResourceWithParent<Parent extends GenericModel, Type extends GenericModel> {
  constructor(public conn: Connector, public parentParam: string, public name: string) {}

  async list(parent: Parent, params?: string): Promise<ItemsResponse<Type>> {
    const response = await this.conn.axios.get(
      `/${this.name}?${this.parentParam}=${parent.id}${params ? "&" + params : ""}`
    );
    return response.data;
  }

  async create(parent: Parent, item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.post(
      `/${this.name}?${this.parentParam}=${parent.id}`,
      item
    );
    return response.data;
  }

  async get(parentId: string, id: string): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.get(
      `/${this.name}/${id}?${this.parentParam}=${parentId}`
    );
    return response.data;
  }

  async update(parentId: string, id: string, item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.put(
      `/${this.name}/${id}?${this.parentParam}=${parentId}`,
      item
    );
    return response.data;
  }
}

export class SingleResource<Type extends GenericModel> {
  constructor(public conn: Connector, public name: string) {}

  async get(): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.get(`/${this.name}`);
    return response.data;
  }

  async update(item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.put(`/${this.name}`, item);
    return response.data;
  }
}

export class SubResource<Type extends GenericModel, SubType> {
  constructor(public conn: Connector, public name: string, public subName: string) {}

  async list<T = SubType[]>(parent: Type, params?: string): Promise<T> {
    const response = await this.conn.axios.get(
      `/${this.name}/${parent.id}/${this.subName}${params ? "?" + params : ""}`
    );
    return response.data;
  }

  async create<T = SubType>(parent: Type, item: Partial<T>): Promise<T> {
    const response = await this.conn.axios.post(`/${this.name}/${parent.id}/${this.subName}`, item);
    return response.data;
  }

  async get<T = SubType>(parentId: string, id: string): Promise<T> {
    const response = await this.conn.axios.get(`/${this.name}/${parentId}/${this.subName}/${id}`);
    return response.data;
  }

  async update<T = SubType>(parentId: string, id: string, item: Partial<T>): Promise<T> {
    const response = await this.conn.axios.put(
      `/${this.name}?${parentId}/${this.subName}/${id}`,
      item
    );
    return response.data;
  }
}
