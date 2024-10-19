export const uuid = () => {
  if (self.crypto.randomUUID) {
    return self.crypto.randomUUID();
  } else {
    const array = new Uint32Array(1);
    self.crypto.getRandomValues(array);
    return array[0];
  }
}
