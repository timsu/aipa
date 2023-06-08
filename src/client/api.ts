import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

import { Issue, Project, User, Workspace } from "@prisma/client";
import { IssueType, IssueState, SuccessResponse, ChatMessage } from "@/types";
import { Resource, ResourceWithParent, SingleResource } from "./resource";

class APIService {
  axios: AxiosInstance;

  endpoint: string;

  constructor() {
    this.endpoint = "/api";
    const config: CreateAxiosDefaults = {
      baseURL: this.endpoint,
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

  listIssues = async (params: { filter: string; [param: string]: any }): Promise<Issue[]> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.axios.get("/issues?" + queryString);
    return response.data;
  };

  transitionIssue = async (
    issue: Issue,
    updates: { state?: IssueState; type?: IssueType },
    onData: (data: ChatMessage | string) => void
  ): Promise<void> => {
    await this.stream(
      `/issues/transition?id=${issue.id}&project_id=${issue.projectId}`,
      updates,
      onData
    );
  };

  stream = (
    url: string,
    body: any,
    onMessage: (message: ChatMessage | string) => void
  ): Promise<void> => {
    // use fetch since this use of axios doesn't support streaming
    return new Promise<void>((resolve, reject) => {
      fetch(this.endpoint + url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => {
          if (!response.body) reject(new Error("No response body"));

          // Create a ReadableStream from the response body
          const reader = response.body!.getReader();

          // Define a function to read the stream
          function readStream(): any {
            return reader.read().then(({ done, value }) => {
              if (done) {
                resolve();
                return;
              }

              try {
                const text = new TextDecoder().decode(value);
                const messages = parsePartialMessages(text);
                messages.forEach((m) => onMessage(m));
              } catch (error) {
                reject(error);
              }

              // Continue reading the stream
              return readStream();
            });
          }

          // Start reading the stream
          return readStream();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
}

const API = new APIService();

export default API;

const parsePartialMessages = (text: string): (ChatMessage | string)[] => {
  return JSON.parse("[" + (text.endsWith(",") ? text.slice(0, -1) : text) + "]");
};
