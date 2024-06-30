export const mockIdPceData = Array.from({ length: Math.floor(Math.random() * 11) + 10 }, (_, index) => ({
  idPce: (300000 + index).toString()
}));
