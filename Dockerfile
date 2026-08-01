# Multi-stage image build (architecture §2, loop-2 m-8; story S6 AC1).
#
# Build stage runs ONCE, natively on the buildx build host
# (--platform=$BUILDPLATFORM), so under `buildx --platform linux/amd64,linux/arm64`
# the arm64 leg never runs npm/vite under QEMU (PRD R1 mitigation). Each
# per-platform runtime stage only COPYs dist/ out of it.
#
# Both FROM lines are digest-pinned (SEC-05, security AC #8). Freshness arrives
# via reviewed Dependabot `docker`-ecosystem digest-bump PRs (FR-16 as amended,
# PA-1) — never silent tag drift. Node major follows .nvmrc (node 20).

FROM --platform=$BUILDPLATFORM docker.io/library/node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# validate:content (services.json schema gate) + vite build + prerender
RUN npm run build

# Runtime stage: nginx-unprivileged (non-root uid 101, listens 8080, pid + cache
# under /tmp — compatible with readOnlyRootFilesystem + emptyDir /tmp, SEC-08).
# COPY-only: no RUN, no USER, no package installs in this stage (TC-S6-01).
FROM docker.io/nginxinc/nginx-unprivileged:stable-alpine@sha256:44e36330f74d4f3a1d4e222acca9e23b401fb87811a7597024502bb759c4dd49
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
