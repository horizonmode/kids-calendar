import { list } from "@/utils/blobStorage";

export async function GET(
  request: Request,
  { params }: { params: { calendarId: string } }
) {
  const { calendarId } = params;
  if (!calendarId) {
    return new Response("No Calendar Id!", {
      status: 403,
    });
  }

  const images = await list(calendarId);
  console.log("result", images);

  return Response.json(images);
}
