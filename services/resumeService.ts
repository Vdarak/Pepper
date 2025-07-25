import { getBaseUrl, getHeaders, processJsonResponse } from './apiUtils';
import { Resume, JobDetails } from '../types';

interface UploadResponse {
  success: boolean;
  resume_id?: string;
  message?: string;
  error?: string;
}

export async function uploadResume(
  apiUrl: string,
  userId: string,
  file: File,
  fileName: string,
  resumeId?: string | null
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('file', file);
  formData.append('file_name', fileName);
  if (resumeId) {
    formData.append('ResumeId', resumeId);
  }

  try {
    const response = await fetch(`${getBaseUrl(apiUrl)}/resume/upload`, {
      method: 'POST',
      headers: getHeaders(), // Don't set Content-Type, browser will do it for FormData
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `Request failed with status ${response.status}`);
    }

    return responseData as UploadResponse;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function listResumes(
  apiUrl: string,
  userId: string,
  mode: 'default' | 'curated'
): Promise<Resume[]> {
  if (!apiUrl || !userId) {
    return [];
  }
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('mode', mode);

  const response = await fetch(`${getBaseUrl(apiUrl)}/resume/list`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });

  const data = await processJsonResponse(response, `${mode} resumes`);
  return data.resumes || [];
}

export async function fetchResumeSummary(
  apiUrl: string,
  resumeId: string
): Promise<{ summary?: string; error?: string }> {
  try {
    const response = await fetch(`${getBaseUrl(apiUrl)}/resume/summary?ResumeId=${resumeId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `Request failed with status ${response.status}`);
    }

    return responseData;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred while fetching summary.';
    return { error: errorMessage };
  }
}

export async function renameResume(
  apiUrl: string,
  resumeId: string,
  newName: string
): Promise<{ success: boolean; message?: string; error?: string; }> {
  const formData = new FormData();
  formData.append('ResumeId', resumeId);
  formData.append('new_name', newName);

  try {
    const response = await fetch(`${getBaseUrl(apiUrl)}/resume/rename`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `Request failed with status ${response.status}`);
    }

    return responseData as { success: boolean; message?: string; error?: string; };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function downloadResume(
  apiUrl: string,
  resumeId: string,
  resumeName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${getBaseUrl(apiUrl)}/resume/download?ResumeId=${resumeId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function curateResume(
  apiUrl: string,
  userId: string,
  resumeId: string,
  jobDesc: JobDetails
): Promise<{ success: boolean; curated_resume_id?: string; message?: string; error?: string; }> {
    const payload = {
        user_id: userId,
        resume_id: resumeId,
        job_desc: jobDesc,
    };

    try {
        const response = await fetch(`${getBaseUrl(apiUrl)}/resume/curate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders(),
            },
            body: JSON.stringify(payload),
        });
        
        return processJsonResponse(response, 'curate resume request');
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown network error occurred.';
        return { success: false, error: errorMessage };
    }
}