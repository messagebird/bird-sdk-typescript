import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: "bk_XXXXXXXXXXXXXXXXXXXXXXXX" });

const msg = await bird.sms.send({
  to: "+14155550100",
  template: { slug: "bird_otp_verification", parameters: { code: "493021" } },
});

console.log(msg.id, msg.status);
