import { create } from "zustand";
import { IUser } from "@/types/user.interface";

interface UserState {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export default useUserStore;
