const cssVar = getComputedStyle(document.documentElement);
export const styling = {
    borderColor: cssVar.getPropertyValue('--accent'),
    backgroundColor: cssVar.getPropertyValue('--accentTransparent'),
    borderWidth: 2,
    borderRadius: 10,
    pointRadius: 5,
    pointHoverRadius: 10,
};

