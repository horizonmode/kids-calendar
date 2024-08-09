import React from "react";
import LoginForm from "@/components/LoginForm";
import Image from "next/image";

const CalendarPage = () => {
  return (
    <div className="flex flex-col gap-4 flex-1 items-center">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 p-5">
        <Image
          src="/static/logo.png"
          alt="Logo"
          width="0"
          height="0"
          sizes="100vw"
          className="w-52 md:w-64 h-auto"
        />
      </div>
      <LoginForm />
    </div>
  );
};
export default CalendarPage;
