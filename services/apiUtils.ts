
export const getBaseUrl = (apiUrl: string) => apiUrl.replace(/\/$/, "");

export const handleApiError = async (response: Response, entityName: string) => {
    if (!response.ok) {
        let errorBody = 'Could not retrieve error details.';
        try {
            errorBody = await response.text();
        } catch (e) {
            // Ignore if can't read body
        }
        
        if (response.status === 0 || response.type === 'opaque' || response.type === 'error') {
            throw new Error(`Failed to fetch ${entityName} due to a network or CORS issue. Please check the browser console for details.`);
        }
        
        throw new Error(`Failed to fetch ${entityName}. Status: ${response.status}. Body: ${errorBody}`);
    }
};

export const processJsonResponse = async (response: Response, entityName: string) => {
    await handleApiError(response, entityName);
    
    const responseText = await response.text();
    if (!responseText) {
        console.warn(`Received empty response for ${entityName}.`);
        return {};
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        console.error(`Raw response for ${entityName}:`, responseText);
        if (responseText.trim().toLowerCase().startsWith('<!doctype html>')) {
             throw new Error(`Failed to parse JSON response for ${entityName}. The server returned an HTML page instead of JSON. This is often caused by a proxy or tunnel service like ngrok.`);
        }
        throw new Error(`Failed to parse JSON response for ${entityName}.`);
    }
};

export const getHeaders = () => {
    const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'true',
    };
    return headers;
}

/**
 * Truncates a filename to a max length, preserving the .docx extension.
 * This prevents backend errors for database columns with limited length.
 * @param fileName The original filename.
 * @param maxLength The maximum total length of the filename.
 * @returns The truncated and extension-normalized filename.
 */
export const truncateFileName = (fileName: string, maxLength: number = 100): string => {
  const EXTENSION = '.docx';
  let baseName = fileName.trim();

  // Remove extension if it exists for clean truncation
  if (baseName.toLowerCase().endsWith(EXTENSION)) {
    baseName = baseName.slice(0, -EXTENSION.length);
  }

  // Ensure baseName does not exceed the allowed length for the name part
  const maxBaseNameLength = maxLength - EXTENSION.length;
  if (baseName.length > maxBaseNameLength) {
    baseName = baseName.slice(0, maxBaseNameLength);
  }

  return baseName + EXTENSION;
};
