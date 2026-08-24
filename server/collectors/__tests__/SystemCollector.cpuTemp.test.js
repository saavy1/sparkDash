import test from "node:test";
import assert from "node:assert/strict";
import { SystemCollector } from "../SystemCollector.js";

const c = Object.create(SystemCollector.prototype);
const parse = (raw) => c._parseSensorTemp(raw);

test("converts millidegrees to Celsius", () => {
  assert.equal(parse("70900"), 70.9);
  assert.equal(parse("69200"), 69.2);
});

test("takes the first plausible reading, not the highest", () => {
  assert.equal(parse("70900\n80000\n62200"), 70.9);
});

test("skips the blank line left by the section split", () => {
  assert.equal(parse("\n69200\n66200\n"), 69.2);
});

test("skips unreadable sensors", () => {
  assert.equal(parse("\n\n64500"), 64.5);
  assert.equal(parse("not-a-number\n64500"), 64.5);
});

test("rejects out-of-range values", () => {
  assert.equal(parse("0"), 0);
  assert.equal(parse("-5000"), 0);
  assert.equal(parse("200000"), 0);
  assert.equal(parse("250000"), 0);
  assert.equal(parse("0\n250000\n70900"), 70.9);
});

test("returns 0 when nothing is reported", () => {
  assert.equal(parse(""), 0);
  assert.equal(parse("\n\n"), 0);
  assert.equal(parse(undefined), 0);
});

test("rounds to one decimal", () => {
  assert.equal(parse("69250"), 69.3);
  assert.equal(parse("69240"), 69.2);
});

test("parses AMD sysfs GPU metrics with junction temperature and discrete VRAM", () => {
  const gpu = c._parseAmdGpuLine(
    "AMD|53000|88000|66000|97|325000000|327000000|23195131904|25753026560"
  );

  assert.equal(gpu.temperature, 88);
  assert.equal(gpu.edgeTemperature, 53);
  assert.equal(gpu.hotspotTemperature, 88);
  assert.equal(gpu.memoryTemperature, 66);
  assert.equal(gpu.usage, 97);
  assert.deepEqual(gpu.power, { draw: 325, limit: 327, systemDraw: 345 });
  assert.deepEqual(gpu.vram, {
    used: 22121,
    total: 24560,
    percentage: 90,
    available: 2439,
  });
});
