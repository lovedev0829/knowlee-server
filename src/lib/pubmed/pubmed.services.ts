import https from 'https';

export const entryPoints = {
    esearch: `esearch.fcgi?`,
    esummary: `esummary.fcgi?`,
    efetch: `efetch.fcgi?`,
    elink: `elink.fcgi?`,
};

export const ApiKey = process.env.PUBMED_API_KEY;

const hostname = 'eutils.ncbi.nlm.nih.gov';
const baseUrl = '/entrez/eutils/';

export async function getRequest(
    entryPoint: string,
    args: string | undefined,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path: `${baseUrl}${entryPoint}${args}`,
        method: 'GET',
      };
      
      const body: Uint8Array[] = [];
  
      const req = https.request(options, res => {
        res.on('data', chunk => body.push(chunk));
        res.on('end', () => {
          const data = Buffer.concat(body).toString();
          resolve(data);
        });
      });
      req.on('error', e => {
        reject(e);
      });
      req.end();
    });
  }
  
  export default getRequest;