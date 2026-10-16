import { recordFetch, jsonResponse } from "../transport.js";
import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";
import {
  EmailTemplateParameterType,
  EmailTemplateParameterValueDomain,
  EmailTemplateUseKind,
  EmailTemplateUseSite,
  EmailTemplateVariableSource,
} from "../../src/index.js";

const template = "emt_01krdgeqcxet5s7t44vh8rt9mg";

// The populated body of the email.templates.parameters conformance vector,
// which only proves the body decodes. The field types are asserted at compile
// time in tests/types/email-template-parameters.types.ts.
const populated = {
  template_id: template,
  observed_version_id: "emv_01krdgeqcxet5s7t44vh8rt9mh",
  requested_language: "en",
  effective_language: "en",
  requirements_fingerprint:
    "sha256:98603c0e927a4aac43b86f6bac4d2d3f72d6b79260aa1d3da33d18e0fea82522",
  parameters: [
    {
      name: "items", type: "text", value_domain: "scalar", required: true, sensitive: false,
      use_constraints: [{ kind: "iterable", site: "html", path: "items", operation: "for" }],
    },
    {
      name: "offer", type: "text", value_domain: "scalar", required: true, sensitive: false,
      use_constraints: [
        { kind: "value", site: "subject", path: "offer", operation: "output" },
        { kind: "value", site: "html", path: "offer", operation: "if" },
      ],
    },
    {
      name: "order_total", type: "amount", value_domain: "scalar", required: false, sensitive: false,
      use_constraints: [{ kind: "value", site: "text", path: "order_total", operation: "output" }],
    },
  ],
  variables: [
    {
      path: "bird.contact.first_name", source: "contact", source_type: "string",
      use_constraints: [
        { kind: "value", site: "subject", path: "bird.contact.first_name", operation: "output" },
      ],
    },
    {
      path: "bird.unsubscribe_url", source: "bird",
      use_constraints: [
        { kind: "value", site: "html", path: "bird.unsubscribe_url", operation: "output" },
      ],
    },
  ],
};

function serve(body: unknown) {
  const { fn, calls } = recordFetch(() => jsonResponse(200, body));
  return { bird: new BirdClient({ apiKey: "bk_eu1_x", fetch: fn }), calls };
}

describe("email template parameter discovery", () => {
  it("returns every parameter, variable and use it is served", async () => {
    const { bird, calls } = serve(populated);
    const result = await bird.email.templates.parameters(template, { language: "en" });

    const url = new URL(calls[0]!.url);
    expect(url.pathname).toBe(`/v1/email/templates/${template}/parameters`);
    expect(url.searchParams.get("language")).toBe("en");
    expect(result).toStrictEqual(populated);

    const [items, offer, total] = result.parameters;
    expect(items?.use_constraints[0]?.kind).toBe(EmailTemplateUseKind.Iterable);
    expect(offer?.use_constraints.map((use) => use.site)).toEqual([
      EmailTemplateUseSite.Subject,
      EmailTemplateUseSite.Html,
    ]);
    expect(total?.type).toBe(EmailTemplateParameterType.Amount);
    expect(total?.value_domain).toBe(EmailTemplateParameterValueDomain.Scalar);
    const [contact, unsubscribe] = result.variables;
    expect(contact?.source).toBe(EmailTemplateVariableSource.Contact);
    expect(contact?.source_type).toBe("string");
    expect(unsubscribe?.source).toBe(EmailTemplateVariableSource.Bird);
    expect(unsubscribe).not.toHaveProperty("source_type");
  });

  it("passes enum values a newer server adds through unchanged", async () => {
    const { requested_language: _, ...rest } = populated;
    const future = {
      ...rest,
      parameters: [
        {
          name: "link", type: "url", value_domain: "list", required: true, sensitive: false,
          use_constraints: [{ kind: "partial", site: "amp", path: "link" }],
        },
      ],
      variables: [{ path: "bird.workspace.name", source: "workspace" }],
    };
    const { bird, calls } = serve(future);
    const result = await bird.email.templates.parameters(template);

    expect(new URL(calls[0]!.url).searchParams.has("language")).toBe(false);
    expect(result).toStrictEqual(future);
    const use = result.parameters[0]?.use_constraints[0];
    expect([result.parameters[0]?.type, result.parameters[0]?.value_domain, use?.kind, use?.site]).toEqual([
      "url",
      "list",
      "partial",
      "amp",
    ]);
    expect(Object.values(EmailTemplateUseSite)).not.toContain(use?.site);
    expect(result.variables[0]?.source).toBe("workspace");
  });
});
