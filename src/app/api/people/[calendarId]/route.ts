import { GetPeople } from "@/utils/cosmosHandler";

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

  const people = await GetPeople(calendarId);

  return Response.json(people);
}
