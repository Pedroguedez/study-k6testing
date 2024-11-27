import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts_duration', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    get_contacts_duration: ['p(95)<5700'],
    content_OK: ['rate>0.95']
  },
  stages: [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '30s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://dogapi.dog/api/v2/breeds';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === 200);

  check(res, {
    'GET Contacts - Status 200': () => res.status === 200
  });
}
