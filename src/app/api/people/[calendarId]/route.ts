import cosmosSingleton from "@/utils/cosmos";
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

export async function PUT(
  request: Request,
  { params }: { params: { calendarId: string } }
) {
  const { calendarId } = params;
  if (!calendarId) {
    return new Response("No Calendar Id!", {
      status: 403,
    });
  }

  const res = await request.json();
  const updatedItem = res;

  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    return new Response("No Container!", {
      status: 403,
    });
  }

  if (!updatedItem.id) {
    updatedItem.id = `${Date.now()}`;
  }

  updatedItem.calendarId = `${calendarId}`;
  updatedItem.type = "people";
  const result = await container.items.upsert(updatedItem);

  // update related data

  

  if (result.statusCode === 201) {
    console.log("Inserted data");
  } else if (result.statusCode === 200) {
    console.log("Updated data");
  } else {
    console.log(`unexpected statusCode ${result.statusCode}`);
  }

  return Response.json(updatedItem);
}
