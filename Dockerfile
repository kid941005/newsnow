FROM node:23-bookworm-slim
WORKDIR /usr/app
COPY dist/output ./output
ENV HOST=0.0.0.0 PORT=4444 NODE_ENV=production
EXPOSE 4444
CMD ["node", "output/server/index.mjs"]
