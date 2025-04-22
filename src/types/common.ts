export interface Bindings {
  NODE_ENV?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  DATABASE_URL : string;
  ZEPTO_URL: string;
  ZEPTO_TOKEN: string;
  ALLOWED_ORIGINS: string;
  CURRENT_URL: string;
  REPLACE_URL: string;
  BACKEND_URL: string;
  BUCKET_NAME: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  PUBLIC_ACCESS_URL: string;
  ENDPOINT_URL: string;
  [key:string] : string | undefined;
}


export interface Env {
  NODE_ENV?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ZEPTO_URL: string;
  ZEPTO_TOKEN: string;
  ALLOWED_ORIGINS: string;
  DATABASE_URL: string;
  CURRENT_URL: string;
  REPLACE_URL: string;
  BACKEND_URL: string;
  BUCKET_NAME: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  PUBLIC_ACCESS_URL: string;
  ENDPOINT_URL: string;
  [key: string]: string | undefined;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}
