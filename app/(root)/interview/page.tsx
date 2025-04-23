import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Interview Generation</h2>
        <p className="text-light-200 max-w-2xl">
          Create a personalized interview experience tailored to your skills and career goals. 
          Our AI interviewer will ask relevant questions and provide instant feedback.
        </p>
      </div>

      <div className="bg-dark-200/50 rounded-xl border border-light-800/10 p-6 shadow-md">
        <Agent
          userName={user?.name!}
          userId={user?.id}
          type="generate"
        />
      </div>
    </>
  );
};

export default Page;
