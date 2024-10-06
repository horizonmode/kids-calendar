import Bucket from "@/components/Bucket";

const BucketPage = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1">
      <div className="relative flex justify-center">
        <Bucket
          disableAll={false}
          items={["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]}
        />
      </div>
    </div>
  );
};
export default BucketPage;
