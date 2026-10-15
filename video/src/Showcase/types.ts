export type PhotoData = { src: string; w: number; h: number };

export type Property = {
  id: string;
  titulo: string;
  zona: string;
  unidades: string | null;
  entrega: string | null;
  estado: string | null;
  photos: PhotoData[];
};
