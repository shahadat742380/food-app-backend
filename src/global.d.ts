import 'hono';

import { Bindings, User } from '@/types/common';
import { DbInstance } from '@/db';

// Extend Hono's ContextVariableMap and Env types
declare module 'hono' {
  interface ContextVariableMap {
    user: User; // c.get('user')
    db: DbInstance; // c.get('db')
  }

  interface Env {
    Bindings: Bindings; // For c.env
  }
}