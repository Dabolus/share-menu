export const updateStringAttribute = (
  el: Element,
  qualifiedName: string,
  value: string | null | undefined,
) => {
  if (value === null || value === undefined) {
    el.removeAttribute(qualifiedName);
  } else {
    el.setAttribute(qualifiedName, value);
  }
};

export const updateArrayAttribute = (
  el: Element,
  qualifiedName: string,
  values: string[] | null | undefined,
) => {
  if (!values?.length) {
    el.removeAttribute(qualifiedName);
  } else {
    el.setAttribute(qualifiedName, values.join(','));
  }
};

export const updateBooleanAttribute = (
  el: Element,
  qualifiedName: string,
  value: boolean | null | undefined,
) => {
  if (value) {
    el.setAttribute(qualifiedName, '');
  } else {
    el.removeAttribute(qualifiedName);
  }
};
