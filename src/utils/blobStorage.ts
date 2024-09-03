import { blob } from "stream/consumers";

const { ContainerClient, Blob } = require("@azure/storage-blob");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error("Azure Storage accountName not found");

const containerName = `images`;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const sasReadOnlyToken = process.env.AZURE_STORAGE_SAS_READ_ONLY_TOKEN;
const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;

export async function list(prefix: string) {
  const containerClient = new ContainerClient(sasUrl);
  const blobs = (
    await listBlobsFlatWithPageMarker(containerClient, prefix)
  ).map((blob, i) => ({
    url: `https://${accountName}.blob.core.windows.net/${containerName}/${blob}?${sasReadOnlyToken}`,
    id: i,
  }));
  return blobs;
}

async function listBlobsFlatWithPageMarker(
  containerClient: typeof ContainerClient,
  prefix: string
): Promise<string[]> {
  // page size
  const maxPageSize = 2;

  let i = 1;
  let marker;

  // some options for filtering list
  const listOptions = {
    includeCopy: false, // include metadata from previous copies
    includeDeleted: false, // include deleted blobs
    includeDeletedWithVersions: false, // include deleted blobs with versions
    includeLegalHold: false, // include legal hold
    includeMetadata: false, // include custom metadata
    includeSnapshots: false, // include snapshots
    includeTags: false, // include indexable tags
    includeUncommitedBlobs: false, // include uncommitted blobs
    includeVersions: false, // include all blob version
    prefix, // filter by blob name prefix
  };

  let iterator = containerClient
    .listBlobsFlat(listOptions)
    .byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints blob names
  for (const blob of response.segment.blobItems) {
    console.log(`Flat listing: ${i++}: ${blob.name}`);
  }

  const blobs = response.segment.blobItems.map(
    (blob: typeof Blob) => blob.name
  );

  return blobs;
  // Gets next marker
  marker = response.continuationToken;

  // Passing next marker as continuationToken
  iterator = containerClient.listBlobsFlat().byPage({
    continuationToken: marker,
    maxPageSize: maxPageSize * 2,
  });
  response = (await iterator.next()).value;
}
