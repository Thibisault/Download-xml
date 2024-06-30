import { Builder, parseStringPromise } from 'xml2js';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

const getDirectoryPath = (filename: string): string => {
  if (filename.includes('hop')) {
    return './data/hop';
  }
  if (filename.includes('rec')) {
    return './data/rec';
  }
  if (filename.includes('rol')) {
    return './data/rol';
  }
  return './data';
};

export default {
  async createXml(filename: string, data: any) {
    const builder = new Builder();
    const xml = builder.buildObject(data);
    const directoryPath = getDirectoryPath(filename);
    await writeFile(path.join(directoryPath, `${filename}.xml`), xml);
  },

  async readXml(filename: string) {
    const directoryPath = getDirectoryPath(filename);
    const data = await readFile(path.join(directoryPath, `${filename}.xml`), 'utf8');
    return data;
  },

  async updateXml(filename: any, updatedFields: any) {
    const directoryPath = getDirectoryPath(filename);
    const data = await readFile(path.join(directoryPath, `${filename}.xml`), 'utf8');
    const jsonData = await parseStringPromise(data);

    const updatedJsonData = { ...jsonData, ...updatedFields };

    const builder = new Builder();
    const updatedXml = builder.buildObject(updatedJsonData);
    await writeFile(path.join(directoryPath, `${filename}.xml`), updatedXml);
  },
  
  async deleteXml(filename: string) {
    const directoryPath = getDirectoryPath(filename);
    await unlink(path.join(directoryPath, `${filename}.xml`));
  },

  async downloadXml(filename: string) {
    const directoryPath = getDirectoryPath(filename);
    const data = await readFile(path.join(directoryPath, `${filename}.xml`));
    return data;
  },

  async listXmlFiles(filename: string) {
    const directoryPath = getDirectoryPath(filename);
    const files = await readdir(directoryPath);
    return files.filter(file => path.extname(file) === '.xml').map(file => path.basename(file, '.xml'));
  }
};
