import { Client, Account, Databases, Storage, Functions } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "http://localhost/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export default {client, account, databases, storage, functions};
