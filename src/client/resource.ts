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

  async list(parent: Parent): Promise<ItemsResponse<Type>> {
    const response = await this.conn.axios.get(`/${this.name}?${this.parentParam}=${parent.id}`);
    return response.data;
  }

  async create(parent: Parent, item: Partial<Type>): Promise<ItemResponse<Type>> {
    const response = await this.conn.axios.post(
      `/${this.name}?${this.parentParam}=${parent.id}`,
      item
    );
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
