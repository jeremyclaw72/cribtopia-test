// Mock Base44 SDK for local development
// Returns sample data for testing UI

console.log('[Mock SDK] Initializing mock SDK...');

const mockListings = [
  {
    id: 'listing-1',
    address: '123 Main Street',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    description: 'Beautiful home in downtown Denver with mountain views',
    photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
    listing_type: 'FSBO',
    status: 'Active',
    seller_name: 'John Seller',
    seller_email: 'john@example.com',
    premium_listing: true,
    amenities: ['Garage', 'Backyard', 'Central AC'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'listing-2',
    address: '456 Oak Avenue',
    city: 'Aurora',
    state: 'CO',
    zip: '80013',
    price: 320000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    description: 'Cozy starter home perfect for first-time buyers',
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
    listing_type: 'FSBO',
    status: 'Active',
    seller_name: 'Jane Seller',
    seller_email: 'jane@example.com',
    premium_listing: false,
    amenities: ['Pool', 'Garage'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'listing-3',
    address: '789 Pine Lane',
    city: 'Boulder',
    state: 'CO',
    zip: '80301',
    price: 2500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 900,
    description: 'Charming rental in Boulder near hiking trails',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
    listing_type: 'Rental',
    status: 'Active',
    seller_name: 'Bob Landlord',
    seller_email: 'bob@example.com',
    premium_listing: false,
    amenities: ['Washer/Dryer', 'Parking'],
    created_at: new Date().toISOString(),
  },
];

const mockUser = {
  id: 'user-demo',
  email: 'demo@cribtopia.com',
  full_name: 'Demo User',
  role: 'seller',
  phone: '555-123-4567',
};

export function createClient(config) {
  console.log('[Mock SDK] createClient called with config:', config);
  
  return {
    entities: {
      Listing: {
        list: async (filters) => {
          console.log('[Mock SDK] Listing.list() called');
          return mockListings;
        },
        get: async (id) => mockListings.find(l => l.id === id) || null,
        create: async (data) => ({ id: 'listing-new', ...data }),
        update: async (id, data) => ({ id, ...data }),
        delete: async (id) => true,
        filter: async (fn) => mockListings.filter(fn),
      },
      Offer: {
        list: async (filters) => {
          console.log('[Mock SDK] Offer.list() called');
          return [];
        },
        get: async (id) => null,
        create: async (data) => ({ id: 'offer-new', ...data }),
        update: async (id, data) => ({ id, ...data }),
        delete: async (id) => true,
      },
      ClosingWorkflow: {
        list: async (filters) => [],
        get: async (id) => null,
        create: async (data) => ({ id: 'workflow-new', ...data }),
        update: async (id, data) => ({ id, ...data }),
        delete: async (id) => true,
      },
      User: {
        list: async (filters) => [],
        get: async (id) => mockUser,
        create: async (data) => ({ id: 'user-new', ...data }),
        update: async (id, data) => ({ id, ...data }),
        delete: async (id) => true,
        me: async () => mockUser,
      },
    },
    functions: {
      invoke: async (name, params) => {
        console.log('[Mock SDK] functions.invoke() called:', name);
        return { result: 'mock-response' };
      },
    },
    auth: {
      getUser: async () => mockUser,
      signIn: async (credentials) => ({ success: true, user: mockUser }),
      signOut: async () => ({ success: true }),
      onAuthChange: (callback) => {
        callback(mockUser);
        return () => {};
      },
    },
    storage: {
      upload: async (file) => ({ url: 'https://example.com/mock-image.png' }),
    },
  };
}

export const base44 = createClient({});

console.log('[Mock SDK] Exported base44 client');