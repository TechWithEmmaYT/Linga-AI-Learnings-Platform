import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox",
  //server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})
