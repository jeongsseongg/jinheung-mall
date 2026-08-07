import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Jinheung Mall catalog", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /진흥몰/);
  assert.match(html, /오늘 필요한 조화/);
  assert.match(html, /장바구니/);
  assert.doesNotMatch(html, /프론트엔드 시안|사업자 인증/);
});

test("keeps production routes and operational safeguards in source", async () => {
  const [appShell, checkout, migration, seeds] = await Promise.all([
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/010_operational_hardening.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/oraedam-products.ts", import.meta.url), "utf8"),
  ]);

  assert.match(appShell, /isAdmin\s*&&\s*<Link href="\/admin"/);
  assert.match(checkout, /p_client_request_id/);
  assert.match(migration, /create_bank_transfer_order/i);
  assert.match(migration, /cancel_my_order/i);
  assert.match(migration, /customer_admin_notes/i);
  assert.equal((seeds.match(/"basePrice"/g) ?? []).length, 70);
  await assert.rejects(access(new URL("../app/business-verification/page.tsx", import.meta.url)));
});
