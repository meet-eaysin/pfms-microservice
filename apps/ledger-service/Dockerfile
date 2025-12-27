FROM node:20-alpine AS base
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

FROM base AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages ./packages
COPY apps/ledger-service ./apps/ledger-service
RUN yarn install --immutable
RUN yarn workspace @pfms/ledger-service prisma generate
RUN yarn workspace @pfms/ledger-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/ledger-service/dist ./apps/ledger-service/dist
COPY --from=builder /app/apps/ledger-service/package.json ./apps/ledger-service/
COPY --from=builder /app/apps/ledger-service/prisma ./apps/ledger-service/prisma
EXPOSE 3014
CMD ["node", "apps/ledger-service/dist/main.js"]
