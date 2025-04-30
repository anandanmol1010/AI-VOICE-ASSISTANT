import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

// Original function for backward compatibility
let interviewCoverIndex = 0;
export const getRandomInterviewCover = () => {
  const randomIndex = interviewCoverIndex % interviewCovers.length;
  interviewCoverIndex++;
  return `/covers${interviewCovers[randomIndex]}`;
};

// New function that uses interview ID to generate a consistent cover image
export const getInterviewCoverById = (id: string) => {
  // Use the first character of the ID to determine the index
  const charCode = id.charCodeAt(0);
  const index = charCode % interviewCovers.length;
  return `/covers${interviewCovers[index]}`;
};
