import { defineEventHandler, getQuery } from 'h3';
import { mockDataHop } from '../../server/data/mock-data-hop';
import { mockDataRol } from '../../server/data/mock-data-rol';
import { mockDataRec } from '../../server/data/mock-data-rec';

export default defineEventHandler(async (event) => {
  const { type } = getQuery(event);

  let data : Array<any> = [];
  switch (type) {
    case 'hop':
      data = mockDataHop;
      break;
    case 'rol':
      data = mockDataRol;
      break;
    case 'rec':
      data = mockDataRec;
      break;
    default:
      data = [];
  }

  return data;
});
