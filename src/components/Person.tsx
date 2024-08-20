import Image from "next/image";

export function Person({
  name,
  hideName,
  className,
}: {
  name: string;
  hideName?: boolean;
  className?: string;
}) {
  return (
    <div className={`max-w-xs ${className}`}>
      <div className="w-12 h-12 relative rounded-full">
        <Image
          className="bg-black rounded-full"
          src="/static/17.jpg"
          alt=""
          layout="fill"
        />
      </div>
      {!hideName && (
        <div className="py-1">
          <h3 className=" text-center font-bold text-l text-gray-800 dark:text-white mb-1">
            {name}
          </h3>
        </div>
      )}
    </div>
  );
}

export default Person;
