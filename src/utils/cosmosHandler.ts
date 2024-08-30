import { CalendarDay } from "@/store/calendar";
import { EventItem, Person, Schedule } from "@/types/Items";
import cosmosSingleton from "./cosmos";

interface DayResponse {
  days: CalendarDay[];
  events: EventItem[];
}

const get = async (query: string) => {
  await cosmosSingleton.initialize();
  const container = cosmosSingleton.getContainer();
  if (!container) {
    throw "no container!";
  }

  const { resources } = (await container.items.query(query).fetchAll()) as any;

  const res = await Response.json(resources);
  return res.json();
};

export async function GetDays(calendarId: string): Promise<DayResponse> {
  let days = [];
  let events = [];

  try {
    const query = `SELECT * from s where (s.type = 'day' or s.type = 'event') and s.calendarId = '${calendarId}'`;
    var json = await get(query);
    days = json.filter((r: CalendarDay | EventItem) => r.type === "day");
    events = json.filter((r: CalendarDay | EventItem) => r.type === "event");
  } catch (err) {
    console.error(err);
  } finally {
    return { days, events };
  }
}

export interface PersonResponse {
  people: Person[];
  id: string | null;
  calendarId: string;
}

export async function GetPeople(calendarId: string): Promise<PersonResponse> {
  let people: PersonResponse[] = [];
  try {
    const query = `SELECT TOP 1 * from s where s.type = 'people' and s.calendarId = '${calendarId}'`;
    people = (await get(query)) as PersonResponse[];
  } catch (err) {
    console.error(err);
  }
  const [peopleResponse] = people;
  if (!peopleResponse) {
    return { people: [{ id: 1, name: "Person 1" }], id: null, calendarId };
  }
  return peopleResponse;
}

export async function GetSchedules(calendarId: string): Promise<Schedule[]> {
  let schedules: Schedule[] = [];
  try {
    const query = `SELECT * from s where s.type = 'schedule' and s.calendarId = '${calendarId}'`;
    schedules = (await get(query)) as Schedule[];
  } catch (err) {
    console.error(err);
  }
  return schedules;
}
export async function GetTemplates(calendarId: string) {
  let templates = [];
  try {
    const query = `SELECT * from s where s.type = 'template' and s.calendarId = '${calendarId}'`;
    templates = (await get(query)) as any;
  } catch (err) {
    console.error(err);
  }
  return templates;
}
