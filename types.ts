




export interface JobDetails {
  title: string;
  jobid: string;
  post_date: string;
  company: string;
  link: string;
  scraped_from: string;
  location: string;
  experience_required: string;
  company_size: string;
  salary_range: string;
  application_website: string;
  sponsorship: string;
  referral: boolean;
  description: string;
  uuid?: string;
}

export interface UserRequest {
  RequestId: string;
  endpoint: string;
  status: "Finished" | "Pending" | "Queued" | number;
  resumeName: string | null;
}

export interface Resume {
  ResumeId: string;
  Name: string;
  HasJson: boolean;
  ResumeJson?: string;
  CreatedOn?: string; // YYYYMMDD format
}

// For Agent2 Content (renamed from AgentContent for clarity)
export interface Agent2Content {
  title_impression?: string;
  strengths?: string[];
  resume_style?: string;
  section_analysis?: { [key: string]: string };
  [key: string]: any; 
}

// For Agent3 Content
export interface Agent3Content {
  recruiter: {
    must_haves: string[];
    good_to_haves: string[];
  };
  ats: string[];
}

// For Agent4 Content
export interface Agent4SectionFeedback {
  needs_editing: boolean;
  reason: string;
  edit_instructions?: any[];
}
export type Agent4Content = Record<string, Agent4SectionFeedback>;

// For Agent5 Content
export interface ResumeChange {
  section: string;
  replace: {
    original: string;
    updated: string;
  };
}
export interface Agent5Content {
  resume_id: string;
  file_name: string;
  resume_changes?: ResumeChange[];
}

// Represents the `agents` object from the API
export interface AllAgentsContent {
  Agent2?: string | null;
  Agent3?: string | null;
  Agent4?: string | null;
  Agent5?: string | null; // Can be JSON string or null/"None"
}

export interface RequestStateDetails {
  success: boolean;
  status: string;
  agents: AllAgentsContent;
  error?: string;
}