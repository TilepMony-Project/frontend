type KeyContainer = Record<string, unknown> | unknown[];

function isKeyContainer(value: unknown): value is KeyContainer {
  return typeof value === "object" && value !== null;
}

export function updateKeys<T>(data: T): T {
  function updateKey(target: unknown): void {
    if (!isKeyContainer(target)) {
      return;
    }

    if (Array.isArray(target)) {
      target.forEach(updateKey);
      return;
    }

    Object.entries(target).forEach(([key, value]) => {
      if (key === "key") {
        (target as Record<string, unknown>)[key] = crypto.randomUUID();
      } else {
        updateKey(value);
      }
    });
  }

  updateKey(data);

  return data;
}
