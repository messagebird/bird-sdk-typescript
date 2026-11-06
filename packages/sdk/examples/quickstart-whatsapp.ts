import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

const msg = await bird.whatsapp.send({
  to: "+14155550100",
  template: {
    slug: "bird_otp",
    parameters: { code: "123456" },
  },
});

console.log(msg.id, msg.status);
