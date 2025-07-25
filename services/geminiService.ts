import { JobDetails } from "../types";

export async function parseJobDetails(jobDescription: string, url: string, extraInfo: string): Promise<JobDetails> {
  
  try {
    const response = await fetch('/api/parseJob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        url,
        extraInfo,
      }),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred on the server.' }));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const result = await response.json();

    // Ensure link is populated from the provided URL if the model misses it
    if (!result.link && url) {
        result.link = url;
    }
    return result as JobDetails;

  } catch (error) {
    console.error("Error calling parseJob API:", error);
    const errorMessage = error instanceof Error ? error.message : 'The service failed to process the request.';
    throw new Error(errorMessage);
  }
}
