export const mockDataRec = Array.from({ length: 150 }, (_, idPostIndex) => ({
    IdPost: (200000 + idPostIndex).toString(),
    CodCol: Array.from({ length: 10 }, (_, codColIndex) => 
      (idPostIndex * 10 + 100 + codColIndex).toString()
    )
  }));
  