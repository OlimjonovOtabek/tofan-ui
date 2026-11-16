import backendProxy from '../../proxy.staging.conf.json' with { type: 'json' };
import { GA4_PROXY_CONTEXT, ga4ProxyEntry } from './ga4.mjs';

export default {
  [GA4_PROXY_CONTEXT]: ga4ProxyEntry(),
  ...backendProxy,
};
