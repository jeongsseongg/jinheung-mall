# 진흥몰

진흥조화의 조화 상품을 검색하고 주문하는 반응형 웹앱입니다. 70개 초기 상품과 색상 그룹, 장바구니, 즐겨찾기, 회원, 무통장입금 주문, 재고, 고객·주문·상품 관리자 기능을 포함합니다.

## 실행

요구사항은 Node.js 22.13 이상과 pnpm입니다.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
```

## 환경변수

`.env.example`을 `.env.local`로 복사하고 아래 값만 입력합니다.

- `NEXT_PUBLIC_SUPABASE_URL`: 브라우저가 연결할 Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 공개 브라우저 키. RLS가 데이터 접근을 제한합니다.
- `SUPABASE_SECRET_KEY`: 상품 초기 업로드 같은 로컬 관리자 스크립트 전용 서버 키. 브라우저 코드나 Git에 넣지 않습니다.

`NEXT_PUBLIC_*` 값은 Vinext 빌드 시 포함되므로 배포 빌드 환경에도 필요합니다. `.env.local`과 실제 키는 Git에서 제외됩니다.

비밀번호 재설정 메일이 앱으로 돌아오려면 Supabase Dashboard의 Authentication → URL Configuration → Redirect URLs에 운영 도메인의 `https://<도메인>/login?reset=1`을 등록해야 합니다. 로컬에서 복구 흐름을 시험할 때는 `http://localhost:5173/login?reset=1`도 별도로 등록합니다. 등록되지 않은 주소는 재설정 메일을 요청해도 새 비밀번호 화면으로 정상 복귀하지 않습니다.

## 데이터베이스 적용 순서

Supabase SQL Editor에서 `supabase/migrations/001_...sql`부터 번호 순서대로 적용합니다. `010_operational_hardening.sql`에는 다음 운영 보강이 들어 있습니다.

- 중복 제출 방지 주문번호, 재고 잠금·차감·취소 복구
- 허용된 주문 상태 전이와 상태 이력
- 회원 본인 정보 안전 저장과 비공개 관리자 메모
- 계정별 장바구니·자주 주문 저장
- 무통장입금 계좌·배송비 관리자 설정
- 관리자 주문 상세와 고객 집계

관리자 계정은 Supabase Auth 사용자를 만든 뒤 해당 사용자 UUID를 `public.admins.user_id`에 등록합니다. `product-images` Storage 버킷과 초기 상품 업로드는 `scripts/upload-products-to-supabase.mjs`가 담당합니다.

## 상품 이미지 최적화 업로드

원본 사진은 수정하지 않고 메모리에서 최대 1200px, 품질 82의 WebP로 변환합니다. 변환 결과의 해시를 파일명에 넣어 `product-images/optimized`에 1년 캐시로 저장하므로 같은 결과는 다시 업로드하지 않으며, 상품의 `image_url`은 새 WebP 공개 URL로 갱신됩니다.

먼저 키 없이 dry-run으로 70개 이미지의 변환 성공 여부와 실제 절감률을 확인합니다. 이 모드는 네트워크 요청을 보내지 않습니다.

```bash
pnpm run products:images:dry-run -- --map "supabase/product-image-map.json" --photo-root "상품 첫화면 사진"
```

매핑 파일이 없다면 원본 사진 폴더를 지정해 먼저 생성할 수 있습니다.

```bash
node scripts/map-product-images.mjs --photo-root "상품 첫화면 사진"
```

검증 후 실제 업로드는 아래 명령을 사용합니다. 이때만 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`과 `SUPABASE_SECRET_KEY`가 필요하며, 비밀키와 `.env.local`은 커밋하지 않습니다.

```bash
pnpm run products:upload -- --map "supabase/product-image-map.json" --photo-root "상품 첫화면 사진"
```

기존 PNG 객체는 자동 삭제하지 않습니다. DB가 새 WebP URL을 가리키는 것을 확인한 뒤 기존 객체 정리가 필요하면 별도 승인 절차로 진행합니다.

## 아직 외부 계약이 필요한 기능

아래 기능은 코드만으로 실제 운영 연결을 완료할 수 없으며 각 업체와 계약 후 서버 비밀키·웹훅 설정이 필요합니다.

- 자동 입금 확인: PG 가상계좌 계약, 서버 키, 웹훅 서명키
- 카드·네이버페이: 각 결제 가맹점 계약과 API 키
- 택배 자동 접수·운송장: 택배사 또는 배송대행 API 계약
- 이메일·SMS: 발송 업체 키와 발신자 등록
- Firebase 푸시: Firebase 프로젝트와 FCM 서비스 계정

현재 주문은 무통장입금 접수 후 관리자가 입금을 확인하고 주문 상태·택배사·운송장을 입력하는 방식으로 동작합니다.

## 배포

`.openai/hosting.json`의 Sites 프로젝트에 공개 사이트로 배포합니다. 일반 고객용 쇼핑몰이므로 호스팅 접근정책도 public이어야 하며, 회원 인증은 ChatGPT 계정이 아니라 Supabase Auth가 담당합니다.
