FROM node:22-alpine AS builder
RUN apk add --no-cache git
RUN git clone --depth 1 --branch deploy/amvera-web --single-branch https://github.com/misibu/NevaBook.git /repo
WORKDIR /repo/web
RUN npm install
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/web/.next/standalone ./
COPY --from=builder /repo/web/.next/static ./.next/static
COPY --from=builder /repo/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
