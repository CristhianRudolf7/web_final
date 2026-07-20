// Prueba de carga del endpoint de lectura rápida (cacheado).
// Objetivo del Sprint 6: la latencia p(95) de la API de lectura debe
// mantenerse por debajo de 500 ms bajo concurrencia.
//
// Uso:
//   k6 run -e BASE_URL=http://localhost:8000 -e ACCESS_TOKEN=<jwt> \
//       -e SUBLOTE_ID=<uuid> perf_tests/k6_lectura_ultimo_estado.js
//
// El ACCESS_TOKEN se pasa como cookie porque la autenticación del backend
// usa JWT en cookies HttpOnly (ver usuarios/auth_backends.py).

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN;
const SUBLOTE_ID = __ENV.SUBLOTE_ID;

const latenciaLectura = new Trend('latencia_ultimo_estado', true);

export const options = {
  scenarios: {
    carga_sostenida: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const params = {
    headers: { Cookie: `access_token=${ACCESS_TOKEN}` },
  };

  const res = http.get(`${BASE_URL}/api/sublotes/${SUBLOTE_ID}/ultimo-estado/`, params);

  latenciaLectura.add(res.timings.duration);

  check(res, {
    'status es 200': (r) => r.status === 200,
    'latencia < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.2);
}
