import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 100 },   // ramp up to 100 users
        { duration: '1m', target: 500 },    // ramp up to 500 users
        { duration: '1m', target: 1000 },   // peak at 1000 users
        { duration: '30s', target: 0 },     // ramp down
    ],
};

export default function () {
    // 1️⃣ Login
    const loginRes = http.post('http://localhost:5000/api/auth/login', JSON.stringify({
        email: 'testuser@example.com',
        password: 'TestPassword123'
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, { 'login success': (r) => r.status === 200 });

    const token = loginRes.json('token'); // adjust if your API returns differently

    // 2️⃣ /me endpoint
    const meRes = http.get('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    check(meRes, { 'me success': (r) => r.status === 200 });

    sleep(1); // simulate user think time
}