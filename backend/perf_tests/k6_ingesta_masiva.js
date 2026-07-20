// Prueba de carga del endpoint de ingesta masiva de sensores.
// Objetivo del Sprint 6: soportar 50,000 lecturas/hora (~14 lecturas/seg)
// sin bloquear el hilo principal de Django (bulk_create + Celery).
//
// Uso:
//   k6 run -e BASE_URL=http://localhost:8000 -e ACCESS_TOKEN=<jwt> \
//       -e SUBLOTE_ID=<uuid> perf_tests/k6_ingesta_masiva.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN;
const SUBLOTE_ID = __ENV.SUBLOTE_ID;
const LOTE_POR_PETICION = 500; // 500 lecturas x 28 peticiones/min ≈ 50,000/hora

export const options = {
  scenarios: {
    ingesta_horaria_simulada: {
      executor: 'constant-arrival-rate',
      rate: 28,
      timeUnit: '1m',
      duration: '3m',
      preAllocatedVUs: 10,
      maxVUs: 30,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

function generarLote() {
  const lecturas = [];
  for (let i = 0; i < LOTE_POR_PETICION; i++) {
    lecturas.push({
      sublote: SUBLOTE_ID,
      temperatura: (20 + Math.random() * 10).toFixed(2),
      humedad: (25 + Math.random() * 50).toFixed(2),
      ph: (5.5 + Math.random() * 3).toFixed(2),
    });
  }
  return { lecturas };
}

export default function () {
  const params = {
    headers: {
      Cookie: `access_token=${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(
    `${BASE_URL}/api/sensores/ingesta-masiva/`,
    JSON.stringify(generarLote()),
    params
  );

  check(res, {
    'status es 201': (r) => r.status === 201,
    'latencia < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
