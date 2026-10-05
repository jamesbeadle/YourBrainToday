import { describe, expect, it } from "vitest";
import { describeReadingFailure } from "./describeReadingFailure";

describe("describeReadingFailure", () => {
  it("keeps the message of an Error", () => {
    expect(
      describeReadingFailure(new Error("The reply held no update_model call")),
    ).toBe("The reply held no update_model call");
  });

  it("reads a Supabase error object, which is not an Error, with its details", () => {
    const postgrestError = {
      message:
        'duplicate key value violates unique constraint "brain_pages_brain_id_slug_key"',
      details: "Key (brain_id, slug)=(1, start-here) already exists.",
      hint: "",
      code: "23505",
    };
    expect(describeReadingFailure(postgrestError)).toBe(
      'duplicate key value violates unique constraint "brain_pages_brain_id_slug_key" (Key (brain_id, slug)=(1, start-here) already exists.)',
    );
  });

  it("reads a Supabase error object without details by its message alone", () => {
    expect(
      describeReadingFailure({ message: "Object not found", details: "" }),
    ).toBe("Object not found");
  });

  it("falls back for anything without a message", () => {
    expect(describeReadingFailure(undefined)).toBe("Unknown failure");
    expect(describeReadingFailure("stopped")).toBe("Unknown failure");
    expect(describeReadingFailure({ code: "500" })).toBe("Unknown failure");
  });

  it("cuts a long reason to the length the row keeps", () => {
    expect(describeReadingFailure(new Error("x".repeat(400)))).toHaveLength(
      300,
    );
  });
});
