# `permissioning-city-engine/scripts`

- Bash scripts for frequently used commands are defined in `scripts` directory.
  - Prod & Dev - `backup.sh`
    - Creates a tar file for `data/postgres_data` directory to backup PostgreSQL data.
  - Prod & Dev - `clear-database.sh`
    - Runs `backup.sh` and removes `data/postgres_data` directory.
  - Prod & Dev - `clear-redis-restart.sh`
    - Runs `backup.sh` and stops all containers and remove contents of `data/redis` directory and finally restarts all containers.
  - Prod & Dev - `deploy.sh`
    - Pulls the latest code from the prod branch and builds and restarts the containers.
  - Prod & Dev - `prune-docker.sh`
    - Prunes unused docker data from the host system.
  - Dev - `prepare-sdk.sh`
    - Prepares SDK development for submodule `ptc-sdk`.
    - Copies files needed for SDK development in the dev environment.
