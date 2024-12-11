<script>
  let { data } = $props();
  let logs = data.logs;
</script>

<main class="p-4 table-xs table-zebra">
  <table class="table">
    <thead>
      <tr>
        <td>Level</td>
        <td>Time</td>
        <td>Message</td>
      </tr>
    </thead>
    <tbody>
      {#each logs as log}
        <tr>
          <td>{log.level}</td>
          <td>{log.time}</td>
          <td>{log.message}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
