export const mockDataHop = Array.from({ length: 20 }, (_, idPostIndex) => ({
  IdPost: (100000 + idPostIndex).toString(),
  CodCol: Array.from({ length: 10 }, (_, codColIndex) => 
    (idPostIndex * 10 + 100 + codColIndex).toString()
  )
}));
