import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });
const conversation = await bird.amb.conversations.get(
  process.env.AMB_CONVERSATION_ID!,
);
const business = await bird.amb.businessAccounts.get(
  conversation.business_account_id,
);
if (
  business.status === "disconnected" ||
  conversation.status !== "open" ||
  !conversation.recipient.opaque_user_id ||
  !business.apple_business_id
) {
  throw new Error(
    "A configured, connected business account and an open conversation are required.",
  );
}
const message = await bird.amb.send({
  from: business.apple_business_id,
  to: conversation.recipient.opaque_user_id,
  content: { type: "text", body: "Your order is ready." },
});
console.log(message.id);
console.log(await bird.amb.listEvents(message.id));
