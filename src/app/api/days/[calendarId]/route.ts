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
      `SELECT * from s where (s.type = 'day' or s.type = 'event') and s.calendarId = '${calendarId}'`
    )
    .fetchAll();

  return Response.json(resources);
}

export async function DELETE(
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
  const deletedItem = await request.json();

  if (!deletedItem.id) {
    console.log("we dont have an ID");
    return new Response("No ID!", {
      status: 403,
    });
  }

  deletedItem.calendarId = `${calendarId}`;
  const result = await container
    .item(`${deletedItem.id}`, `${calendarId}`)
    .delete();

  if (result.statusCode === 404) {
    return new Response("Not Found", {
      status: 404,
    });
  }
  if (result.statusCode === 200) {
    console.log("Deleted data");
  } else if (result.statusCode === 200) {
    console.log("Updated data");
  } else {
    console.log(`unexpected statusCode ${result.statusCode}`);
  }

  return Response.json(deletedItem);
}
