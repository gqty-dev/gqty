export const convertHeadersInput = (headers?: string[]) => {
  if (!headers?.length) return;

  const headersObject: Record<string, string> = {};

  for (const header of headers) {
    const [key, value] = header.trim().split(/\s*:\s*/);

    if (key && value) {
      headersObject[key] = value;
    }
  }

  if (Object.keys(headersObject).length === 0) return;

  return headersObject;
};
