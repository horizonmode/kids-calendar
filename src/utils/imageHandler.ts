import axios from "axios";

const baseUrl = `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net/images`;
const token = process.env.NEXT_PUBLIC_STORAGE_TOKEN;

async function listImagesFromStorage(calendarId: string): Promise<string[]> {
  try {
    const url = `${baseUrl}/${calendarId}?restype=container&comp=list&token=${token}`;
    const response = await axios.get(url);
    const images = response.data.images;
    return images;
  } catch (error) {
    console.error("Error listing images:", error);
    return [];
  }
}

export default listImagesFromStorage;
