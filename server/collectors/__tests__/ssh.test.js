import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { remoteBashCommand } from "../ssh.js";

const command = [
  "value=amd",
  "case \"$value\" in amd) echo gpu-ok;; *) echo wrong;; esac",
  "for item in one two; do printf ':%s' \"$item\"; done",
].join("; ");

test("remote command wrapper round-trips Bash syntax through a login shell", () => {
  const output = execFileSync("sh", ["-c", remoteBashCommand(command)], {
    encoding: "utf8",
  });
  assert.equal(output, "gpu-ok\n:one:two");
});

const fish = ["/usr/bin/fish", "/usr/local/bin/fish"].find(existsSync);
test("remote commands use Bash when the login shell is Fish", { skip: !fish }, () => {
  const output = execFileSync(fish, ["-c", remoteBashCommand(command)], {
    encoding: "utf8",
  });
  assert.equal(output, "gpu-ok\n:one:two");
});
