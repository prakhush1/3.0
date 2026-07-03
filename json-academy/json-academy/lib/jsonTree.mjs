export function buildJsonTree(value) {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      children: value.map((item, index) => ({
        key: index,
        node: buildJsonTree(item),
      })),
    };
  }

  if (value && typeof value === 'object') {
    return {
      type: 'object',
      children: Object.entries(value).map(([key, childValue]) => ({
        key,
        node: buildJsonTree(childValue),
      })),
    };
  }

  return { type: 'primitive', value };
}
