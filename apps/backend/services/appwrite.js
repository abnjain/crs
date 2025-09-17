import { Client, Account, Databases, Storage, Functions } from "appwrite";
import { config } from "../config/config";

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export default {client, account, databases, storage, functions};
