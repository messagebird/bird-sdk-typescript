// Compile-only assertions on the public parameter discovery result: each record
// keeps exactly its schema fields, and each enum keeps its known literals while
// still accepting a value a newer server adds. `tsc -p tsconfig.types.json` is
// the assertion.

import type {
  BirdClient,
  EmailTemplateParameters,
  EmailTemplateParameterTypeValue,
  EmailTemplateParameterValueDomainValue,
  EmailTemplateUseKindValue,
  EmailTemplateUseSiteValue,
  EmailTemplateVariableSourceValue,
} from "../../src/index.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
type Open<T> = T | (string & {});

type Parameter = EmailTemplateParameters["parameters"][number];
type Variable = EmailTemplateParameters["variables"][number];
type Use = Parameter["use_constraints"][number];

export type ParametersReturn = Assert<
  Equal<Awaited<ReturnType<BirdClient["email"]["templates"]["parameters"]>>, EmailTemplateParameters>
>;
export type ResultKeys = Assert<
  Equal<
    keyof EmailTemplateParameters,
    | "template_id"
    | "observed_version_id"
    | "requested_language"
    | "effective_language"
    | "requirements_fingerprint"
    | "parameters"
    | "variables"
  >
>;
export type ParameterKeys = Assert<
  Equal<keyof Parameter, "name" | "type" | "value_domain" | "required" | "sensitive" | "use_constraints">
>;
export type VariableKeys = Assert<Equal<keyof Variable, "path" | "source" | "source_type" | "use_constraints">>;
export type UseKeys = Assert<Equal<keyof Use, "kind" | "site" | "path" | "operation">>;

export type ParameterType = Assert<Equal<Parameter["type"], Open<EmailTemplateParameterTypeValue>>>;
export type ValueDomain = Assert<Equal<Parameter["value_domain"], Open<EmailTemplateParameterValueDomainValue>>>;
export type UseKind = Assert<Equal<Use["kind"], Open<EmailTemplateUseKindValue>>>;
export type UseSite = Assert<Equal<Use["site"], Open<EmailTemplateUseSiteValue>>>;
export type VariableSource = Assert<Equal<Variable["source"], Open<EmailTemplateVariableSourceValue>>>;

export type Required = Assert<Equal<Parameter["required"], boolean>>;
export type ParameterUses = Assert<Equal<Parameter["use_constraints"], Use[]>>;
export type VariableUses = Assert<Equal<Variable["use_constraints"], Use[] | undefined>>;
export type SourceType = Assert<Equal<Variable["source_type"], string | undefined>>;
