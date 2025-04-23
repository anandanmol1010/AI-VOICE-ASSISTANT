import FormattedDate from "./FormattedDate";
import dayjs from "./_dayjs-tz-setup";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
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

  const badgeColor =
    {
      Behavioral: "bg-emerald-500/20 text-emerald-400",
      Mixed: "bg-purple-500/20 text-purple-400",
      Technical: "bg-blue-500/20 text-blue-400",
    }[normalizedType] || "bg-purple-500/20 text-purple-400";

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
            {/* Cover Image */}
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={64}
              height={64}
              className="rounded-lg object-cover size-16 shadow-md"
            />

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
