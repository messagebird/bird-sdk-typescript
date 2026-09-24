// Publishing constraints: see ../../../../AGENTS.md (Cross-SDK example catalog).

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function voiceGet() {
  const call = await bird.voice.legs.get("vcl_01k0p3v9wera3v6q6xw3e9y2mh");
  // A call still ringing or connected carries no economics yet.
  call.status; // "answered" | "no_answer" | "ringing" | …
}

export async function voiceList() {
  for await (const leg of bird.voice.legs.list()) {
    console.log(leg.id, leg.status);
  }
}

export async function voiceTrunksList() {
  for await (const trunk of bird.voice.trunks.list()) {
    // A trunk with no allow list and no session credentials admits nothing.
    console.log(trunk.id, trunk.domain, trunk.inbound_enabled);
  }
}

export async function voiceTrunksUpdate() {
  const trunk = await bird.voice.trunks.update("spt_01krdgeqcxet5s7t44vh8rt9mg", {
    // Each list replaces the previous one, so send what you want to end up with.
    ip_acls: [{ cidr: "203.0.113.0/24", description: "Amsterdam PBX" }],
  });
  console.log(trunk.ip_acls);
}

export async function voiceDestinationsList() {
  const destinations = await bird.voice.destinations.list();
  for (const destination of destinations.data) {
    console.log(destination.country_code, destination.enabled, destination.status);
  }
}

export async function voiceSessionCredentialsCreate() {
  const credential = await bird.voice.sessionCredentials.create();
  // The password is returned once. Until `expires_at` it can place billed calls.
  console.log(credential.username, credential.realm, credential.expires_at);
}

export async function voiceTrunksCreate() {
  const trunk = await bird.voice.trunks.create({
    name: "Lisbon office",
    outbound_enabled: true,
    inbound_enabled: true,
  });
  console.log(trunk.id, trunk.domain);
}

export async function voiceTrunksGet() {
  const trunk = await bird.voice.trunks.get("trunk-id");
  console.log(trunk.name, trunk.inbound_enabled, trunk.outbound_enabled);
}

export async function voiceTrunksDelete() {
  await bird.voice.trunks.delete("trunk-id");
}

export async function voiceTrunksGatewaysList() {
  const gateways = await bird.voice.trunks.gateways.list("TRUNK_ID");
  for (const gateway of gateways.data) {
    console.log(gateway.id, gateway.priority);
  }
}

export async function voiceTrunksGatewaysGet() {
  const gateway = await bird.voice.trunks.gateways.get("TRUNK_ID", "GATEWAY_ID");
  console.log(gateway.id, gateway.priority);
}

export async function voiceTrunksGatewaysCreate() {
  const gateway = await bird.voice.trunks.gateways.create("TRUNK_ID", {
    sip_uri: "sip:pbx.example.com:5060",
    priority: 0,
    destination_format: "1234#{number}",
  });
  console.log(gateway.id, gateway.priority);
}

export async function voiceTrunksGatewaysUpdate() {
  const gateway = await bird.voice.trunks.gateways.update("TRUNK_ID", "GATEWAY_ID", {
    priority: 10,
  });
  console.log(gateway.id, gateway.priority);
}

export async function voiceTrunksGatewaysDelete() {
  await bird.voice.trunks.gateways.delete("TRUNK_ID", "GATEWAY_ID");
}

export async function voiceNumbersList() {
  for await (const number of bird.voice.numbers.list()) {
    console.log(number.id, number.phone_number, number.country_code);
  }
}

export async function voiceNumbersGet() {
  const number = await bird.voice.numbers.get("number-id");
  console.log(number.phone_number, number.directions);
}

export async function voiceNumbersUpdate() {
  const number = await bird.voice.numbers.update("number-id", { name: "Support line" });
  console.log(number.id, number.name);
}

export async function voiceCallerIdsList() {
  for await (const callerId of bird.voice.callerIds.list()) {
    console.log(callerId.id, callerId.phone_number, callerId.status);
  }
}

export async function voiceCallerIdsGet() {
  const callerId = await bird.voice.callerIds.get("caller-id");
  console.log(callerId.phone_number, callerId.status, callerId.verified_at);
}

export async function voiceCallerIdsVerify() {
  const callerId = await bird.voice.callerIds.verify("CALLER_ID", { code: "123456" });
  console.log(callerId.id, callerId.status);
}

export async function voiceDestinationsUpdate() {
  const destinations = await bird.voice.destinations.update({
    destinations: [{ country_code: "PT", enabled: true }],
  });
  console.log(destinations.data?.length ?? 0);
}

export async function voiceCreateCall() {
  const call = await bird.voice.calls.create({
    from: "+12025550100",
    to: "+12025550101",
    sequence: {
      id: "vsq_01krdgeqcxet5s7t44vh8rt9mg",
      entry_node_id: "start",
      trigger_data: {},
    },
  });
  console.log(call.id, call.initial_leg_id, call.sequence?.run_id);
}
