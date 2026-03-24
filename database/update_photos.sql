-- Update listings with photos
UPDATE listings SET photos = '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"]'::jsonb WHERE address = '123 Main Street';
UPDATE listings SET photos = '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"]'::jsonb WHERE address = '456 Oak Avenue';
UPDATE listings SET photos = '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"]'::jsonb WHERE address = '789 Pine Lane';
UPDATE listings SET photos = '["https://images.unsplash.com/photo-1580587771525-7a5f68c5e5f4?w=400"]'::jsonb WHERE address = '661 Light Stream Lane';

-- Verify
SELECT address, photos FROM listings;