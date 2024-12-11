<script>
  export let data;

  let jobs = data.status;

  async function handleStopAll() {
    await fetch("http://localhost/api/crons/stopall");
    window.location.reload();
  }

  async function handleStartAll() {
    await fetch("http://localhost/api/crons/startall");
    window.location.reload();
  }

  async function handleForceExecute(name) {
    await fetch("http://localhost/api/crons/force/" + name);
    window.location.reload();
  }
</script>

<div class="container mx-auto p-4 space-y-4">
  <button on:click={handleStartAll} class="btn btn-success">Start All Jobs</button>
  <button on:click={handleStopAll} class="btn btn-error">Stop All Jobs</button>
</div>
<div class="container mx-auto p-4 space-y-4 flex flex-wrap justify-evenly">
  {#each jobs as job}
    <div class="card bg-base-100 shadow-md w-96">
      <div class="card-body">
        <h2 class="card-title text-lg font-bold text-primary">{job.name}</h2>
        {#if job.description}
          <p class="italic text-xs">
            {job.description}
          </p>
        {/if}
        <p>
          <span class="font-semibold">Crontime:</span>
          {job.cronTime}
        </p>
        <p>
          <span class="font-semibold">Running:</span>
          <span class={job.isRunning ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
            {job.isRunning ? "Yes" : "No"}
          </span>
        </p>
        <p>
          <span class="font-semibold">Last Execution:</span>
          {new Date(job.lastExecution).toLocaleString()}
        </p>
        <p>
          <span class="font-semibold">Next Execution:</span>
          {new Date(job.nextExecution).toLocaleString()}
        </p>

        <div>
          <button on:click={handleForceExecute(job.name)} class="btn btn-primary">Force Execute</button>
        </div>
      </div>
    </div>
  {/each}
</div>
