import {
  CalendarDay,
  CosmosItem,
  EventItem,
  People,
  Person,
  Schedule,
  Template,
  SaveStatus,
} from "@/types/Items";
import cosmosSingleton from "./cosmos";
import { BulkOperationType, OperationInput } from "@azure/cosmos";

interface DayResponse {
  days: CalendarDay[];
  events: EventItem[];
}

const prohibitedKeys = ["dirty", "softDelete", "status"];

const stripProhibitedKeys = (obj: any) => {
  const newObj = { ...obj };
  prohibitedKeys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
};

const get = async <T>(query: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw "no container!";
  }

  const { resources } = await container.items
    .query<CosmosItem<T>>(query)
    .fetchAll();

  return resources as CosmosItem<T>[];
};

const getById = async <T>(id: string, calendarId: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw "no container!";
  }

  const { resource } = await container
    .item(id, calendarId)
    .read<CosmosItem<T>>();

  return resource as CosmosItem<T>;
};

export async function GetDays(calendarId: string): Promise<DayResponse> {
  let days: CalendarDay[] = [];
  let events: EventItem[] = [];

  try {
    const query = `SELECT * from s where (s.type = 'day' or s.type = 'event') and s.calendarId = '${calendarId}'`;
    var json = await get<CalendarDay | EventItem>(query);
    days = json.filter((r) => r.type === "day") as CalendarDay[];
    events = json.filter((r) => r.type === "event") as EventItem[];
  } catch (err) {
    console.error(err);
  } finally {
    const safeDays = days.map((d) => ({
      ...d,
      softDelete: false,
      status: "saved" as SaveStatus,
      dirty: false,
    }));

    const safeEvents = events.map((e) => ({
      ...e,
      softDelete: false,
      status: "saved" as SaveStatus,
      dirty: false,
    }));

    return { days: safeDays, events: safeEvents };
  }
}

export async function GetPeople(
  calendarId: string
): Promise<CosmosItem<People>> {
  let people: CosmosItem<People> | null = null;
  try {
    people = await getById(`${calendarId}-people`, calendarId);
  } catch (err) {
    console.error(err);
  }
  if (!people) {
    return {
      people: [{ id: 1, name: "Person 1", photo: null }],
      calendarId,
      id: `${calendarId}-people`,
      type: "people",
    };
  }
  return people;
}

export async function GetSchedules(
  calendarId: string
): Promise<CosmosItem<Schedule>[]> {
  let schedules: CosmosItem<Schedule>[] = [];
  const query = `SELECT * from s where s.type = 'schedule' and s.calendarId = '${calendarId}'`;
  try {
    schedules = await get(query);
  } catch (err) {
    console.error(err);
  }
  return schedules;
}

export async function GetTemplates(calendarId: string) {
  let templates: CosmosItem<Template>[] = [];
  const query = `SELECT * from s where s.type = 'template' and s.calendarId = '${calendarId}'`;
  try {
    templates = await get(query);
  } catch (err) {
    console.error(err);
  }
  return templates;
}

export async function UpdatePeople(calendarId: string, people: Person[]) {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }

  const personCosmosItem: CosmosItem<People> = {
    people,
    calendarId,
    id: `${calendarId}-people`,
    type: "people",
  };

  const currentPeople = await GetPeople(calendarId);
  const removedPeople = currentPeople.people.filter(
    (p) => !people.find((np) => np.id === p.id)
  );

  removedPeople.forEach(
    async (person) => await DeletePerson(calendarId, person.id)
  );

  const { resource } = await container.items.upsert<CosmosItem<People>>(
    personCosmosItem
  );

  return resource?.people;
}

export async function DeletePerson(calendarId: string, personId: number) {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }

  const getDaysWithPerson = `SELECT * FROM c where c.type = 'day' and c.calendarId = '${calendarId}' and EXISTS 
  (SELECT VALUE z FROM z in c.items WHERE ARRAY_CONTAINS(z.people, ${personId}))`;

  const getEventsWithPerson = `SELECT * FROM c where c.type = 'event' and c.calendarId = '${calendarId}' and ARRAY_CONTAINS(c.people, ${personId})`;

  const days = await get<CosmosItem<CalendarDay>>(getDaysWithPerson);
  const events = await get<CosmosItem<CalendarDay>>(getEventsWithPerson);

  const dayOperations: OperationInput[] = days.map((day) => {
    return {
      operationType: BulkOperationType.Replace,
      partitionKey: day.calendarId,
      id: day.id,
      resourceBody: day,
    };
  });

  const eventOperations: OperationInput[] = events.map((event) => {
    return {
      operationType: BulkOperationType.Replace,
      partitionKey: event.calendarId,
      id: event.id,
      resourceBody: event,
    };
  });

  await container.items.bulk(dayOperations);
  await container.items.bulk(eventOperations);
}

export const upsertDay = async (day: CalendarDay) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }

  const result = await container.items.upsert(day);
  return result;
};

export const UpdateDays = async (days: CalendarDay[], calendarId: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }
  const operations: OperationInput[] = days
    .filter((d) => d.dirty || d.softDelete || d.items.length === 0)
    .map((day: CalendarDay) => {
      const dayObject: CosmosItem<CalendarDay> = {
        ...stripProhibitedKeys(day),
        calendarId,
        id: `${day.day}-${day.month}-${day.year}`,
        type: "day",
      };
      return day.softDelete || day.items.length === 0
        ? {
            operationType: BulkOperationType.Delete,
            partitionKey: calendarId,
            id: dayObject.id,
          }
        : {
            operationType: BulkOperationType.Upsert,
            partitionKey: calendarId,
            id: dayObject.id,
            resourceBody: {
              ...dayObject,
            },
          };
    });
  await container.items.bulk(operations);
  return days;
};

export const UpdateDay = async (day: CalendarDay, calendarId: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }

  const cosmosDay: CosmosItem<CalendarDay> = {
    ...stripProhibitedKeys(day),
    calendarId,
    id: `${day.day}-${day.month}-${day.year}`,
    type: "day",
  };
  const { resource } = await container.items.upsert<CosmosItem<CalendarDay>>(
    cosmosDay
  );

  return resource;
};

export const UpdateEvents = async (events: EventItem[], calendarId: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw new Error("NoContainer");
  }

  const operations: OperationInput[] = events.map((event: EventItem, i) => {
    const eventObject: CosmosItem<EventItem> = {
      ...stripProhibitedKeys(event),
      calendarId,
      id: event.id,
      type: "event",
    };
    return event.softDelete
      ? {
          operationType: BulkOperationType.Delete,
          partitionKey: calendarId,
          id: eventObject.id,
        }
      : {
          operationType: BulkOperationType.Upsert,
          partitionKey: calendarId,
          id: eventObject.id,
          resourceBody: {
            ...eventObject,
          },
        };
  });

  console.log(operations);
  await container.items.bulk(operations);
  return events;
};
