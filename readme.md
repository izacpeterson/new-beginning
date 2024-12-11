# Internal Systems v2

## Crons

- HubSpot ALN
  - Frequency: Every hour
  - Fetch data from ALN and upload to HubSpot Companies

## API Endpoints

- /cron
  - /status
    - Gets the status of all runnings crons
  - /stopall
    - Stops all crons
  - /startall
    - Start all crons
  - /force/:name
    - Force a cron to run given its name
