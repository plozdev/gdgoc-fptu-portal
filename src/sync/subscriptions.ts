export type Revisions = Record<string, string>;
type Subscription = {
  resources: string[];
  refresh: () => Promise<boolean>;
  acknowledged?: string;
  pending?: Promise<void>;
};

const subscriptions = new Set<Subscription>();
let latest: Revisions = {};
let epoch = 0;
const signature = (entry: Subscription) => JSON.stringify(entry.resources.map(resource => latest[resource] ?? ''));

async function refresh(entry: Subscription): Promise<void> {
  if (entry.pending) return entry.pending;
  if (!subscriptions.has(entry)) return;
  const target = signature(entry);
  const startedEpoch = epoch;
  if (entry.acknowledged === target) return;
  entry.pending = (async () => {
    try {
      if (await entry.refresh() && startedEpoch === epoch) entry.acknowledged = target;
    } catch {
      // Failed loads remain dirty and retry even without another DB mutation.
    }
  })();
  await entry.pending;
  entry.pending = undefined;
}

export function subscribeSync(resources: string[], loader: () => Promise<boolean>): () => void {
  const entry: Subscription = { resources, refresh: loader };
  subscriptions.add(entry);
  void refresh(entry);
  return () => { subscriptions.delete(entry); };
}

export async function refreshSync(revisions: Revisions): Promise<boolean> {
  latest = { ...revisions };
  // A page runs once even if several dependencies changed together.
  await Promise.all([...subscriptions].map(refresh));
  return [...subscriptions].every(entry => entry.acknowledged === signature(entry));
}

export function resetSync(): void {
  epoch++;
  latest = {};
  for (const entry of subscriptions) entry.acknowledged = undefined;
}
