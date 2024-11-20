FROM node:18-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies (production only)
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build


FROM node:18-alpine

WORKDIR /app

COPY --from=build /app ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./.env

EXPOSE 80

ENV PORT 80
ENV NODE_ENV production

# Start the Next.js app
CMD ["yarn", "run", "start"]
