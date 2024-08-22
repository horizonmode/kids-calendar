import { Schedule } from "@/store/calendar";
import { EventItem, Person } from "@/types/Items";
import cosmosSingleton from "./cosmos";

interface DayResponse {
  days: Schedule[];
  events: EventItem[];
}

export async function GetDays(calendarId: string): Promise<DayResponse> {
  let days = [];
  let events = [];

  try {
    await cosmosSingleton.initialize();
    const container = cosmosSingleton.getContainer();
    if (!container) {
      throw "no container!";
    }

    const { resources } = (await container.items
      .query(
        `SELECT * from s where (s.type = 'day' or s.type = 'event') and s.calendarId = '${calendarId}'`
      )
      .fetchAll()) as any;

    const allData = await Response.json(resources);
    const json = await allData.json();
    days = json.filter((r: Schedule | EventItem) => r.type === "day");
    events = json.filter((r: Schedule | EventItem) => r.type === "event");
  } catch (err) {
    console.error(err);
  } finally {
    return { days, events };
  }
}

interface PersonResponse {
  people: Person[];
}

export async function GetPeople(calendarId: string): Promise<PersonResponse> {
  return {
    people: [
      { id: 1, name: "Faye", photo: "/static/faye.png" },
      { id: 2, name: "Esme", photo: "/static/esme.png" },
    ],
  };
}
