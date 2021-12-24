import * as jsii from 'jsii-reflect';
import { DocsSchema } from './schema';

export function extractDocs(docs: jsii.Docs): DocsSchema {
  return filterUndefined({
    // ignore defaults and empty strings to save space
    summary: docs.summary.length > 0 ? docs.summary : undefined,
    remarks: docs.remarks.length > 0 ? docs.remarks : undefined,
    see: docs.link.length > 0 ? docs.link : undefined,
    deprecated: docs.deprecated === true ? true : undefined,
    deprecationReason: docs.deprecationReason,
  });
}

function filterUndefined(obj: any) {
  const ret: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      ret[k] = v;
    }
  }
  return ret;
}
