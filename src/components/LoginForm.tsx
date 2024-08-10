"use client";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useState } from "react";
import { RiDoorOpenFill } from "@remixicon/react";

const LoginForm = () => {
  const [calendarId, setCalendarId] = useState("");
  const router = useRouter();
  const createNew: MouseEventHandler<HTMLElement> = (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();
    const id = Date.now();
    router.push(`/grids/calendar/${id}`);
  };
  const openCalender: MouseEventHandler<HTMLElement> = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();
    if (calendarId) {
      router.push(`/grids/calendar/${calendarId}`);
    }
  };
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <div className="flex justify-center my-2 mx-4 md:mx-0 relative">
        <form className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-full px-3 mb-6">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="calendarId"
              >
                Calendar ID
              </label>
              <input
                id="calendarId"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                className="appearance-none block w-full bg-white text-gray-900 font-medium border border-gray-400 rounded-lg py-3 px-3 leading-tight focus:outline-none"
              />
            </div>

            <div className="w-full md:w-full px-3">
              <button
                onClick={openCalender}
                disabled={!calendarId}
                className="appearance-none block w-full bg-blue-600 text-gray-100 font-bold border border-gray-200 rounded-lg py-3 px-3 leading-tight hover:bg-blue-500 focus:outline-none focus:bg-white focus:border-gray-500"
              >
                Open
              </button>
            </div>
            <div className="mx-auto pb-1 mt-2">
              <span className="text-center text-xs text-gray-700">
                or create new
              </span>
            </div>
            <div className="flex items-center w-full mt-2">
              <div className="w-full md:w-full px-3">
                <button
                  onClick={createNew}
                  className="appearance-none block w-full bg-green-400 text-black font-bold border border-gray-200 rounded-lg py-3 px-3 leading-tight hover:bg-green-500 focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
