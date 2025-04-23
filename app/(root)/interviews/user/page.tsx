import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";

async function UserInterviewsPage() {
  const user = await getCurrentUser();
  const userInterviews = await getInterviewsByUserId(user?.id!);
  const hasInterviews = userInterviews?.length! > 0;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Your Interviews</h2>
        <Link 
          href="/" 
          className="text-primary-300 hover:text-primary-400 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="interviews-section">
        {hasInterviews ? (
          userInterviews?.map((interview) => (
            <InterviewCard
              key={interview.id}
              userId={user?.id}
              interviewId={interview.id}
              role={interview.role}
              type={interview.type}
              techstack={interview.techstack}
              createdAt={interview.createdAt}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 bg-dark-200/50 rounded-xl border border-light-800/10">
            <Image src="/empty-state.svg" alt="No interviews" width={120} height={120} className="opacity-80 mb-4" />
            <p className="text-light-400 text-center">You haven't taken any interviews yet</p>
            <Button asChild className="btn-primary mt-4">
              <Link href="/interview">Start your first interview</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default UserInterviewsPage;
