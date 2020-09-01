FROM hayd/alpine-deno:1.3.0

# 9000 for webserver, 9001 for websocket
EXPOSE 9000 9001

WORKDIR /app

USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY src/deps.ts src/deps.ts
RUN deno cache src/deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/index.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "src/index.ts"]