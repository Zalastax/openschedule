export function forPair<T>(f: (a: T, b: T) => void, arr: T[]) {
  for (let i = 0; i < arr.length - 1; i++) {
    f(arr[i], arr[i + 1])
  }
}
