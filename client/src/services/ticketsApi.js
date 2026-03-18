import api from "./api";

/* =======================
   TICKET CREATION
======================= */

export const createTicket = (payload) => {
  return api.post("/tickets/create", payload);
};
