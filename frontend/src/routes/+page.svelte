<script>
  export let data;

  let hsModule = "";
  let hsId = "";
</script>

<div>
  <div class="p-4">
    <a class="btn btn-primary" href="/crons">Crons</a>
    <a class="btn btn-primary" href="/logs">Logs</a>
  </div>

  <div class="p-4">
    <div class="mb-2">Search HubSpot Records</div>
    <div class="join">
      <select bind:value={hsModule} class="select select-bordered join-item">
        <option value="">Record Type</option>
        <option value="contacts">Contacts</option>
        <option value="companies">Companies</option>
        <option value="deals">Deals</option>
        <option value="locations">Locations</option>
      </select>
      <input type="text" bind:value={hsId} class="input input-bordered join-item" placeholder={`record id`} />
      <button
        class="btn btn-primary join-item"
        on:click={() => {
          window.location.href = `/hubspot/${hsModule}/${hsId}`;
        }}>Search</button
      >
    </div>
  </div>
</div>
