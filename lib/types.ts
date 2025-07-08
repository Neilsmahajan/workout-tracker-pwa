export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Set {
  id: string;
  weight: number;
  reps: number;
  timestamp: Date;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}
