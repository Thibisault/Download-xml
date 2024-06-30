export const mockDataRol = Array.from({ length: 20 }, (_, idPostIndex) => ({
    IdPost: (300000 + idPostIndex).toString(),
    CodCol: Array.from({ length: 10 }, (_, codColIndex) => 
      (idPostIndex * 10 + 100 + codColIndex).toString()
    )
  }));
  