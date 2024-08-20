import { Card } from "@tremor/react";

export function Person({ name }: { name: string }) {
  return (
    <Card className="mx-auto max-w-xs">
      <img
        className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto"
        src="https://randomuser.me/api/portraits/women/21.jpg"
        alt=""
      />
      <div className="py-1">
        <h3 className=" text-center font-bold text-2xl text-gray-800 dark:text-white mb-1">
          {name}
        </h3>
      </div>
    </Card>
  );
}

export default Person;
