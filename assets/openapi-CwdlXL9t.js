var e=`import { buildSpec, routesFromApp } from "./openapi/build.js";
import { createApp } from "./index.js";

/**
 * Truehound BFF — OpenAPI 3.1 description.
 *
 * Served at GET /api/v1/openapi.json (unauthenticated; the schema
 * itself is public). The procurement research dossier called out
 * "no published API spec" as the deal-blocker most often paired
 * with "we couldn't evaluate the integration cost."
 *
 * The spec is *built from the live Hono route table* (see
 * \`openapi/build.js\`): curated, hand-written path items in
 * \`openapi/paths.js\` carry the rich examples + field docs that clear a
 * customer's API review, and every other registered route is documented
 * with a generated operation so coverage is complete by construction —
 * a new route cannot ship undocumented.
 *
 * \`scripts/generate-openapi.mjs\` writes \`bff/openapi.json\` from the same
 * \`buildSpec\` code path, so the file on disk and this served endpoint
 * never diverge.
 *
 * The spec is OpenAPI 3.1 (the JSON-Schema-compatible revision) so the
 * same \`components.schemas\` are reusable in Pydantic, Zod, and any
 * modern code generator. It loads unchanged in Swagger UI and Redoc.
 */

// Built lazily on first access from the live route table, then memoized.
// Lazy because \`openapi.js\` and \`index.js\` form an import cycle
// (\`index.js\` imports \`registerOpenApi\`; we import \`createApp\`) — a
// top-level \`createApp()\` call would run before \`createApp\` is defined.
// \`createApp()\` is side-effect free (it only constructs the Hono app;
// the listener lives behind the import.meta main guard in index.js).
let _spec = null;

/** The complete OpenAPI 3.1 document. Memoized after first build. */
export function getOpenApiSpec() {
  if (_spec === null) {
    _spec = buildSpec(routesFromApp(createApp()));
  }
  return _spec;
}

// Backwards-compatible eager-looking accessor. A getter keeps the
// \`OPENAPI_SPEC\` import working for callers (tests, tooling) without
// triggering the build during the import cycle.
export const OPENAPI_SPEC = new Proxy(
  {},
  {
    get(_t, prop) {
      return getOpenApiSpec()[prop];
    },
    ownKeys() {
      return Reflect.ownKeys(getOpenApiSpec());
    },
    getOwnPropertyDescriptor(_t, prop) {
      return Object.getOwnPropertyDescriptor(getOpenApiSpec(), prop);
    },
    has(_t, prop) {
      return prop in getOpenApiSpec();
    },
  },
);

/**
 * Register the GET /api/v1/openapi.json endpoint.
 */
export function registerOpenApi(app) {
  app.get("/api/v1/openapi.json", (c) => c.json(getOpenApiSpec()));
}
`;export{e as default};