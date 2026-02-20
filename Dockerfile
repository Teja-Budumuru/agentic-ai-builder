FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./

COPY packages ./packages
COPY main.ts .
COPY tsconfig.json ./

RUN npm install

RUN npm run db:generate

CMD ["npm", "start"]