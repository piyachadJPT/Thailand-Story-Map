import { test } from "node:test";
import assert from "node:assert/strict";
import { applyThaiTint, type TintTarget } from "./mapTint";

function fakeMap(layers: { id: string; type: string; layout?: object }[], failOn?: string) {
  const calls = new Map<string, unknown>();
  const map: TintTarget = {
    getStyle: () => ({ layers }),
    setPaintProperty: (id, name, value) => {
      if (id === failOn) throw new Error("no such property");
      calls.set(`${id}:${name}`, value);
    },
  };
  return { map, calls };
}

const layers = [
  { id: "land", type: "background" },
  { id: "water", type: "fill" },
  { id: "road-street", type: "line" },
  { id: "road-street-case", type: "line" },
  { id: "road-primary", type: "line" },
  { id: "road-rail", type: "line" },
  { id: "settlement-label", type: "symbol", layout: { "text-field": "x" } },
  { id: "water-point-label", type: "symbol", layout: { "text-field": "x" } },
  { id: "road-number-shield", type: "symbol", layout: { "text-field": "x" } },
  { id: "poi-icons", type: "symbol", layout: {} },
];

test("light tint colors land, water, roads and labels", () => {
  const { map, calls } = fakeMap(layers);
  applyThaiTint(map, "light");
  assert.equal(calls.get("land:background-color"), "#ebe3d0");
  assert.equal(calls.get("water:fill-color"), "#bccbd9");
  assert.equal(calls.get("road-street:line-color"), "#faf6ec");
  assert.equal(calls.get("road-primary:line-color"), "#f0d9a8");
  assert.equal(calls.get("settlement-label:text-halo-color"), "#f1ebdd");
  assert.equal(calls.get("water-point-label:text-color"), "#5c7792");
});

test("dark tint uses lacquer and gold", () => {
  const { map, calls } = fakeMap(layers);
  applyThaiTint(map, "dark");
  assert.equal(calls.get("land:background-color"), "#16130f");
  assert.equal(calls.get("road-primary:line-color"), "#4a3b22");
});

test("casings differ from road fills", () => {
  const { map, calls } = fakeMap(layers);
  applyThaiTint(map, "light");
  assert.notEqual(calls.get("road-street-case:line-color"), calls.get("road-street:line-color"));
});

test("rail, shields and icon-only symbols are left alone", () => {
  const { map, calls } = fakeMap(layers);
  applyThaiTint(map, "light");
  assert.equal(calls.has("road-rail:line-color"), false);
  assert.equal(calls.has("road-number-shield:text-color"), false);
  assert.equal(calls.has("poi-icons:text-color"), false);
});

test("a layer that rejects a property does not stop the rest", () => {
  const { map, calls } = fakeMap(layers, "water");
  applyThaiTint(map, "light");
  assert.equal(calls.has("water:fill-color"), false);
  assert.equal(calls.get("land:background-color"), "#ebe3d0");
});
