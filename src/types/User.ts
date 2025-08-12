export interface User {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  hasCompletedAiQualityOnboarding?: boolean;
}
