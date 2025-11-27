import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHasChildError } from "./use-has-child-error";
import { useJsonForms } from "@jsonforms/react";
import type { UISchemaElement } from "../../types/uischema";

vi.mock("@jsonforms/react", () => ({
  useJsonForms: vi.fn(),
}));

const useJsonFormsMock = vi.mocked(useJsonForms);

describe("useHasChildError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when no errors are present", () => {
    useJsonFormsMock.mockReturnValue({ core: { errors: [] } });

    const result = useHasChildError([{ scope: "#/properties/name" }]);
    expect(result).toBe(false);
  });

  it("returns false when childElements is empty", () => {
    useJsonFormsMock.mockReturnValue({
      core: { errors: [{ instancePath: "/name" }] },
    });

    const result = useHasChildError([]);
    expect(result).toBe(false);
  });

  it("returns true when a matching error exists", () => {
    useJsonFormsMock.mockReturnValue({
      core: { errors: [{ instancePath: "/name" }] },
    });

    const result = useHasChildError([{ scope: "#/properties/name" }]);
    expect(result).toBe(true);
  });

  it("returns false when no matching error exists", () => {
    useJsonFormsMock.mockReturnValue({
      core: { errors: [{ instancePath: "/age" }] },
    });

    const result = useHasChildError([{ scope: "#/properties/name" }]);
    expect(result).toBe(false);
  });

  it("returns true for required errors with missing property", () => {
    useJsonFormsMock.mockReturnValue({
      core: {
        errors: [
          {
            keyword: "required",
            instancePath: "/user",
            params: { missingProperty: "name" },
          },
        ],
      },
    });

    const result = useHasChildError([{ scope: "#/properties/user/properties/name" }]);
    expect(result).toBe(true);
  });

  it("ignores child elements without a scope", () => {
    useJsonFormsMock.mockReturnValue({
      core: { errors: [{ instancePath: "/name" }] },
    });

    const result = useHasChildError([{ type: "Label", text: "Test" } satisfies UISchemaElement]);
    expect(result).toBe(false);
  });

  it("returns false when core is undefined", () => {
    useJsonFormsMock.mockReturnValue({});
    const result = useHasChildError([{ scope: "#/properties/name" }]);
    expect(result).toBe(false);
  });

  it("returns false when childElements is undefined", () => {
    useJsonFormsMock.mockReturnValue({ core: { errors: [{ instancePath: "/name" }] } });
    const result = useHasChildError();
    expect(result).toBe(false);
  });
});
