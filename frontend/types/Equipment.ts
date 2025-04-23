export interface Equipment {
  id: string;
  name: string;
  type: string;
  country: string;
  inService: boolean;
  year: string;
  description?: string;
  technicalSpecs?: string;
  imageUrl?: string;
  createdAt: string;
}
