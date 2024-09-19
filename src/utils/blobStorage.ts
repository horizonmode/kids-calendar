const { ContainerClient, Blob } = require("@azure/storage-blob");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
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

const stripDomain = (url: string) => {
  const domain = `https://${accountName}.blob.core.windows.net/`;
  return url.replace(domain, "");
};

export async function deleteBlob(blobName: string) {
  const containerClient = new ContainerClient(sasUrl);
  await containerClient.deleteBlob(stripDomain(blobName));
}

async function listBlobsFlatWithPageMarker(
  containerClient: typeof ContainerClient,
  prefix: string
): Promise<string[]> {
  // page size
  const maxPageSize = 100;

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

  const blobs = response.segment.blobItems.map(
    (blob: typeof Blob) => blob.name
  );

  return blobs;
}
