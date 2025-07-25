
import { processJsonResponse, getHeaders, getBaseUrl } from './apiUtils';

export async function fetchUsers(apiUrl: string): Promise<string[]> {
    const response = await fetch(`${getBaseUrl(apiUrl)}/users`, {
        headers: getHeaders(),
    });
    const data = await processJsonResponse(response, 'users');
    return data.users || [];
}

export async function loginUser(apiUrl:string, name: string, pin: string): Promise<{success: boolean, Id?: string}> {
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Pin', pin);

    const response = await fetch(`${getBaseUrl(apiUrl)}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
    });
    return processJsonResponse(response, 'login');
}
