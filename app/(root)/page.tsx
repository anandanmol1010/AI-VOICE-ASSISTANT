import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  // Limit the number of interviews shown on the home page
  const limitedUserInterviews = userInterviews?.slice(0, 3);
  const limitedAvailableInterviews = allInterview?.slice(0, 6);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  // Check if there are more interviews than shown on the home page
  const hasMoreUserInterviews = userInterviews?.length! > 3;
  const hasMoreAvailableInterviews = allInterview?.length! > 6;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Get Interview-Ready with{" "}
            <span className="text-primary-300">AI-Powered</span> Practice
          </h2>
          <p className="text-lg text-light-200 leading-relaxed">
            Practice real interview questions with our AI interviewer and
            receive instant feedback to improve your skills.
          </p>

          <Button asChild className="btn-primary w-fit mt-2">
            <Link href="/interview" className="flex items-center gap-2">
              <span>Prepare your Interview</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="AI Interviewer"
          width={420}
          height={420}
          className="max-sm:hidden object-contain"
          priority
        />
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold">Your Interviews</h2>
          {hasPastInterviews && (
            <Link
              href="/interviews/user"
              className="text-primary-300 hover:text-primary-400 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              View all
              {hasMoreUserInterviews ? ` (${userInterviews?.length})` : ""}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </Link>
          )}
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            limitedUserInterviews?.map((interview) => (
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
              <Image
                src="/empty-state.svg"
                alt="No interviews"
                width={120}
                height={120}
                className="opacity-80 mb-4"
              />
              <p className="text-light-400 text-center">
                You haven't taken any interviews yet
              </p>
              <Button asChild className="btn-primary mt-4">
                <Link href="/interview">Start your first interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold">Available Interviews</h2>
          {hasUpcomingInterviews && (
            <Link
              href="/interviews/available"
              className="text-primary-300 hover:text-primary-400 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              View all
              {hasMoreAvailableInterviews ? ` (${allInterview?.length})` : ""}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </Link>
          )}
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            limitedAvailableInterviews?.map((interview) => (
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
              <Image
                src="/empty-state.svg"
                alt="No interviews"
                width={120}
                height={120}
                className="opacity-80 mb-4"
              />
              <p className="text-light-400 text-center">
                There are no interviews available
              </p>
              <Button asChild className="btn-primary mt-4">
                <Link href="/interview">Create a new interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
