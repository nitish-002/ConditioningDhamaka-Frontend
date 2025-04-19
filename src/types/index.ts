export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'rider';
  createdAt: string;
}
