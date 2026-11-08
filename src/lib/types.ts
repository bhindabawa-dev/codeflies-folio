export type UserRole = "ADMIN" | "USER";
export type UserStatus = "ACTIVE" | "REVOKED" | "PENDING";
export type ProjectCategory = "website" | "mobile app" | "digital marketing";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  url: string;
  description: string;
  techStack: string[];
  tags: string[];
  category: ProjectCategory | string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
  } | null;
}
