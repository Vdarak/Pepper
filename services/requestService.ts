


import { getBaseUrl, processJsonResponse } from './apiUtils';
import { UserRequest, RequestStateDetails } from '../types';

const N_ENTRIES = 10;

export async function fetchUserRequests(
  apiUrl: string,
  userId: string,
  pageNum: number
): Promise<UserRequest[]> {
  const payload = {
    user_id: userId,
    page_num: pageNum,
    n: N_ENTRIES,
  };

  const response = await fetch(`${getBaseUrl(apiUrl)}/user/fetch/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  const data = await processJsonResponse(response, 'user requests');
  // API returns an object with a 'requests' key
  return data.requests || [];
}

export async function fetchRequestState(
  apiUrl:string,
  requestId: string
): Promise<RequestStateDetails> {
  const payload = {
    request_id: requestId,
  };
  
  const response = await fetch(`${getBaseUrl(apiUrl)}/user/fetch/request/state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  const data = await processJsonResponse(response, `request state for ${requestId}`);
  if (!data.success) {
      throw new Error(data.error || 'Failed to fetch request state details');
  }

  return data as RequestStateDetails;
}

export async function approveCurationStep(
  apiUrl: string,
  requestId: string,
  editedInstructions?: string,
  customInstructions?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
    const payload: {
        request_id: string;
        edited_instructions?: string;
        custom_instructions?: string;
    } = {
        request_id: requestId,
    };

    if (editedInstructions) {
        try {
            // Validate that it's valid JSON before sending.
            JSON.parse(editedInstructions);
            payload.edited_instructions = editedInstructions;
        } catch (e) {
            return { success: false, error: 'The provided JSON for instructions is invalid.' };
        }
    }

    if (customInstructions && customInstructions.trim()) {
        payload.custom_instructions = customInstructions.trim();
    }

    const response = await fetch(`${getBaseUrl(apiUrl)}/resume/curate/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
    });

    return processJsonResponse(response, `curation approval for ${requestId}`);
}