FROM denoland/deno:1.31.1
WORKDIR /usr/src/samue.land
COPY . .
EXPOSE 443
CMD deno task run