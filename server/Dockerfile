FROM heroiclabs/nakama:latest

ARG VITE_NAKAMA_KEY

COPY nakama-config.yml /nakama/data/local.yml
RUN sed -i "s/server_key:.*/server_key: \"${VITE_NAKAMA_KEY}\"/g" /nakama/data/local.yml
RUN sed -i 's/root@localhost:26257/root@cockroachdb:26257/g' /nakama/data/local.yml

COPY data/modules/src /nakama/data/modules/src