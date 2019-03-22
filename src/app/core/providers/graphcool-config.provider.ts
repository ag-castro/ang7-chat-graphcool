import { InjectionToken } from '@angular/core';

const graphcoolID = 'cjtj2826h38ib0145adv7h4fw';

export interface GraphcoolConfig {
  simpleAPI: string;
  subscriptionsAPI: string;
  fileAPI: string;
  fileDownloadURL: string;
}

export const graphcoolConfig: GraphcoolConfig = {
  simpleAPI: `https://api.graph.cool/simple/v1/${graphcoolID}`,
  subscriptionsAPI: `wss://subscriptions.graph.cool/v1/${graphcoolID}`,
  fileAPI: ` https://api.graph.cool/file/v1/${graphcoolID}`,
  fileDownloadURL: `https://files.graph.cool/${graphcoolID}`
}

export const GRAPHCOOL_CONFIG = new InjectionToken<GraphcoolConfig>(
  'graphcool.config',
  {
    providedIn: 'root',
    factory: () => {
      return graphcoolConfig;
    }
  }
);
