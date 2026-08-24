import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

// What is this number? The base lookup always answers the country, the serving
// network and a coarse line type, and it always bills once.
const number = await bird.lookup.phoneNumber({
  phone_number: "+31612345678",
  type: ["porting", "score"],
});

console.log(number.country_code, number.line_type);

// Each requested property is billed only when it is delivered, so read the
// status before the value. Anything other than "ok" means "not answered".
if (number.score?.status === "ok") {
  console.log("credibility", number.score.value);
}
if (number.porting?.status === "ok") {
  console.log("ported", number.porting.ported, number.porting.last_ported_at);
}

// Is this address worth sending to? `result` is the field to decide on;
// `delivery_confidence` is always present and comparable, which is what makes
// it safe to fall back on when a new verdict is added.
const address = await bird.lookup.email({ email: "aisha.khan@example.com" });

console.log(address.result, address.delivery_confidence);

if (address.result === "typo") {
  console.log("did you mean", address.did_you_mean);
}
