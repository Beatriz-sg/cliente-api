export interface Store {
  id: number;

  name: string;

  description: string;

  image: any;

  rating: number;

  deliveryTime: string;

  deliveryFee: string;

  featured: boolean;

  aberta?: boolean;

  bairro?: string;

  cidade?: string;

  nearby?: boolean;

  endereco?: string;

  horario?: string;
}