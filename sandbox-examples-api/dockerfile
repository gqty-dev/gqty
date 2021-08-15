FROM quay.io/bitnami/node:14

EXPOSE 8090

RUN npm install -g pnpm

WORKDIR /home/gqty

COPY package.json /home/gqty/

RUN pnpm i

COPY prisma /home/gqty/prisma

RUN pnpm exec prisma generate

COPY src /home/gqty/src

RUN pnpm exec tsup

COPY tsconfig.json /home/gqty/

RUN pnpm exec tsc

ENV NODE_ENV=production

CMD node ./dist/index.js