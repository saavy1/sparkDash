import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { remoteBashCommand } from "../ssh.js";

test("remote commands use Bash even when the login shell is Fish", () => {
  const command = [
    "value=amd",
    "case \"$value\" in amd) echo gpu-ok;; *) echo wrong;; esac",
    "for item in one two; do printf ':%s' \"$item\"; done",
  ].join("; ");

  const output = execFileSync("fish", ["-c", remoteBashCommand(command)], {
    encoding: "utf8",
  });

  assert.equal(output, "gpu-ok\n:one:two");
});
