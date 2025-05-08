import FormattedDate from "./FormattedDate";
import dayjs from "./_dayjs-tz-setup";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn } from "@/lib/utils";
import { interviewIllustrations } from "@/constants";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  // Always use #51a2ff color for all interview types
  const badgeColor = "bg-[#51a2ff]/20 text-[#51a2ff]";

  const dateValue = feedback?.createdAt || createdAt || Date.now();

  return (
    <div className="card-border h-full">
      <div className="card-interview h-full">
        {/* Type Badge */}
        <div
          className={cn(
            "absolute top-4 right-4 w-fit px-3 py-1 rounded-full text-xs font-medium",
            badgeColor
          )}
        >
          {normalizedType}
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            {/* Interview Type Illustration */}
            <div className="rounded-lg size-16 flex items-center justify-center shadow-md overflow-hidden bg-[#51a2ff]/10 border border-[#51a2ff]/20">
              <Image
                src={interviewIllustrations[normalizedType as keyof typeof interviewIllustrations] || interviewIllustrations.default}
                alt={`${normalizedType} interview illustration`}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            {/* Interview Role */}
            <h3 className="text-xl font-semibold capitalize text-white">
              {role} Interview
            </h3>
          </div>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mb-4">
            <div className="flex flex-row gap-2 items-center">
              <div className="bg-dark-300 p-1.5 rounded-md">
                <Image
                  src="/calendar.svg"
                  width={16}
                  height={16}
                  alt="calendar"
                  className="opacity-80"
                />
              </div>
              <p className="text-sm text-light-200">
                <FormattedDate date={dateValue} />
              </p>
            </div>

            {feedback?.totalScore && (
              <div className="flex flex-row gap-2 items-center">
                <div className="bg-dark-300 p-1.5 rounded-md">
                  <Image
                    src="/star.svg"
                    width={16}
                    height={16}
                    alt="star"
                    className="opacity-80"
                  />
                </div>
                <p className="text-sm text-light-200">
                  <span className="text-primary-300 font-medium">
                    {feedback.totalScore}
                  </span>
                  /100
                </p>
              </div>
            )}
          </div>

          {/* Feedback or Placeholder Text */}
          <div className="bg-dark-300/50 rounded-lg p-4 mb-6 flex-grow">
            <p className="line-clamp-3 text-light-100 text-sm">
              {feedback?.finalAssessment ||
                "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>
          </div>

          <div className="flex flex-row justify-between items-center mt-auto">
            <DisplayTechIcons techStack={techstack} />

            <Button className={feedback ? "btn-primary" : "btn-secondary"}>
              <Link
                href={
                  feedback
                    ? `/interview/${interviewId}/feedback`
                    : `/interview/${interviewId}`
                }
              >
                {feedback ? "View Feedback" : "Take Interview"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
