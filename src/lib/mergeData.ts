import { communityKey } from "./normalize";

const num = (v: any) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export function mergeAll(pre: any[], mob: any[], eng: any[]) {
  const map = new Map<string, any>();

  const ensure = (r: any) => {
    const key = communityKey(r);
    if (!map.has(key)) {
      map.set(key, {
        key,
        state: r.state,
        lga: r.lga,
        ward: r.ward,
        community_name: r.community_name,
        latitude: Number(r.latitude) || undefined,
        longitude: Number(r.longitude) || undefined,
        total_pvhh: 0,
      });
    }
    return map.get(key);
  };

  eng.forEach((r) => {
    const c = ensure(r);
    c.total_pvhh += num(r.total_pvhh);
  });

  return [...map.values()];
}
