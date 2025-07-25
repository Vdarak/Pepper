import { GoogleGenAI } from "@google/genai";
import { JobDetails } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const JSON_SCHEMA = {
  title: "<THE_JOB_TITLE>",
  jobid: "<JOB_ID_FROM_THE_WEBSITE (if available)>",
  post_date: "<DATE_AT_WHICH_THE_JOB_IS_POSTED (e.g., YYYY-MM-DD)>",
  company: "<THE_COMPANY_THAT_IS_HIRING>",
  link: "<THE_URL_OF_THE_JOB_POSTING>",
  scraped_from: "<THE_WEBSITE_THAT_HOSTED_THE_JOB (e.g., LinkedIn, Handshake)>",
  location: "<CITY, STATE/COUNTRY>",
  experience_required: "<e.g. 0-2 years, 5+ years, Entry Level>",
  company_size: "<NUM_OF_EMPLOYEES (a range is fine like 10-50, 200-1000, 5000+)>",
  salary_range: "<SALARY_RANGE (e.g., $100,000 - $120,000, Not specified)>",
  application_website: "<LINKED_easyApply/CompanyWebsite/LinkedIn/Handshake (basically specify where the application needs to be submitted)>",
  sponsorship: "<SPONSORSHIP_AVAILABILITY (e.g., OPT/H1B, Yes, No, Not Specified)>",
  referral: false,
  description: "<THE_ENTIRE_JOB_DESCRIPTION (you can leave out the parts that talk about the company and stuff)>",
};

export async function parseJobDetails(jobDescription: string, url: string, extraInfo: string): Promise<JobDetails> {
  const prompt = `
    You are an expert AI assistant specializing in parsing job descriptions.
    Your task is to extract structured information from the provided job posting text.
    The job was found at this URL: ${url || 'Not provided'}.
    The user has also provided this extra information to consider: "${extraInfo || 'None'}".

    Please analyze the following job description text and return a single JSON object that matches this exact schema, ensuring the 'description' field is last. Do not add any extra text, comments, or markdown formatting around the JSON.

    Schema:
    ${JSON.stringify(JSON_SCHEMA, null, 2)}

    Job Description Text:
    ---
    ${jobDescription}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let jsonStr = response.text.trim();
    
    // In case the model still wraps the output in markdown
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    try {
        const parsedData = JSON.parse(jsonStr);
        // Ensure link is populated from the provided URL if the model misses it
        if (!parsedData.link && url) {
            parsedData.link = url;
        }
        return parsedData as JobDetails;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", jsonStr);
        throw new Error("AI returned an invalid JSON format. Please check the console for details.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI service failed to process the request.");
  }
}