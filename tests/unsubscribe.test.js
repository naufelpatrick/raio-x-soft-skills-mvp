import test from "node:test";
import assert from "node:assert/strict";
import unsubscribeHandler from "../api/submit-lead.js";

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("unsubscribe rejeita token previsível ou malformado antes de consultar dados", async () => {
  const req = {
    method: "POST",
    query: { action: "unsubscribe" },
    headers: { "content-type": "application/json", "x-forwarded-for": "unsubscribe-test" },
    socket: {},
    body: { token: "123" },
  };
  const res = responseRecorder();
  await unsubscribeHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /inválido/);
});
