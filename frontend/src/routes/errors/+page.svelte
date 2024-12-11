<script>
  let { data } = $props();
  let errors = data.errors;
</script>

<main class="p-4 table-xs table-zebra">
  <table class="table">
    <thead>
      <tr>
        <td>Time</td>
        <td>Error</td>
      </tr>
    </thead>
    <tbody>
      {#each errors as error}
        <tr>
          <td>{error.time}</td>
          <td>{error.message}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
