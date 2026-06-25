-- ZeroFuel sample data for development / demo
-- Run: mysql -u root zerofuel_db < src/main/resources/seed-data.sql

INSERT INTO hubs (name, address, city, state, pincode, latitude, longitude, total_slots, is_active, operating_hours, image_url, created_at, updated_at)
VALUES
  ('Koregaon Park Hub', 'Lane 5, Koregaon Park', 'Pune', 'Maharashtra', '411001', 18.5362000, 73.8944000, 15, true, '06:00 - 22:00', NULL, NOW(), NOW()),
  ('FC Road Hub', 'Fergusson College Road', 'Pune', 'Maharashtra', '411004', 18.5185000, 73.8418000, 12, true, '06:00 - 22:00', NULL, NOW(), NOW()),
  ('Viman Nagar Hub', 'Near Phoenix Mall', 'Pune', 'Maharashtra', '411014', 18.5679000, 73.9143000, 20, true, '24x7', NULL, NOW(), NOW());

INSERT INTO bikes (registration_number, qr_code, model_name, brand, range_km, max_speed_kmph, battery_percentage, daily_price_inr, weekly_price_inr, deposit_amount_inr, status, home_hub_id, created_at, updated_at)
VALUES
  ('ZF-MH-001', 'QR-ZF-001', 'Rizta', 'Ather', 123, 80, 94, 299.00, 1499.00, 2000.00, 'AVAILABLE', 1, NOW(), NOW()),
  ('ZF-MH-002', 'QR-ZF-002', 'S1 Pro', 'Ola', 181, 115, 87, 349.00, 1799.00, 2500.00, 'AVAILABLE', 1, NOW(), NOW()),
  ('ZF-MH-003', 'QR-ZF-003', '450X', 'Ather', 146, 90, 76, 299.00, 1499.00, 2000.00, 'AVAILABLE', 2, NOW(), NOW()),
  ('ZF-MH-004', 'QR-ZF-004', 'S1 Air', 'Ola', 125, 90, 91, 279.00, 1399.00, 2000.00, 'AVAILABLE', 3, NOW(), NOW()),
  ('ZF-MH-005', 'QR-ZF-005', 'Chetak', 'Bajaj', 108, 63, 82, 249.00, 1299.00, 1500.00, 'RENTED', 3, NOW(), NOW());
