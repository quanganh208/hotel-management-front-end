export interface Hotel {
  _id: string;
  name: string;
  address: string;
  image: string;
  owner: {
    _id: string;
    email: string;
    name: string;
    image: string;
  };
  staff: [];
  rooms: [];
  inventory: [];
  transactions: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateHotelForm {
  name: string;
  address: string;
  image?: File | null;
}

export interface CreateHotelFormErrors {
  name: string;
  address: string;
  image?: string;
}

export interface HotelStore {
  hotels: Hotel[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isInitialized: boolean;
  createHotelForm: CreateHotelForm;
  createHotelFormErrors: CreateHotelFormErrors;
  fetchHotels: () => Promise<void>;
  setCreateHotelForm: (
    field: keyof CreateHotelForm,
    value: string | File | null,
  ) => void;
  validateCreateHotelField: (field: keyof CreateHotelForm) => boolean;
  validateAllCreateHotelFields: () => boolean;
  resetCreateHotelForm: () => void;
  createHotel: () => Promise<void>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
}
