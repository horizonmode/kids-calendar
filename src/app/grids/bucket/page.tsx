import Bucket from "@/components/Bucket";
import { VariableHeights } from "@/components/Vertical";

const BucketPage = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1">
      <div className="relative flex justify-center">
        <VariableHeights />
      </div>
    </div>
  );
};
export default BucketPage;
