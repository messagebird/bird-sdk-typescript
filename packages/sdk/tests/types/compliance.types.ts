import { BirdClient } from "../../src/index.js";

const bird = new BirdClient({ apiKey: "bk_eu1_test" });
const bytes = new Blob(["%PDF-1.4"]);

void bird.complianceAttachments.create({ file: new File([bytes], "proof.pdf") });
void bird.complianceAttachments.create({ file: bytes, filename: "proof.pdf" });
// @ts-expect-error a Blob carries no name, so `filename` is required
void bird.complianceAttachments.create({ file: bytes });
