<script>
  export let data;

  const record = data.record.properties;
  console.log(data);
</script>

<div class="container mx-auto p-4">
  <div class="breadcrumbs text-sm">
    <ul>
      <li>HubSpot</li>
      <li>{data.module}</li>
      <li>{data.id}</li>
    </ul>
  </div>
  <div class="my-4">
    <h2 class="card-title text-4xl">
      {record.firstname}
      {record.lastname}
    </h2>
    <div class="flex flex-col">
      <div class="text-4xl">{record.name}</div>
      <a class="underline italic text-blue-500" href={"https://" + record.domain}>{record.domain}</a>
    </div>

    {#if record.amount}
      <div>
        <div class="text-4xl">{record.dealname}</div>
        <div class="text-2xl">{`$${record.amount}`}</div>
      </div>
    {/if}
    {#if record.location_name}
      <div>
        <div class="text-4xl">{record.location_name}</div>
      </div>
    {/if}
    <!-- You can add more prominent details here if needed -->
  </div>
  <h2 class="text-xl font-semibold mb-2">Record Details</h2>
  <div class="overflow-x-auto">
    <table class="table table-xs table-zebra w-full">
      <thead>
        <tr>
          <th>Property (Api Name)</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(record) as [key, value]}
          {#if value}
            <tr>
              <td class="font-semibold">{key}</td>
              <td>
                {#if key == "associatedcompanyid"}
                  <a href={`/hubspot/companies/${value}`} target="_blank" class="text-blue-500 underline italic">{value}</a>
                {:else}
                  {value}
                {/if}
              </td>
            </tr>
          {/if}
        {/each}

        <tr>
          <td>EMPTY VALUES</td>
        </tr>

        {#each Object.entries(record) as [key, value]}
          {#if !value}
            <tr>
              <td class="font-semibold">{key}</td>
              <td>{value}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>
