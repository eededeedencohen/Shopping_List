import httpClient from "../network/index";

const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * Kick off the background job that refreshes ALL chp.co.il prices in the DB.
 * Returns 202 immediately — actual progress is observed via getRefreshStatus.
 *
 * @returns {Promise<{ ok: boolean, message: string, alreadyRunning: boolean }>}
 */
export const startRefreshAllPrices = async () => {
  try {
    const res = await httpClient.post(
      "/admin/prices/refresh-chp",
      JSON.stringify({}),
      { headers: { "Content-Type": "application/json" } }
    );
    const payload = normalize(res.data);
    return {
      ok: true,
      alreadyRunning: false,
      message: payload?.message || "started",
    };
  } catch (err) {
    const resp = err.response;
    if (resp && resp.status === 409) {
      return { ok: true, alreadyRunning: true, message: "already running" };
    }
    throw err;
  }
};

/**
 * Fetch the current job status. Returns the full shape defined by
 * adminPricesRoutes.js — phases, counters, timing, errors.
 */
export const getRefreshStatus = async () => {
  const res = await httpClient.get("/admin/prices/refresh-chp/status");
  const payload = normalize(res.data);
  return payload?.data || null;
};
