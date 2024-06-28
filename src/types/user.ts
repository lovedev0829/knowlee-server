export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio: string;
  level?: number;
  loyaltyPoints?: number;
  createdAt: string;
}

export interface UserDto extends User {
  avatarFile?: File;
}
