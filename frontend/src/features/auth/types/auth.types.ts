export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
