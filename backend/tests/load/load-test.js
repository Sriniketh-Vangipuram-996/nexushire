import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 2,
  duration: "5s",
};

export default function () {
  const res = http.get("http://localhost:5000/api/auth/profile");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}