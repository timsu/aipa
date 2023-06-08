import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

import { Issue, Project, User, Workspace } from "@prisma/client";
import { SuccessResponse } from "./apiTypes";
import { Resource, ResourceWithParent, SingleResource } from "./resource";

class APIService {
  axios: AxiosInstance;

  constructor() {
    const config: CreateAxiosDefaults = {
      baseURL: (typeof window === "undefined" ? process.env.NEXTAUTH_URL : "") + "/api",
    };
    this.axios = axios.create(config);
  }

  welcome = async (): Promise<SuccessResponse> => {
    const response = await this.axios.get("/users/welcome");
    return response.data;
  };

  public user = new SingleResource<User>(this, "user");

  public workspaces = new Resource<Workspace>(this, "workspaces");

  public projects = new Resource<Project>(this, "projects");

  public issues = new ResourceWithParent<Project, Issue>(this, "project_id", "issues");

  getAblyTokenRequest = async (): Promise<string> => {
    const response = await this.axios.get("/ably/token");
    return response.data;
  };

  inviteToWorkspace = async (
    id: string,
    emails: string,
    fromName: string
  ): Promise<SuccessResponse> => {
    const response = await this.axios.post("/workspaces/invite", { id, emails, fromName });
    return response.data;
  };
}

const API = new APIService();

export default API;
