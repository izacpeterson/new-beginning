<script>
  let key = $state("");
</script>

<div class="p-4">
  <button
    onclick={async () => {
      let response = await fetch("http://localhost/api/auth/newApiKey");
      let jsonData = await response.json();
      key = jsonData.key;
      //   console.log(key);
      //   alert(key);
    }}
    class="btn btn-primary">Generate New Api Key</button
  >
  {#if key !== ""}
    <div>New API Key: {key}</div>
  {/if}
</div>
