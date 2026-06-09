import { UserPreferences } from './preferences';

export interface DemoUser {
  id: string;
  name: string;
  seedPreferences: UserPreferences;
}
