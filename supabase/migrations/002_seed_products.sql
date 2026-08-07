begin;

-- 진흥몰 상품 70개와 색상 옵션 279개
-- 같은 SKU와 같은 색상은 중복 생성하지 않고 갱신합니다.

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-001', 'jh-flower-001', '카라', '노랑, 보라, 빨강, 크림 색상 그룹의 18부쉬 조화 상품', 2000, 18, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-001.png', true, '{"note":null,"specification":"18부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-002', 'jh-flower-002', '콜러스', '노랑, 라인핑크, 보라, 오렌지, 크림 색상 그룹의 9부쉬 조화 상품', 2500, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-002.png', true, '{"note":null,"specification":"9부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-003', 'jh-flower-003', '튤립', '노랑, 분홍, 보라, 빨강, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-003.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-004', 'jh-flower-004', '개나리', '노랑 색상 그룹의 7부쉬 조화 상품', 2200, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-004.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-005', 'jh-flower-005', '매화', '노랑, 연분홍, 분홍, 빨강, 크림 색상 그룹의 7부쉬 · 46cm 조화 상품', 2000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-005.png', true, '{"note":null,"specification":"7부쉬 · 46cm","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-006', 'jh-flower-006', '벚꽃', '노랑, 연분홍, 분홍, 크림, 진분홍 색상 그룹의 7부쉬 조화 상품', 2000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-006.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-007', 'jh-flower-007', '진달래', '뷰티 색상 그룹의 7부쉬 조화 상품', 2000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-007.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-008', 'jh-flower-008', '코스모스', '노랑, 라인핑크, 보라, 자주, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-008.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-009', 'jh-flower-009', '해바라기', '노랑 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-009.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-010', 'jh-flower-010', '해바라기9', '노랑 색상 그룹의 9부쉬 · 55cm · 10송이 조화 상품', 2500, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-010.png', true, '{"note":null,"specification":"9부쉬 · 55cm · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-011', 'jh-flower-011', '해바라기대', '노랑 색상 그룹의 9부쉬 · 55cm · 20송이 조화 상품', 4500, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-011.png', true, '{"note":null,"specification":"9부쉬 · 55cm · 20송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-012', 'jh-flower-012', '무궁화', '노랑, 보라, 분홍, 크림 색상 그룹의 14부쉬 조화 상품', 1800, 14, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-012.png', true, '{"note":null,"specification":"14부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-013', 'jh-flower-013', '장미', '노랑, 보라, 연보라, 빨강, 연분홍, 크림, 분홍 색상 그룹의 원형리스 15cm 조화 상품', 2000, null, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-013.png', true, '{"note":null,"specification":"원형리스 15cm","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-014', 'jh-flower-014', '카네이션', '노랑, 빨강, 라인핑크, 크림 색상 그룹의 원형리스 15cm 조화 상품', 2000, null, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-014.png', true, '{"note":null,"specification":"원형리스 15cm","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-015', 'jh-flower-015', '장미', '노랑, 보라, 연보라, 빨강, 연분홍, 크림, 분홍 색상 그룹의 하트리스 15cm 조화 상품', 2000, null, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-015.png', true, '{"note":null,"specification":"하트리스 15cm","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-016', 'jh-flower-016', '대팜팜', '진분홍 색상 그룹의 9부쉬 조화 상품', 2000, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-016.png', true, '{"note":null,"specification":"9부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-017', 'jh-flower-017', '믹스팡팡', '노랑, 분홍 색상 그룹의 9부쉬 조화 상품', 2000, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-017.png', true, '{"note":null,"specification":"9부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-018', 'jh-flower-018', '카네이션13', '크림핑크 색상 그룹의 12부쉬 조화 상품', 1800, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-018.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-019', 'jh-flower-019', '장미24', '빨강, 오렌지 색상 그룹의 24부쉬 · 60cm · 12송이 조화 상품', 2000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-019.png', true, '{"note":null,"specification":"24부쉬 · 60cm · 12송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-020', 'jh-flower-020', '부케씨장미', '오렌지 색상 그룹의 24부쉬 · 다즌 · 10송이 조화 상품', 2000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-020.png', true, '{"note":"품명 판독 확인 필요","specification":"24부쉬 · 다즌 · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-021', 'jh-flower-021', '부케금잔화', '진분홍 색상 그룹의 24부쉬 · 다즌 · 10송이 조화 상품', 2000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-021.png', true, '{"note":null,"specification":"24부쉬 · 다즌 · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-022', 'jh-flower-022', '카네션구24', '크림, 빨강 색상 그룹의 24부쉬 · 60cm · 12송이 조화 상품', 2000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-022.png', true, '{"note":"품명 판독 확인 필요","specification":"24부쉬 · 60cm · 12송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-023', 'jh-flower-023', '수선화', '라인핑크, 보라 색상 그룹의 12부쉬 조화 상품', 1500, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-023.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-024', 'jh-flower-024', '수련', '노랑, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 1500, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-024.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-025', 'jh-flower-025', '벚꽃7', '분홍, 뷰티, 크림 색상 그룹의 7부쉬 조화 상품', 1000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-025.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-026', 'jh-flower-026', '금잔화10', '오렌지 색상 그룹의 10부쉬 조화 상품', 1000, 10, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-026.png', true, '{"note":null,"specification":"10부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-027', 'jh-flower-027', '새난', '진분홍 색상 그룹의 18부쉬 조화 상품', 1000, 18, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-027.png', true, '{"note":null,"specification":"18부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-028', 'jh-flower-028', '수경장미', '보라 색상 그룹의 12부쉬 조화 상품', 1000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-028.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-029', 'jh-flower-029', '양귀비', '보라, 빨강, 오렌지, 크림 색상 그룹의 18부쉬 조화 상품', 500, 18, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-029.png', true, '{"note":null,"specification":"18부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-030', 'jh-flower-030', '태양화', '크림 색상 그룹의 7부쉬 조화 상품', 1000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-030.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-031', 'jh-flower-031', '국화', '노랑, 노랑테, 보라, 빨강, 흰색 색상 그룹의 14부쉬 조화 상품', 2000, 14, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-031.png', true, '{"note":"색상 “노랑테” 원본 대조 필요","specification":"14부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-032', 'jh-flower-032', '금국', '노랑, 보라, 오렌지, 진분홍, 크림 색상 그룹의 7부쉬 조화 상품', 2000, 7, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-032.png', true, '{"note":null,"specification":"7부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-033', 'jh-flower-033', '금잔화12', '노랑, 진분홍, 신보라, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-033.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-034', 'jh-flower-034', '다알리아', '노랑, 보라, 오렌지, 꽃분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-034.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-035', 'jh-flower-035', '동백', '노랑, 라인핑크, 빨강, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-035.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-036', 'jh-flower-036', '레이디장미', '노랑, 크림, 보라, 크림, 진분홍, 분홍, 오렌지, 큐티 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-036.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-037', 'jh-flower-037', '대팜팜', '노랑, 꽃분홍, 신보라, 빨강, 오렌지, 크림, 크림핑크 색상 그룹의 9부쉬 · 10송이 조화 상품', 2200, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-037.png', true, '{"note":"손글씨 표기 있음 — 인쇄 단가 기준","specification":"9부쉬 · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-038', 'jh-flower-038', '물망초', '노랑, 보라, 오렌지, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-038.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-039', 'jh-flower-039', '미니몰', '노랑, 오렌지, 보라, 연보라, 진분홍, 분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2200, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-039.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-040', 'jh-flower-040', '미니장미', '노랑, 분홍, 빨강, 신보라, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-040.png', true, '{"note":"별표/취소 표시 있음","specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-041', 'jh-flower-041', '믹스동백', '노랑, 꽃분홍, 오렌지, 크림라인 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-041.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-042', 'jh-flower-042', '믹스백합', '노랑, 오렌지, 보라, 연보라, 분홍, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-042.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-043', 'jh-flower-043', '믹스봉장미', '노랑, 크림, 보라, 연보라, 진분홍, 분홍, 오렌지 색상 그룹의 12부쉬 조화 상품', 2200, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-043.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-044', 'jh-flower-044', '백합9', '노랑, 보라, 라인분홍, 크림 색상 그룹의 9부쉬 · 55cm · 12송이 조화 상품', 2500, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-044.png', true, '{"note":null,"specification":"9부쉬 · 55cm · 12송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-045', 'jh-flower-045', '별장미', '노랑, 꽃분홍, 신보라, 빨강, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-045.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-046', 'jh-flower-046', '불국', '노랑, 꽃분홍, 보라, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-046.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-047', 'jh-flower-047', '봉장미', '노랑, 신보라, 빨강, 라인분홍, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-047.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-048', 'jh-flower-048', '부케금잔화36', '노랑, 라인분홍, 오렌지, 크림 색상 그룹의 36부쉬 · 8송이 조화 상품', 5000, 36, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-048.png', true, '{"note":null,"specification":"36부쉬 · 8송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-049', 'jh-flower-049', '부케장미24', '노랑, 보라, 빨강, 오렌지, 크림 색상 그룹의 24부쉬 · 10송이 조화 상품', 4000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-049.png', true, '{"note":null,"specification":"24부쉬 · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-050', 'jh-flower-050', '부케카네션', '노랑, 빨강, 라인핑크, 오렌지, 크림 색상 그룹의 24부쉬 · 10송이 조화 상품', 4000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-050.png', true, '{"note":"손글씨 표기 있음 — 인쇄 단가 기준","specification":"24부쉬 · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-051', 'jh-flower-051', '새순장미', '노랑, 꽃분홍, 빨강, 신보라, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-051.png', true, '{"note":"별표/취소 표시 있음","specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-052', 'jh-flower-052', '소국', '노랑, 보라, 오렌지, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2200, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-052.png', true, '{"note":"손글씨 표기 있음 — 인쇄 단가 기준","specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-053', 'jh-flower-053', '수국', '노랑, 꽃분홍, 블루, 크림 색상 그룹의 11부쉬 조화 상품', 2000, 11, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-053.png', true, '{"note":"손글씨 표기 있음 — 인쇄 단가 기준","specification":"11부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-054', 'jh-flower-054', '신국화', '노랑, 빨강, 보라, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-054.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-055', 'jh-flower-055', '신국화24', '노랑, 보라, 빨강, 흰색 색상 그룹의 24부쉬 · 60cm · 12송이 조화 상품', 3000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-055.png', true, '{"note":null,"specification":"24부쉬 · 60cm · 12송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-056', 'jh-flower-056', '신데이지', '노랑, 보라, 오렌지, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2200, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-056.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-057', 'jh-flower-057', '신앵두', '빨강 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-057.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-058', 'jh-flower-058', '신장미24', '노랑, 오렌지, 꽃분홍, 크림 색상 그룹의 24부쉬 · 60cm · 12송이 조화 상품', 3000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-058.png', true, '{"note":null,"specification":"24부쉬 · 60cm · 12송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-059', 'jh-flower-059', '신후리지아', '노랑, 보라, 라인분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-059.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-060', 'jh-flower-060', '실국화', '노랑, 꽃분홍, 신보라, 크림핑크 색상 그룹의 9부쉬 · 55cm · 10송이 조화 상품', 3000, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-060.png', true, '{"note":"손글씨 표기 있음 — 인쇄 단가 기준","specification":"9부쉬 · 55cm · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-061', 'jh-flower-061', '아이리스', '노랑, 보라, 진분홍, 크림 색상 그룹의 10부쉬 조화 상품', 2000, 10, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-061.png', true, '{"note":null,"specification":"10부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-062', 'jh-flower-062', '안개', '노랑, 꽃분홍, 보라, 크림 색상 그룹의 12부쉬 조화 상품', 1800, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-062.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-063', 'jh-flower-063', '양란', '노랑, 보라, 진분홍, 크림 색상 그룹의 18부쉬 조화 상품', 2000, 18, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-063.png', true, '{"note":null,"specification":"18부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-064', 'jh-flower-064', '연꽃', '노랑, 보라, 진분홍, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-064.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-065', 'jh-flower-065', '영국장미', '노랑, 꽃분홍, 보라, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-065.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-066', 'jh-flower-066', '중목단', '노랑, 보라, 오렌지, 자주, 크림 색상 그룹의 9부쉬 조화 상품', 2000, 9, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-066.png', true, '{"note":null,"specification":"9부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-067', 'jh-flower-067', '카네션', '노랑, 라인핑크, 빨강, 오렌지, 크림 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-067.png', true, '{"note":null,"specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-068', 'jh-flower-068', '카네션13', '노랑, 라인분홍, 빨강, 오렌지, 크림라인 색상 그룹의 13부쉬 조화 상품', 2200, 13, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-068.png', true, '{"note":null,"specification":"13부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-069', 'jh-flower-069', '카네션24', '노랑, 꽃분홍, 빨강, 오렌지, 크림핑크 색상 그룹의 24부쉬 · 60cm · 10송이 조화 상품', 3000, 24, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-069.png', true, '{"note":null,"specification":"24부쉬 · 60cm · 10송이","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)
values ('JH-FL-070', 'jh-flower-070', '카네션엔젤', '노랑, 분홍, 빨강, 오렌지, 크림라인 색상 그룹의 12부쉬 조화 상품', 2000, 12, '단', 0, 'https://ljnzmsfbqzshajjjpjmr.supabase.co/storage/v1/object/public/product-images/JH-FL-070.png', true, '{"note":"별표/취소 표시 있음","specification":"12부쉬","stock_unconfirmed":true}'::jsonb)
on conflict (sku) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,
  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,
  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 0 from public.products where sku = 'JH-FL-025'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-002'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 0 from public.products where sku = 'JH-FL-026'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 0 from public.products where sku = 'JH-FL-027'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 0 from public.products where sku = 'JH-FL-028'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 0 from public.products where sku = 'JH-FL-029'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-062'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-038'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 0 from public.products where sku = 'JH-FL-030'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-031'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-061'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-035'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-034'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-032'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-060'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-033'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-006'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-070'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-059'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-058'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 0 from public.products where sku = 'JH-FL-057'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '뷰티', 0, 0 from public.products where sku = 'JH-FL-007'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-008'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-068'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-056'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-055'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-054'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-009'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-010'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-011'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-012'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-067'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-053'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-052'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-066'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-051'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-050'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-049'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-048'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-001'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-014'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-003'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-046'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-069'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-044'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-041'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 0 from public.products where sku = 'JH-FL-016'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-017'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-065'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림핑크', 0, 0 from public.products where sku = 'JH-FL-018'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 0 from public.products where sku = 'JH-FL-019'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-064'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 0 from public.products where sku = 'JH-FL-020'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 0 from public.products where sku = 'JH-FL-021'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 0 from public.products where sku = 'JH-FL-022'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-063'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 0 from public.products where sku = 'JH-FL-023'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-004'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-024'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑', 0, 0 from public.products where sku = 'JH-FL-005'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 1 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-001'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 1 from public.products where sku = 'JH-FL-002'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 1 from public.products where sku = 'JH-FL-003'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연분홍', 0, 1 from public.products where sku = 'JH-FL-005'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연분홍', 0, 1 from public.products where sku = 'JH-FL-006'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 1 from public.products where sku = 'JH-FL-008'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-012'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 1 from public.products where sku = 'JH-FL-014'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 1 from public.products where sku = 'JH-FL-017'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 1 from public.products where sku = 'JH-FL-019'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 1 from public.products where sku = 'JH-FL-022'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-023'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 1 from public.products where sku = 'JH-FL-024'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '뷰티', 0, 1 from public.products where sku = 'JH-FL-025'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 1 from public.products where sku = 'JH-FL-029'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '노랑테', 0, 1 from public.products where sku = 'JH-FL-031'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-032'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 1 from public.products where sku = 'JH-FL-033'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-034'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 1 from public.products where sku = 'JH-FL-035'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 1 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-038'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 1 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 1 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-041'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 1 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 1 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-044'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-046'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인분홍', 0, 1 from public.products where sku = 'JH-FL-048'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-049'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 1 from public.products where sku = 'JH-FL-050'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-051'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-052'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-053'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 1 from public.products where sku = 'JH-FL-054'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-055'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-056'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 1 from public.products where sku = 'JH-FL-058'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-059'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-060'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-061'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-062'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-063'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-064'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-065'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 1 from public.products where sku = 'JH-FL-066'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 1 from public.products where sku = 'JH-FL-067'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인분홍', 0, 1 from public.products where sku = 'JH-FL-068'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 1 from public.products where sku = 'JH-FL-069'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 1 from public.products where sku = 'JH-FL-070'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-008'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-035'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-048'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-065'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-055'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-002'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-049'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-041'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-054'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-003'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-034'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 2 from public.products where sku = 'JH-FL-050'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-038'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '블루', 0, 2 from public.products where sku = 'JH-FL-053'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연보라', 0, 2 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 2 from public.products where sku = 'JH-FL-012'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-051'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-052'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-029'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-067'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 2 from public.products where sku = 'JH-FL-033'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 2 from public.products where sku = 'JH-FL-063'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-032'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-069'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-062'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 2 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 2 from public.products where sku = 'JH-FL-005'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 2 from public.products where sku = 'JH-FL-061'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 2 from public.products where sku = 'JH-FL-060'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 2 from public.products where sku = 'JH-FL-024'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인분홍', 0, 2 from public.products where sku = 'JH-FL-059'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인분홍', 0, 2 from public.products where sku = 'JH-FL-044'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 2 from public.products where sku = 'JH-FL-064'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연보라', 0, 2 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-001'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 2 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 2 from public.products where sku = 'JH-FL-006'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 2 from public.products where sku = 'JH-FL-058'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-066'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-046'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-068'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인핑크', 0, 2 from public.products where sku = 'JH-FL-014'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 2 from public.products where sku = 'JH-FL-025'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '보라', 0, 2 from public.products where sku = 'JH-FL-031'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 2 from public.products where sku = 'JH-FL-056'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 2 from public.products where sku = 'JH-FL-070'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-006'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연보라', 0, 3 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 3 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림라인', 0, 3 from public.products where sku = 'JH-FL-041'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-065'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연보라', 0, 3 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연보라', 0, 3 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-044'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-014'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-046'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '라인분홍', 0, 3 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '자주', 0, 3 from public.products where sku = 'JH-FL-066'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-048'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-049'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-002'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-050'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '신보라', 0, 3 from public.products where sku = 'JH-FL-051'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-012'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 3 from public.products where sku = 'JH-FL-052'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-067'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-053'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-054'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '자주', 0, 3 from public.products where sku = 'JH-FL-008'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '흰색', 0, 3 from public.products where sku = 'JH-FL-055'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 3 from public.products where sku = 'JH-FL-056'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-058'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-068'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-059'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림핑크', 0, 3 from public.products where sku = 'JH-FL-060'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-005'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-001'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-061'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-070'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-062'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 3 from public.products where sku = 'JH-FL-032'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-033'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-063'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '꽃분홍', 0, 3 from public.products where sku = 'JH-FL-034'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-031'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-003'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-035'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 3 from public.products where sku = 'JH-FL-069'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 3 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-029'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '빨강', 0, 3 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 3 from public.products where sku = 'JH-FL-064'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 3 from public.products where sku = 'JH-FL-038'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-035'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-005'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림라인', 0, 4 from public.products where sku = 'JH-FL-068'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림핑크', 0, 4 from public.products where sku = 'JH-FL-069'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-050'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-008'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-067'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-049'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-054'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-034'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-066'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연분홍', 0, 4 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 4 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 4 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 4 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-056'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 4 from public.products where sku = 'JH-FL-006'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-046'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 4 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-002'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 4 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 4 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 4 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-065'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-003'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '연분홍', 0, 4 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-032'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 4 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-038'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-033'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-051'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '흰색', 0, 4 from public.products where sku = 'JH-FL-031'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 4 from public.products where sku = 'JH-FL-052'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림라인', 0, 4 from public.products where sku = 'JH-FL-070'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-040'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 5 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 5 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-045'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 5 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-047'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '진분홍', 0, 5 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 5 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림핑크', 0, 6 from public.products where sku = 'JH-FL-037'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 6 from public.products where sku = 'JH-FL-042'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '크림', 0, 6 from public.products where sku = 'JH-FL-039'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '오렌지', 0, 6 from public.products where sku = 'JH-FL-043'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '큐티', 0, 6 from public.products where sku = 'JH-FL-036'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 6 from public.products where sku = 'JH-FL-015'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

insert into public.product_colors (product_id, name, stock_quantity, sort_order)
select id, '분홍', 0, 6 from public.products where sku = 'JH-FL-013'
on conflict (product_id, name) do update set
  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;

commit;
