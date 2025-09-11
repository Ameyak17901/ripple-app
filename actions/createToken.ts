"use server";

import serverClient from "@/lib/streamServer";

export const createToken = async (userId: string) => {
  const token = serverClient.createToken(userId);
  return token;
};
