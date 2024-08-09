import { Container, CosmosClient, Database } from "@azure/cosmos";

class CosmosSingleton {
  database: Database | null;
  container: Container | null;
  constructor() {
    this.database = null;
    this.container = null;
  }

  async initialize() {
    if (
      (!this.database || !this.container) &&
      process.env.COSMOSDB_DATABASE_NAME &&
      process.env.COSMOSDB_CONTAINER_NAME
    ) {
      const databaseName = process.env.COSMOSDB_DATABASE_NAME;
      const containerName = process.env.COSMOSDB_CONTAINER_NAME;
      if (!process.env.COSMOSDB_CONNECTION_STRING) return;
      const client = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);
      const database = client.database(databaseName);
      const container = database.container(containerName);
      await client.databases.createIfNotExists({
        id: databaseName,
      });
      await database.containers.createIfNotExists({
        id: containerName,
      });
      this.database = database;
      this.container = container;
    }
  }

  getDatabase() {
    return this.database;
  }

  getContainer() {
    return this.container;
  }
}

const cosmosSingleton = new CosmosSingleton();
export default cosmosSingleton;
