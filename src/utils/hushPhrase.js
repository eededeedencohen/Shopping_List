/**
 * Is this transcript ONLY a "be quiet" request ("שתוק", "די", "שקט", "תפסיק"…)?
 *
 * Used as a client-side safety net for the hands-free voice loop: when the
 * user talks over the robot just to silence it, the reply must be SILENCE —
 * even if the server classified the phrase as "none" and sent back a polite
 * "I didn't understand" clip, we must not play it.
 *
 * Deliberately strict: the WHOLE utterance has to be a hush phrase (with an
 * optional filler before / after). "די, תעבור לעגלה" is NOT a hush — that is a
 * real command and the server resolves it.
 */
const FILLER_BEFORE = "(?:נו|היי|הי|רובוט|בבקשה|אוקיי|אוקי|טוב)";
const FILLER_AFTER = "(?:בבקשה|כבר|עכשיו|נו)";
const HUSH =
  "(?:שתוק|תשתוק|תשתקי|שתקי|די|די די|תפסיק|תפסיקי|תפסיק לדבר|תפסיקי לדבר|שקט|שקט בבקשה|מספיק|סתום|סתמי|עצור|עצרי|לא עכשיו|אל תדבר|אל תדברי|תהיה בשקט|תהיי בשקט|stop|shut up|quiet|enough)";

const HUSH_RE = new RegExp(
  `^(?:${FILLER_BEFORE}\\s+)?${HUSH}(?:\\s+${FILLER_AFTER})?$`,
  "i"
);

export function normalizeTranscript(text) {
  return String(text || "")
    .replace(/[֑-ׇ]/g, "") // Hebrew niqqud
    .replace(/["'`.,!?;:\-–—()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHushPhrase(text) {
  const t = normalizeTranscript(text);
  return !!t && HUSH_RE.test(t);
}

export default isHushPhrase;
