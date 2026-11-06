import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: "bk_XXXXXXXXXXXXXXXXXXXXXXXX" });

const msg = await bird.whatsapp.send({
  to: "+15551234567",
  template: {
    slug: "bird_delivery_update",
    parameters: { ref: "A1B2C3D4", date: "10 Jul 2026" },
  },
});

console.log(msg.id, msg.status);
