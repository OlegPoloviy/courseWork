import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Equipment } from "@/types/Equipment";

type EquipmentStore = {
  equipment: Equipment[];
  setEquipment: (data: Equipment[]) => void;
  addEquipment: (data: Equipment) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
  clearEquipment: () => void;
};

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      equipment: [],
      setEquipment: (data) => set({ equipment: data }),
      addEquipment: (item) =>
        set((state) => ({ equipment: [...state.equipment, item] })),
      getEquipmentById: (id) => {
        const { equipment } = get();
        console.log("Looking for ID:", id);
        console.log("Available equipment:", equipment);
        return equipment.find((e) => e.id === id);
      },
      clearEquipment: () => set({ equipment: [] }),
    }),
    {
      name: "equipment-storage",
    }
  )
);
