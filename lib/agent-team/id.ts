let idCounter = 0;

export function createId(prefix = "id"): string {
  idCounter = (idCounter + 1) % Number.MAX_SAFE_INTEGER;
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  const counterPart = idCounter.toString(36);
  return `${prefix}_${timePart}_${randomPart}_${counterPart}`;
}
