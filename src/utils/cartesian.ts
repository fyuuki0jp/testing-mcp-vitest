export function cartesianProduct(arrays: any[][]): any[][] {
  return arrays.reduce((acc, array) => {
    return acc.flatMap(x => array.map(y => [...x, y]));
  }, [[]] as any[][]);
}