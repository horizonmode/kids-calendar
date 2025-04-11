import React from "react";
import LoginForm from "@/components/LoginForm";
import Image from "next/image";

const CalendarPage = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1">
      <div className="relative flex justify-center">
        {/* <Image
          src="/static/logo.png"
          alt="Logo"
          width="0"
          height="0"
          sizes="100vw"
          className="w-52 md:w-64 h-auto absolute bottom-full"
        /> */}
        <LoginForm />
      </div>
    </div>
  );
};
export default CalendarPage;
