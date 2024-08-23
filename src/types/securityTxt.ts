export type SecurityTxt = {
  name: string;
  project_url: string;
  contacts: string;
  policy: string;
  preferred_languages?: string;
  encryption?: string;
  source_code?: string;
  source_release?: string;
  source_revision?: string;
  auditors?: string;
  acknowledgements?: string;
  expiry?: string;
};

export type ProgramDataType = {
  data: [string, "base64"];
};