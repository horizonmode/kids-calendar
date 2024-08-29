import cosmosSingleton from "../../../../utils/cosmos";

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

  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    return new Response("No Container!", {
      status: 403,
    });
  }

  const { resources } = await container.items
    .query(
      `SELECT * from s where (s.type = 'people') and s.calendarId = '${calendarId}'`
    )
    .fetchAll();

  return Response.json(resources);
}
