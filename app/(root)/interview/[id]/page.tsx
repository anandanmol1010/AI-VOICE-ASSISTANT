import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getInterviewCoverById } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  return (
    <div className="flex flex-col max-w-6xl mx-auto w-full min-h-screen pt-0 -mt-10">
      <div className="flex justify-center pt-0 pb-2 mb-4">
        <div className="bg-gradient-to-r from-dark-300/90 via-dark-200/80 to-dark-300/90 rounded-full px-6 py-2 border border-primary-100/20 shadow-md inline-flex items-center gap-4">
          <Image
            src={getInterviewCoverById(id)}
            alt="cover"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h3 className="text-xl font-medium text-light-100 capitalize flex items-center">
            {interview.role} Interview
            <DisplayTechIcons
              techStack={interview.techstack}
              className="ml-3"
            />
          </h3>
          <span className="text-sm text-primary-100/90 font-medium bg-dark-200 px-3 py-1 rounded-full">
            {interview.type}
          </span>
        </div>
      </div>

      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </div>
  );
};

export default InterviewDetails;
