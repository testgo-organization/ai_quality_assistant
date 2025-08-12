export interface User {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  onboarding_ai_process?: boolean;
}
